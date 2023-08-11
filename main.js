// import express from "express";

// const app = express();

// app.get("/", (req, res) => {
//   res.send("This is the video conferencing application");
// });

let APP_ID = "0102bb58a36746b19ff3cf6ef85e8e35";
let token = null; // since our authentication mechanism is set up to only app-id, therefore null
let uId = String(Math.floor(Math.random() * 10000)); // for each user we want the id, for now we are going to assign random numbers

let client; // this is the client we are login with and has the access to all these functions
let channel; // this is the channel actually where the two users join

let localStream;
let remoteStream;
let peerConnection;

// Google stunt servers, for generating ICE candidates
const servers = {
  iceServers: [
    {
      urls: ["stun:stun.l.google.com:19302", "stun:stun2.l.google.com:19302"],
    },
  ],
};

let init = async () => {
  client = await AgoraRTM.createInstance(APP_ID);
  await client.login({ uId, token });

  // allow/permission for video and audio
  localStream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: false,
  });
  document.getElementById("user-1").srcObject = localStream;

  createOffer();
};

// sending offer to another peer
let createOffer = async () => {
  peerConnection = new RTCPeerConnection(servers); // creating/establishing peer connection object

  remoteStream = new MediaStream(); // setting up media-stream inside video player 2 i.e. user-2
  document.getElementById("user-2").srcObject = remoteStream;

  // getting local-tracks i.e. video and audio and adding to the peer-connection or remote-peer
  localStream.getTracks().forEach((track) => {
    peerConnection.addTrack(track, localStream);
  });

  // want to listen for our tracks has there tracks too
  // so anytime our remote-peer has the track we want to  have there track too and listen to that event
  peerConnection.ontrack = (event) => {
    event.streams[0].getTracks().forEach((track) => {
      remoteStream.addTrack(track);
    });
  };

  // when we create offer we still need to create ice-candidates
  // so anytime we setLocalDescription by default we have a event-listner that we can fire-off to the STUNT server, which will go and start generating ice-candidates
  peerConnection.onicecandidate = async (event) => {
    if (event.candidate) {
      console.log("New ICE candidate: ", event.candidate);
    }
  };
  // Now we need to take this information and send it over to our remote-peer to establish that initial connections
  // so will take the offer (as below), along with each ice-candidate that we generated (i.e. just above) and send that data over to that remote-peer
  // onse that remote-peer will get this information they will create SDP-answer with their information and send back to us
  // onse that exchange takes place the 2-peers will get connected and data will begin to flow
  // usually this happens through Signalling where we have to set our own server, but we are using Agora (3rd party service) that give us SDK to make all of this possible

  // now making the offer to the remote client
  // each peerconnection will have a offer and answer
  let offer = await peerConnection.createOffer();
  // after getting the answer we are making local descriptions
  await peerConnection.setLocalDescription(offer);
  console.log("offer:", offer);
};

init();

// app.listen(4000, () => {
//   console.log("Server is running at localhost:4000");
// });
