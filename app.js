require("dotenv").config();
const mongoose = require("mongoose")

mongoose.connect("mongodb+srv://umang:umang@cluster0.hvvcj0v.mongodb.net/chat-app");

const app = require("express")();

const http = require("http").Server(app);

const userRoute = require("./routes/userRoutes")
const User = require("./models/userModel");
const Chat = require("./models/chatModel")
app.use("/", userRoute)

const io = require("socket.io")(http);

const usp = io.of("/user-namespace");

usp.on("connection", async function (socket) {

    console.log("user connected")
    const userId = socket.handshake.auth.token

    // user broadcast online status
    socket.broadcast.emit("getOnline", { user_id: userId });

    await User.findByIdAndUpdate({ _id: userId }, { $set: { is_online: "1" } });
    socket.on("disconnect", async function () {
        console.log("user disconnected")
        await User.findByIdAndUpdate({ _id: userId }, { $set: { "is_online": "0" } });

        // user broadcast offline status
        socket.broadcast.emit("getOffline", { user_id: userId });
    })
    // chatting implematation 
    socket.on("newChat", function (data) {
        socket.broadcast.emit("loadNewChat", data);
    })
    // exist load chat 
    socket.on("existChat", async function (data) {
        const chats = await Chat.find({
            $or: [
                { sender_id: data.sender_id, receiver_id: data.receiver_id },
                { sender_id: data.receiver_id, receiver_id: data.sender_id }
            ]
        });
        socket.emit("loadChat", { chats: chats })
    })
    // deleted chat
    socket.on("chatDeleted", function (id) {
        socket.broadcast.emit("chatMsgDeleted", id);
    })
    // update chat 
    socket.on("chatUpdated", function (data) {
        socket.broadcast.emit("chatMsgUpdated", data)
    })
})




http.listen(3000, () => {
    console.log("server is running ")
})