// Server creation and configuration
const http = require('http');
const app = require('./src/app');
const { log } = require('console');
const { Socket } = require('socket.io');
const ChatMessage = require ('./src/models/chat-message.model')

// Config .env
require('dotenv').config();


//config base de datos
require('./src/config/db')

// Server creation
const server = http.createServer(app);

const PORT = process.env.PORT || 3000;
server.listen(PORT);

// Listeners
server.on('listening', () => {
    console.log(`Server listening on port ${PORT}`);
});

server.on('error', (error) => {
    console.log(error);
});

//Config WSocket Server
const io = require('socket.io')(server, {
    cors: {
        origin: '*'
    }
})

//canal de comunicacion
io.on('connection', async (socket) => {
    console.log('se conecto un nuevo cliente')

    //recupero muchos mnsajes
    const arr = await ChatMessage.find().sort({ createdAt: -1 }).limit(5)

    socket.emit('chat_init', {
        message: 'conexion exitosa bro!',
        socketId: socket.id,
        chatMessages: arr
    })

    
    socket.broadcast.emit('chat_message_server', {
        username: 'INFO',
        message:' se ha conectado un nuevo usuario'
    })
    
    //emitimos cuantos clientes hay online
    io.emit('clients_online', io.engine.clientsCount)
    
    socket.on('chat_message_client', async (data) => {
                //console.log(data);
        await ChatMessage.create(data)
        io.emit('chat_message_server', data)
    })

    socket.on('disconnect', () => {
        io.emit('chat_message_server', {
            username: 'INFO',
            message:'Se ha desconectado un usuario'
        })
        io.emit('clients_online', io.engine.clientsCount)
    })






})