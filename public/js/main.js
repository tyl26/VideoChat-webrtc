const socket = io();

const { room, username } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

console.log("room:", room, username);
const myVideo = document.getElementById("localVideo");
const userName = document.getElementById("username");
const shareBtn = document.getElementById("btn");
const stopSharing = document.getElementById("stop");
const cameraBtn = document.getElementById("cameraBtn");
const micBtn = document.getElementById("micBtn");

stopSharing.disabled = true;
let Video = [];
let usernames = [];
let isScreenSharing = false;

let localstream;
let peerConnections = new Map();

const servers = {
  iceServers: [
    {
      urls: ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"],
    },
  ],
};

async function getMediaStream() {
  await navigator.mediaDevices
    .getUserMedia({ video: true, audio: true })
    .then((stream) => {
      localstream = stream;
      myVideo.srcObject = localstream;
    })
    .catch((error) => {
      console.error("cannot acces media device", error);
    });
}

//kamera knapp för att användaren ska kunna välja mellan kamera på eller av
cameraBtn.addEventListener("click", () => {
  const videoTrack = localstream
    .getTracks()
    .find((track) => track.kind === "video");

  console.log(videoTrack);
  if (videoTrack.enabled) {
    videoTrack.enabled = false;
    cameraBtn.innerHTML = "camera on";
  } else {
    videoTrack.enabled = true;
    cameraBtn.innerHTML = "camera off";
  }
});

micBtn.addEventListener("click", () => {
  const audioTrack = localstream
    .getTracks()
    .find((track) => track.kind === "audio");

  if (audioTrack.enabled) {
    audioTrack.enabled = false;
    console.log(audioTrack);
    micBtn.innerHTML = "unmute";
  } else {
    audioTrack.enabled = true;
    micBtn.innerHTML = "mute";
    console.log(audioTrack);
  }
});

function createPeerConnection(socketId) {
  console.log(socketId);

  // socketid är andra användarens id som skickas till de i rummet
  const peerConnection = new RTCPeerConnection(servers);
  localstream.getTracks().forEach((track) => {
    peerConnection.addTrack(track, localstream);
  });

  //hanterar iceCandidates for remote
  peerConnection.onicecandidate = function (event) {
    if (event.candidate) {
      socket.emit("candidate", {
        target: socketId,
        caller: socket.id,
        candidate: event.candidate,
      });
    }
  };

  peerConnection.onnegotiationneeded = () => {
    if (isScreenSharing) {
      shareScreen();
    } else {
      createOffer(socketId, peerConnection);
    }
  };

  peerConnection.ontrack = function (event) {
    console.log(event.streams[0]);
    if (document.getElementById(socketId)) return;
    let RemoteVideo = document.createElement("video");
    RemoteVideo.setAttribute("style", "width: 300px; height: 240px;");
    RemoteVideo.id = socketId;
    RemoteVideo.srcObject = event.streams[0];
    RemoteVideo.autoplay = true;
    RemoteVideo.muted = true;
    // RemoteVideo.playsInline = true;
    const div = document.getElementById("remoteVideo");
    div.appendChild(RemoteVideo);
    Video.push(RemoteVideo);
    console.log(RemoteVideo);
  };

  return peerConnection;
}

//startar en screen sharing
async function shareScreen() {
  try {
    stopSharing.disabled = false;
    shareBtn.disabled = true;
    const screenStream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
    });
    const screenTrack = screenStream.getVideoTracks()[0];
    localstream.getVideoTracks()[0].stop();
    localstream.removeTrack(localstream.getVideoTracks()[0]);
    localstream.addTrack(screenTrack);
    myVideo.srcObject = localstream;
    isScreenSharing = true;

    peerConnections.forEach(async (peerConnection, key) => {
      console.log(peerConnection);
      const pc = await peerConnections.get(key);
      const sender = pc.getSenders().find((s) => {
        return s.track.kind === "video";
      });

      sender.replaceTrack(screenTrack);
    });
  } catch (err) {
    console.error("Error sharing screen: ", err);
  }
}
//vid click av start av screen sharing
shareBtn.addEventListener("click", shareScreen);

async function stopScreenShare() {
  if (isScreenSharing) {
    try {
      shareBtn.disabled = false;
      const videoStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      const videoTrack = videoStream.getVideoTracks()[0];
      localstream.getVideoTracks()[0].stop();
      localstream.removeTrack(localstream.getVideoTracks()[0]);
      localstream.addTrack(videoTrack);
      myVideo.srcObject = localstream;
      isScreenSharing = false;

      peerConnections.forEach(async (peerConnection, key) => {
        console.log(peerConnection);
        const pc = await peerConnections.get(key);
        const sender = pc.getSenders().find((s) => {
          return s.track.kind === "video";
        });

        sender.replaceTrack(videoTrack);
      });
    } catch (err) {
      console.error("Error stopping screen share: ", err);
    }
  }
}

