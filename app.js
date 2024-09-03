// app.js
const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');
const roomCodeInput = document.getElementById('roomCode');
const joinButton = document.getElementById('join');
const endCallButton = document.getElementById('endCall');
const socket = io();

let localStream;
let peerConnection;
const configuration = {
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
};

// Function to start the call
async function startCall() {
    const roomCode = roomCodeInput.value;
    if (!roomCode) {
        alert('Please enter a room code.');
        return;
    }

    localStream = await navigator.mediaDevices.getUserMedia({ video: true });
    localVideo.srcObject = localStream;

    peerConnection = new RTCPeerConnection(configuration);

    peerConnection.addStream(localStream);

    peerConnection.ontrack = (event) => {
        remoteVideo.srcObject = event.streams[0];
    };

    peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
            socket.emit('ice-candidate', event.candidate, roomCode);
        }
    };

    socket.on('offer', async (offer) => {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        socket.emit('answer', answer, roomCode);
    });

    socket.on('answer', async (answer) => {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
    });

    socket.on('ice-candidate', (candidate) => {
        peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    });

    socket.emit('join', roomCode);
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    socket.emit('offer', offer, roomCode);
}

// Function to end the call
function endCall() {
    if (peerConnection) {
        peerConnection.close();
        peerConnection = null;
    }

    if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
        localStream = null;
    }

    remoteVideo.srcObject = null;
    localVideo.srcObject = null;

    // Optionally notify the server about the disconnection
    const roomCode = roomCodeInput.value;
    if (roomCode) {
        socket.emit('leave', roomCode);
    }
}

joinButton.addEventListener('click', startCall);
endCallButton.addEventListener('click', endCall);

// Handle disconnection from the server
socket.on('disconnect', () => {
    endCall();
});
