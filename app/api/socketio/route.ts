// app/api/socketio/route.ts
import type { Server as HTTPServer } from "http";
import type { Socket as NetSocket } from "net";
import type { NextApiRequest, NextApiResponse } from "next";
import { NextResponse } from "next/server";
import type { Server as IOServer } from "socket.io";
import { Server } from "socket.io";

interface SocketServer extends HTTPServer {
  io?: IOServer | undefined;
}

interface SocketWithIO extends NetSocket {
  server: SocketServer;
}

interface NextApiResponseWithSocket extends NextApiResponse {
  socket: SocketWithIO;
}

export async function GET(
  _req: NextApiRequest,
  res: NextApiResponseWithSocket
) {
  if (res.socket?.server?.io) {
    console.log("Socket.IO server already running");
    res
      .status(200)
      .json({ success: true, message: "Socket is already running" });
    return;
  }
  console.log("Starting Socket.IO server");
  // const io = new Server(res.socket.server as any, {
  //   path: "/api/socketio",
  //   addTrailingSlash: false,
  // });
  const io = new Server({
    path: "/api/socket",
    addTrailingSlash: false,
    cors: { origin: "*" },
  });
  console.log("Socket.IO server started");

  // Attach the io instance to the server
  // store io in res.socket.server.io
  // res.socket.server.io = io;
  // res.socket.server.io = io;

  io.on("connection", (socket) => {
    console.log("New client connected");
    socket.on("joinroom", (roomId: string) => {
      socket.join(roomId);
      console.log(`Client joined room: ${roomId}`);
    });
    socket.on("sendMessage", (messageData) => {
      const { roomId, message } = messageData;
      console.log(`Message received in room ${roomId}:`, message);
      io.to(roomId).emit("receiveMessage", message);
    });

    // handle typing events
    socket.on("typing", (roomId: string) => {
      socket.to(roomId).emit("typing", socket.id);
    });

    // disconnect event
    socket.on("disconnect", () => {
      console.log("Client disconnected");
    });
  });

  return NextResponse.json({
    success: true,
    message: "Socket is started",
    socket: `:${4000}`,
  });
}
