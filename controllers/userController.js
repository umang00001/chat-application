const User = require("../models/userModel")
const bcrypt = require("bcrypt");
const Chat = require("../models/chatModel")


const registerLoad = async (req, resp) => {
    try {
        resp.render("register");
    } catch (error) {
        console.log(error.message)
    }
}

const register = async (req, resp) => {
    try {

        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const user = new User({
            name: req.body.name,
            email: req.body.email,
            image: "images/" + req.file.filename,
            password: hashedPassword
        })

        await user.save();

        resp.render("register", { message: "Your Registration Success" })

    } catch (error) {
        console.log(error.message)
    }
}

const loadLogin = async (req, resp) => {
    try {
        resp.render("login")
    } catch (error) {
        console.log(error.message)
    }
}

const login = async (req, resp) => {
    try {
        const email = req.body.email;
        const password = req.body.password;
        const userData = await User.findOne({ email: email });
        if (userData) {
            const matchPass = await bcrypt.compare(password, userData.password);
            if (matchPass) {
                req.session.user = userData;
                resp.redirect("/dashboard")
            } else {
                resp.render("login", { message: "email or password is incorrect" });
            }
        } else {
            resp.render("login", { message: "email or password is incorrect" })
        }
    } catch (error) {
        console.log(error.message)
    }
}

const loadDashboard = async (req, resp) => {
    try {
        const users = await User.find({ _id: { $nin: req.session.user._id } })
        resp.render("dashboard", { user: req.session.user, users: users })
    } catch (error) {
        console.log(error.message)
    }
}

const logout = async (req, resp) => {
    try {
        req.session.destroy();
        resp.redirect("/")
    } catch (error) {
        console.log(error.message)
    }
}

const saveChat = async (req, resp) => {
    try {
        const chat = new Chat({
            sender_id: req.body.sender_id,
            receiver_id: req.body.receiver_id,
            message: req.body.message
        })
        const newChat = await chat.save();
        resp.status(200).send({
            success: true,
            message: "chat inserted !",
            data: newChat
        })

    } catch (error) {
        console.log(error.message)
        resp.status(400).send({
            success: false,
            message: error.message
        })
    }
}

const deleteChat = async (req, resp) => {
    try {
        await Chat.deleteOne({ _id: req.body.id })
        resp.status(200).send({
            success: true,
            message: "chat deleted"
        })

    } catch (error) {
        console.log(error.message)
        resp.status(400).send({
            message: error.message,
            success: false
        })
    }
}

const updateChat = async (req, resp) => {
    try {
        const id = req.body.id
        const message = req.body.message
        console.log(id)
        console.log(message)
        await Chat.findOneAndUpdate({ _id: id }, { $set: { message: message } })

        resp.status(200).send({
            success: true,
            message: "message updated successfully"
        })

    } catch (error) {
        console.log(error.message)
        resp.status(400).send({
            success: false,
            message: error.message
        })
    }
}


module.exports = {
    register,
    registerLoad,
    loadDashboard,
    loadLogin,
    login,
    logout,
    saveChat,
    deleteChat,
    updateChat
}