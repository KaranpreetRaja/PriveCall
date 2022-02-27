const socket = io('/') //socket = root path
const videoGrid = document.getElementById('video-format')


const handle = NICKNAME;
const message = document.getElementById('input')
const button = document.getElementById('send')
const output = document.getElementById('messages')
const insight = document.getElementById('typinginsight')

button.addEventListener('click', function(){
    socket.emit('chat', {
        message: message.value,
        handle:handle
    })
})

message.addEventListener('keypress', function(){
    socket.emit("typing", handle)
})

socket.on('chat', function(data){
    insight.innerHTML = ""
    output.innerHTML += '<li><strong>' + data.handle + ':</strong> ' + data.message + '</li>'
    message.value = ''
})

socket.on('typing', function(data){
    insight.innerHTML = '<p><em>' + data + ' is typing...</em></p>'
})

const myPeer = new Peer(undefined, {
    host: '/',
    port: '3001',
    path: '/room'
})

const myVideo = document.createElement('video')
myVideo.muted = true
const peers = {}
navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    addVideoStream(myVideo, stream)	
  myPeer.on('call', call => {	
    call.answer(stream)	
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
      addVideoStream(video, userVideoStream)
      peers[call.peer] = call
    })
    call.on('close', () => {
        video.remove()
    })	
  })

    socket.on('another-user-connected', userId => {
        connectToNewUser(userId, stream)
        console.log('User Connected: ' + userId)
    })

})


socket.on('user-disconnected', userId => {
    if (peers[userId]) peers[userId].close()
    else console.log('user dont exist')
})

myPeer.on('open', id => {
    socket.emit('join-room-event', ROOM_ID, id)
})


function connectToNewUser(userId, stream) {
    console.log('Connecting new user')
    console.log('Streaming new user video 1')
    const call = myPeer.call(userId, stream)
    const video = document.createElement('video')
    console.log('Streaming new user video 2')
    call.on('stream', userVideoStream => {
        console.log('Streaming new user video 3')
        addVideoStream(video, userVideoStream)
    })
    call.on('close', () => {
        video.remove()
    })

    peers[userId] = call
}

function addVideoStream(video, stream) {
    console.log('Streaming new user video f')
    video.srcObject = stream
    video.addEventListener('loadedmetadata', () => {
        video.play()
    })
    videoGrid.append(video)
}
