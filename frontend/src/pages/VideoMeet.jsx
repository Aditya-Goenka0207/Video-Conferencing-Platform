import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import { Badge, IconButton, TextField, Button } from "@mui/material";
import VideocamIcon from "@mui/icons-material/Videocam";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import CallEndIcon from "@mui/icons-material/CallEnd";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import ScreenShareIcon from "@mui/icons-material/ScreenShare";
import StopScreenShareIcon from "@mui/icons-material/StopScreenShare";
import ChatIcon from "@mui/icons-material/Chat";
import styles from "../styles/videoComponent.module.css";
import server from "../environment";

const peerConfig = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

var connections = {}; // All peer connections

export default function VideoMeetComponent() {
  const socketRef = useRef();
  const socketIdRef = useRef();
  const localVideoRef = useRef();

  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [screenEnabled, setScreenEnabled] = useState(false);

  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [newMessages, setNewMessages] = useState(0);

  const [username, setUsername] = useState("");
  const [askForUsername, setAskForUsername] = useState(true);

  const [videos, setVideos] = useState([]);
  const videoRef = useRef([]);

  // ================== INITIAL PERMISSIONS ==================
  useEffect(() => {
    const getPermissions = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: videoEnabled,
          audio: audioEnabled,
        });
        window.localStream = stream;
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      } catch (err) {
        console.error("Failed to get user media", err);
      }
    };

    getPermissions();
  }, [videoEnabled, audioEnabled]);

  // ================== SOCKET CONNECTION ==================
  const connectToSocketServer = () => {
    socketRef.current = io(server, { secure: false });

    socketRef.current.on("connect", () => {
      socketIdRef.current = socketRef.current.id;
      socketRef.current.emit("join-call", window.location.href);

      // Listen to chat messages
      socketRef.current.on("chat-message", addMessage);

      // When someone leaves
      socketRef.current.on("user-left", (id) => {
        setVideos((videos) => videos.filter((v) => v.socketId !== id));
        delete connections[id];
      });

      // When someone joins
      socketRef.current.on("user-joined", (id, clients) => {
        clients.forEach((clientId) => {
          if (!connections[clientId]) {
            const pc = new RTCPeerConnection(peerConfig);

            pc.onicecandidate = (event) => {
              if (event.candidate) {
                socketRef.current.emit(
                  "signal",
                  clientId,
                  JSON.stringify({ ice: event.candidate })
                );
              }
            };

            pc.onaddstream = (event) => {
              setVideos((prevVideos) => {
                const exists = prevVideos.find((v) => v.socketId === clientId);
                if (exists) {
                  return prevVideos.map((v) =>
                    v.socketId === clientId ? { ...v, stream: event.stream } : v
                  );
                } else {
                  return [...prevVideos, { socketId: clientId, stream: event.stream }];
                }
              });
            };

            // Add local stream
            if (window.localStream) pc.addStream(window.localStream);

            connections[clientId] = pc;

            // Create offer if I am the one already in call
            if (id === socketIdRef.current) {
              pc.createOffer()
                .then((desc) => pc.setLocalDescription(desc))
                .then(() => {
                  socketRef.current.emit(
                    "signal",
                    clientId,
                    JSON.stringify({ sdp: pc.localDescription })
                  );
                })
                .catch(console.error);
            }
          }
        });
      });
    });

    // Handle incoming WebRTC signals
    socketRef.current.on("signal", gotMessageFromServer);
  };

  // ================== HANDLE SIGNALS ==================
  const gotMessageFromServer = async (fromId, msg) => {
    const signal = JSON.parse(msg);

    if (fromId === socketIdRef.current) return;

    const pc = connections[fromId];

    if (!pc) return;

    if (signal.sdp) {
      await pc.setRemoteDescription(new RTCSessionDescription(signal.sdp));
      if (signal.sdp.type === "offer") {
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socketRef.current.emit(
          "signal",
          fromId,
          JSON.stringify({ sdp: pc.localDescription })
        );
      }
    }

    if (signal.ice) {
      await pc.addIceCandidate(new RTCIceCandidate(signal.ice));
    }
  };

  // ================== CHAT FUNCTIONS ==================
  const addMessage = (data, sender) => {
    setMessages((prev) => [...prev, { data, sender }]);
    if (sender !== username) setNewMessages((prev) => prev + 1);
  };

  const sendMessage = () => {
    if (!message.trim()) return;
    socketRef.current.emit("chat-message", message, username);
    setMessage("");
  };

  // ================== MEDIA TOGGLES ==================
  const toggleVideo = () => {
    const enabled = !videoEnabled;
    setVideoEnabled(enabled);
    window.localStream.getVideoTracks().forEach((t) => (t.enabled = enabled));
  };
  const toggleAudio = () => {
    const enabled = !audioEnabled;
    setAudioEnabled(enabled);
    window.localStream.getAudioTracks().forEach((t) => (t.enabled = enabled));
  };
  const endCall = () => {
    window.localStream.getTracks().forEach((t) => t.stop());
    window.location.href = "/";
  };
  const toggleScreen = async () => {
    if (!screenEnabled) {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        const videoTrack = screenStream.getVideoTracks()[0];
        const sender = Object.values(connections)[0]?.getSenders().find((s) => s.track.kind === "video");
        sender.replaceTrack(videoTrack);
        setScreenEnabled(true);
        videoTrack.onended = () => toggleScreen(); // Revert back to camera
      } catch (err) {
        console.error("Screen share failed", err);
      }
    } else {
      toggleScreen(); // stop sharing
      setScreenEnabled(false);
    }
  };

  // ================== LOBBY ==================
  const connect = () => {
    if (!username.trim()) return alert("Enter a username");
    setAskForUsername(false);
    connectToSocketServer();
  };

  return (
    <div className={styles.meetVideoContainer}>
      {askForUsername ? (
        <div>
          <h2>Enter Lobby</h2>
          <TextField
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <Button variant="contained" onClick={connect}>
            Connect
          </Button>
          <div>
            <video ref={localVideoRef} autoPlay muted />
          </div>
        </div>
      ) : (
        <>
          {/* CHAT */}
          {true && (
            <div className={styles.chatRoom}>
              <div className={styles.chatContainer}>
                <h2>Chat</h2>
                <div className={styles.chattingDisplay}>
                  {messages.length
                    ? messages.map((m, i) => (
                        <div key={i} style={{ marginBottom: 10 }}>
                          <b>{m.sender}:</b> {m.data}
                        </div>
                      ))
                    : "No messages yet"}
                </div>
                <div className={styles.chattingArea}>
                  <TextField
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    label="Type message"
                  />
                  <Button variant="contained" onClick={sendMessage}>
                    Send
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* BUTTONS */}
          <div className={styles.buttonContainers}>
            <IconButton onClick={toggleVideo} style={{ color: "white" }}>
              {videoEnabled ? <VideocamIcon /> : <VideocamOffIcon />}
            </IconButton>
            <IconButton onClick={endCall} style={{ color: "red" }}>
              <CallEndIcon />
            </IconButton>
            <IconButton onClick={toggleAudio} style={{ color: "white" }}>
              {audioEnabled ? <MicIcon /> : <MicOffIcon />}
            </IconButton>
            {true && (
              <IconButton onClick={toggleScreen} style={{ color: "white" }}>
                {screenEnabled ? <ScreenShareIcon /> : <StopScreenShareIcon />}
              </IconButton>
            )}
            <Badge badgeContent={newMessages} max={999} color="secondary">
              <IconButton onClick={() => setNewMessages(0)} style={{ color: "white" }}>
                <ChatIcon />
              </IconButton>
            </Badge>
          </div>

          {/* LOCAL VIDEO */}
          <video ref={localVideoRef} autoPlay muted className={styles.meetUserVideo} />

          {/* REMOTE VIDEOS */}
          <div className={styles.conferenceView}>
            {videos.map((v) => (
              <video
                key={v.socketId}
                autoPlay
                ref={(ref) => {
                  if (ref && v.stream) ref.srcObject = v.stream;
                }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}