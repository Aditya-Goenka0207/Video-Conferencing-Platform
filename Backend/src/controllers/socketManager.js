import { Server } from "socket.io";

let connections = {};
let messages = {};
let timeOnline = {};

export const connectToSocket = (server) => {
  const io = new Server(server, {
    //not to be done in production, only in our testing as we can send request from anywhere
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      allowedHeaders: ["*"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    socket.on("join-call", (path) => {
      if (!connections[path]) {
        connections[path] = [];
      }

      //Prevent duplicate socket IDs from being pushed
      if (!connections[path].includes(socket.id)) {
        connections[path].push(socket.id);
      }

      //store join time
      timeOnline[socket.id] = new Date();

      //notify all users in room
      for (let a = 0; a < connections[path].length; a++) {
        io.to(connections[path][a]).emit(
          "user-joined",
          socket.id,
          connections[path],
        );
      }

      //send old chat messages to new user
      if (messages[path] !== undefined) {
        for (let a = 0; a < messages[path].length; a++) {
          io.to(socket.id).emit(
            "chat-messages",
            messages[path][a]["data"],
            messages[path][a]["sender"],
            messages[path][a]["socket-id-sender"],
          );
        }
      }
    });

    socket.on("signal", (toId, message) => {
      if (toId && io.sockets.sockets.get(toId)) {
        io.to(toId).emit("signal", socket.id, message);
      }
    });

    socket.on("chat-message", (data, sender) => {
      //find the room of the current socket
      const [matchingRoom, found] = Object.entries(connections).reduce(
        ([room, isFound], [roomKey, roomValue]) => {
          if (!isFound && roomValue.includes(socket.id)) {
            return [roomKey, true];
          }
          return [room, isFound];
        },
        ["", false],
      );

      //if socket belongs to a room
      if (found === true && matchingRoom !== "") {
        if (!messages[matchingRoom]) {
          messages[matchingRoom] = [];
        }

        messages[matchingRoom].push({
          sender: sender,
          data: data,
          "socket-id-sender": socket.id,
        });

        console.log("message", matchingRoom, ":", sender, data);

        //broadcast message to everyone in the room
        connections[matchingRoom].forEach((elem) => {
          io.to(elem).emit("chat-message", data, sender, socket.id);
        });
      }
    });

    socket.on("disconnect", () => {
      if (timeOnline[socket.id]) {
        const diffTime = Math.abs(timeOnline[socket.id] - new Date());
      }

      delete timeOnline[socket.id];

      let key;

      // k = room , v = persons
      for (const [k, v] of Object.entries(connections)) {
        for (let a = 0; a < v.length; a++) {
          if (v[a] === socket.id) {
            key = k;

            //notify remaining users
            for (let b = 0; b < connections[key].length; b++) {
              io.to(connections[key][b]).emit("user-left", socket.id);
            }

            //remove socket from room
            let index = connections[key].indexOf(socket.id);

            if (index !== -1) {
              connections[key].splice(index, 1);
            }

            //delete room if empty
            if (connections[key].length === 0) {
              delete connections[key];

              if (messages[key]) {
                delete messages[key];
              }
            }
          }
        }
      }
    });
  });
  return io;
};
