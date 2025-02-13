import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import userRoutes from "./routes/authenticaionRoutes/userAuth.js"
import otpRoutes from "./routes/authenticaionRoutes/otpRoutes.js"
import { fileURLToPath } from 'url';
import path from 'path';
import swaggerUi from 'swagger-ui-express'
import { swaggerSpec } from "./swagger.js";

import { Server } from "socket.io";



const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);




dotenv.config();
const app = express();
app.use(bodyParser.json());



mongoose
    .connect(process.env.Mongo_url)
    .then(() => {
        console.log("Database connected succesfully"),
        { useNewUrlParser: true, useUnifiedTopology: true }
    })

app.use(cors({
 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type'],
  credentials:true
}));
// app.get("/", (req, res) => {
//     res.send("Api is working correctly")
// })
app.get("/", (req, res) => {
    res.sendFile(__dirname+"/index.html")
})


app.use("/api/user", userRoutes)
app.use("/api/otp", otpRoutes)
// app.use("/api/google",googleRoutes)


// app.listen(process.env.PORT, () => {
//     console.log(   `server is running on port ${process.env.PORT}`)
// })

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Your other routes and middleware



const server = app.listen(process.env.PORT, async () => {
    console.log(`Server listening on ${process.env.PORT}`);
});

const io = new Server(server);

io.on("connection", (socket) => {
    console.log("Connected to socket.io:", socket.id);

    const setupHandler = async (userId) => {
        

        if (!user) {
            socket.emit("error", { message: "User not found" });
            return ;
        }

        if (!socket.hasJoined) {
            socket.join(userId);
            socket.hasJoined = true;
            console.log(`User joined: ${userId} as ${user.role}`);
            socket.emit("connected");
        }
    };

    const newMessageHandler = (newMessageReceived) => {
        let chat = newMessageReceived?.chat;

        if (chat) {
            chat.users.forEach((user) => {
                if (user._id.toString() === newMessageReceived.sender._id.toString()) return; 

                if (user.role === 'patient' && newMessageReceived.sender.role === 'therapist') {
                    socket.in(user._id).emit("message received", newMessageReceived);
                } else if (user.role === 'therapist' && newMessageReceived.sender.role === 'patient') {
                    socket.in(user._id).emit("message received", newMessageReceived);
                }
            });
        }
    };

    const joinChatHandler = async (room) => {
        const chat = await Chat.findById(room).populate('users');
        
        if (!chat) {
            socket.emit("error", { message: "Chat not found" });
            return;
        }

        const userId = socket.id;

        if (chat.users.some(user => user._id.toString() === userId)) {
            socket.join(room);
            socket.currentRoom = room;
            console.log(`User ${userId} joined chat room: ${room}`);
        } else {
            socket.emit("error", { message: "You are not allowed to join this chat" });
        }
    };

    const typingHandler = (room) => {
        socket.in(room).emit("typing");
    };

    const stopTypingHandler = (room) => {
        socket.in(room).emit("stop typing");
    };

    const clearChatHandler = (chatId) => {
        socket.in(chatId).emit("clear chat", chatId);
    };

    const deleteChatHandler = async (chatId, authUserId) => {
        const chat = await Chat.findById(chatId).populate('users');

        if (!chat) {
            socket.emit("error", { message: "Chat not found" });
            return;
        }

        if (chat.users.some(user => user._id.toString() === authUserId)) {
            chat.users.forEach((user) => {
                if (authUserId === user._id) return;
                socket.in(user._id).emit("delete chat", chat._id);
            });
        } else {
            socket.emit("error", { message: "You are not authorized to delete this chat" });
        }
    };

    const chatCreateChatHandler = (chat, authUserId) => {
        if (!chat) {
            socket.emit("error", { message: "Chat not found" });
            return;
        }

        chat.users.forEach((user) => {
            if (authUserId === user._id) return;
            socket.in(user._id).emit("chat created", chat);
        });
    };

    socket.on("setup", setupHandler);
    socket.on("new message", newMessageHandler);
    socket.on("join chat", joinChatHandler);
    socket.on("typing", typingHandler);
    socket.on("stop typing", stopTypingHandler);
    socket.on("clear chat", clearChatHandler);
    socket.on("delete chat", deleteChatHandler);
    socket.on("chat created", chatCreateChatHandler);

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
        socket.off("setup", setupHandler);
        socket.off("new message", newMessageHandler);
        socket.off("join chat", joinChatHandler);
        socket.off("typing", typingHandler);
        socket.off("stop typing", stopTypingHandler);
        socket.off("clear chat", clearChatHandler);
        socket.off("delete chat", deleteChatHandler);
        socket.off("chat created", chatCreateChatHandler);
    });
});
