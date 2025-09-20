// --------------------
// Import dependencies
// --------------------
const { Server } = require("socket.io"); // Socket.IO server
const http = require("http");            // HTTP server
const express = require("express");      // Express framework

// --------------------
// Express & HTTP setup
// --------------------
const app = express(); // Initialize Express app
const server = http.createServer(app); // Create HTTP server using Express

// --------------------
// Online users map
// --------------------
// Structure: { userId: [socketId1, socketId2, ...] }
const userSocketMap = {};

// --------------------
// Socket.IO setup
// --------------------
const allowedOrigin = process.env.NODE_ENV === "production" 
    ? process.env.CLIENT_URL
    : "http://localhost:5173";

const io = new Server(server, {
    cors: {
        origin: allowedOrigin, // Allowed frontend origin
        methods: ["GET", "POST", "PUT", "DELETE"], // Allowed HTTP methods
        credentials: true, // Allow cookies & credentials
    },
});

// --------------------
// Helper functions
// --------------------
const getReceiverSocketId = (userId) => userSocketMap[userId] || []; // Get socket IDs of a user

// --------------------
// Socket.IO connection listener
// --------------------
io.on("connection", (socket) => {
    console.log(`✅ USER CONNECTED : ${socket.id}`);
    console.log("📥 Raw handshake.auth:", socket.handshake.auth);

    const userId = socket.handshake.auth?.userId; // Get userId from handshake auth

    if (userId) {
        socket.userId = userId; // Attach userId to socket

        // Initialize socket array for user if not exists
        if (!userSocketMap[userId]) userSocketMap[userId] = [];

        // Add this socket to the user’s active list
        userSocketMap[userId].push(socket.id);

        console.log(`🔗 User ${userId} mapped to socket ${socket.id}`);

        // Broadcast updated online users
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
    } else {
        console.log("⚠️ No userId found in handshake.auth");
    }

    // --------------------
    // Join chats
    // --------------------
    socket.on("joinChats", (chatIds) => {
        chatIds.forEach((chatId) => {
            socket.join(chatId); // Join chat room
            console.log(`📌 User ${userId} joined chat room ${chatId}`);
        });
    });

    // --------------------
    // Typing indicator
    // --------------------
    socket.on("typing", ({ chatId, senderId }) => {
        // console.log("📩 [BACKEND RECEIVED typing]", { chatId, senderId });
        socket.to(chatId).emit("typing", { chatId, senderId }); // Notify others
    });

    socket.on("stopTyping", ({ chatId, senderId }) => {
        // console.log("📩 [BACKEND RECEIVED stopTyping]", { chatId, senderId });
        socket.to(chatId).emit("stopTyping", { chatId, senderId }); // Notify others
    });

    // --------------------
    // Handle disconnect
    // --------------------
    socket.on("disconnect", () => {
        console.log(`❌ USER DISCONNECTED : ${socket.id}`);

        if (userId && userSocketMap[userId]) {
            // Remove this socket from user’s list
            userSocketMap[userId] = userSocketMap[userId].filter(id => id !== socket.id);

            // Delete user if no active sockets left
            if (userSocketMap[userId].length === 0) {
                delete userSocketMap[userId];
            }
        }

        // Broadcast updated online users
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
});

// --------------------
// Export modules
// --------------------
module.exports = { io, app, server, getReceiverSocketId };
