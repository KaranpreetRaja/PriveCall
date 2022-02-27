const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const {v4: uuidv4} = require('uuid')

const { PeerServer } = require('peer');
const peerServer = PeerServer( {port: 3001, path: '/room'})

app.set('view engine', 'ejs')
app.use('/public', express.static('public'))

app.get('/', (req, res) => {
  res.render('index')
})

app.get('/room', (req, res) => {
  res.redirect(`/room/${uuidv4()}` + '?nickname=' + req.query.nickname)
})

app.get('/room/:room', (req, res) => {
  res.render('room', { roomID: req.params.room, nickname: req.query.nickname })
})

io.on('connection', socket => {
    console.log("user connected")
    socket.on('join-room-event', (roomID, userId) => {
        console.log("joined room")
        socket.join(roomID)
        socket.to(roomID).emit('another-user-connected', userId)

        socket.on('chat', function(data){
            io.sockets.to(roomID).emit('chat', data)
        })

        socket.on('typing', function(data){
            socket.broadcast.emit('typing', data)
            console.log("currently typing")
        })
    
        socket.on('disconnect', () => {
            console.log('a user has disconnected')
            socket.to(roomID).emit('user-disconnected', userId)
        })
    })
})

server.listen(3000)