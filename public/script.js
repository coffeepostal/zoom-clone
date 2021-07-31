const socket = io('/')
const videoGrid = document.getElementById('video-grid')
const peer = new Peer(undefined, {
    host: '/',
    port: '3001'
})

const peers = {}

// Create my video element
const myVideo = document.createElement('video')
myVideo.muted = true

// Connect to my video camera/audio
navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {

    // Once stream has loaded, add it to a video object and append that to UI
    addVideoStream(myVideo, stream)

    // When you receive a call, answer it
    peer.on('call', call => {
        call.answer(stream)

        // Create a video object for income call
        const videoOtherUser = document.createElement('video')

        // Add new user to video grid UI
        call.on('stream', userVideoStream => {
            addVideoStream(videoOtherUser, userVideoStream)
        })
    })

    // Let the other users know a user has joined their room
    socket.on('user-connected', userId => {
        connectToNewUser(userId, stream)
    })
})

// Listen for user disconnecting from call
socket.on('user-disconnected', userId => {
    // If the user still exists, close that stream object
    if (peers[userId]) peers[userId].close()
})

// When a user connects to the peer server, join room with provided id
peer.on('open', id => {
    // Let server know that a user has joined a room
    socket.emit('join-room', ROOM_ID, id)

})

// When a new user connects, send other users in room their video stream
function connectToNewUser(userId, stream) {
    // Use PeerJS to connect new user
    const call = peer.call(userId, stream)
    // Create a new video element
    const newVideoElement = document.createElement('video')
    // When PeerJS gets a new stream, create a new video elem for stream
    call.on('stream', userVideoStream => {
        addVideoStream(newVideoElement, userVideoStream)
    })
    // When a user closes their stream
    call.on('close', () => {
        newVideoElement.remove()
    })

    peers[userId] = call
}

// Function to add video stream to UI
function addVideoStream(video, stream) {
    // Load stream into video object
    video.srcObject = stream
    // Once the stream has been loaded
    video.addEventListener('loadedmetadata', () => {
        // Play that video
        video.play()
    })
    // Append this video to UI
    videoGrid.append(video)
}