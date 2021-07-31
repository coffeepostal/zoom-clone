const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const { v4: uuidV4 } = require('uuid')

// Tell Express to use EJS templating and where the code will go
app.set('view engine', 'ejs')
app.use(express.static('public'))

// Redirect the best URL to a randomly generated room
app.get('/', (req, res) => {
    res.redirect(`/${uuidV4()}`);
})

// Route the rooms
app.get('/:room', (req, res) => {
    res.render('room', { roomId: req.params.room });
});

// Tell Socket.io what do do on connection
io.on('connection', socket => {
    socket.on('join-room', (roomId, userId) => {
        socket.join(roomId)
        socket.broadcast.to(roomId).emit('user-connected', userId)
        socket.on('disconnect', () => {
            socket.broadcast.to(roomId).emit('user-disconnected', userId)
        })
    })
})

// Start server
server.listen(3000, () => {
    console.log(`📡 Server started on port: 3000`)
})