stopSharing.addEventListener("click", stopScreenShare);

// den som joinar rummet skapar en offer till de som är i rummet
async function createOffer(socketId, peerConnection) {
  peerConnection
    .createOffer()
    .then((offer) => {
      return peerConnection.setLocalDescription(offer);
    })
    .then(() => {
      const data = {
        target: socketId,
        caller: socket.id,
        sdp: peerConnection.localDescription,
        username: username,
      };
      socket.emit("offer", data);
      console.log("giving the offer", data);
    });
  console.log(
    "🚀 ~ file: main.js:90 ~ createOffer ~ peerConnection:",
    peerConnection
  );
}

//de som är i redan i rumet hanterar offern som skickades från nya user
//och gör det svar med deras data info och skickar svar tillbaka till nya useern
async function handleOffer(offer) {
  //offerns id  och den som hanterar svars id

  if (offer.caller !== offer.target) {
    const peerConnection = createPeerConnection(offer.caller);
    peerConnections.set(offer.caller, peerConnection);

    await peerConnection.setRemoteDescription(
      new RTCSessionDescription(offer.sdp)
    );
    await peerConnection.createAnswer().then((answer) => {
      return peerConnection.setLocalDescription(answer);
    });
    const data = {
      target: offer.caller,
      caller: socket.id,
      sdp: peerConnection.localDescription,
      username: username,
    };
    socket.emit("answer", data);
    console.log(
      "🚀 ~ file: main.js:113 ~ handleOffer ~  data:",
      "giving back the answer",
      data
    );
    console.log(
      "🚀 ~ file: main.js:114 ~ handleOffer ~ peerConnections:",
      peerConnections
    );
  }
}

//när de i rummet har skicakt answer så hanterar offern(nya user)
//svaret och tar emot det och lägger det i deras peerconnection och datan i remotedesc.
async function handleAnswer(answer) {
  // peerConnections.set(answer.caller);
  // remoteUserName.innerHTML = answer.username;
  console.log("🚀 ~ file: main.js:121 ~ handleAnswer ~ answer:", answer);
  console.log(
    "🚀 ~ file: main.js:122 ~ handleAnswer ~ peerConnections:",
    peerConnections
  );
  const connection = await peerConnections.get(answer.caller);
  connection
    .setRemoteDescription(new RTCSessionDescription(answer.sdp))
    .catch((err) => {
      console.log("🚀 ~ file: main.js:126 ~ handleAnswer ~ err:", err);
    });
}

async function handleCandidate(data) {
  console.log(peerConnections);
  console.log(data);
  const connection = await peerConnections.get(data.caller);
  console.log(
    "🚀 ~ file: main.js:121 ~ handleCandidate ~ connection:",
    connection
  );
  connection.addIceCandidate(data.candidate);
  console.log(
    "🚀 ~ file: main.js:123re ~ handleCandidate ~ connection:",
    connection
  );
}

async function leaveRoom(socketid) {
  console.log(peerConnections);

  const disconnect = await peerConnections.get(socketid);
  // const hej = await peerConnections.filter(id => id === socketid);
  console.log(socketid, disconnect);
  if (disconnect) {
    console.log(socketid, disconnect);
    disconnect.close();

    Video.map((video) => {
      console.log(video);
      if (video.id === socketid) {
        video.remove();
      }
    });
  }
}

function init() {
  getMediaStream()
    .then(() => {
      socket.emit("joinRoom", room, username);
      
      socket.on("otherUsersJoined", (sockets) => {
        console.log("andra användare", sockets);
        sockets.forEach((socketId) => {
          const peerConnection = createPeerConnection(socketId);
          peerConnections.set(socketId, peerConnection);
          id = socketId;
        });
      });

      socket.on("offer", (data) => {
        console.log(data);
        handleOffer(data);
      });
      socket.on("answer", (data) => {
        handleAnswer(data);
      });
      socket.on("candidate", (data) => {
        handleCandidate(data);
      });

      socket.on("endcall", (data) => {
        leaveRoom(data);
      });
    })
    .catch((error) => {
      console.log("🚀 ~ file: main.js:169 ~ init ~ error:", error);
    });
}
init();
