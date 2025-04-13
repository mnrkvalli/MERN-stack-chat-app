import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

export const getUserForSidebar = async (request, response) =>{
    try{
        const loggedInUserId = request.user._id;
        const filteredUsers = await User.find({_id: {$ne: loggedInUserId}}).select('-password')

        response.status(200).json(filteredUsers);
    }catch (error){
        console.error('Error in getUsersForSidebar: ', error.message);
        response.status(500).json({error: 'Internal server error'});
    }
};

export const getMessages = async (request, response) =>{
    try{
        const {id: userToChatId} = request.params
        const myId = request.user._id;

        const messages = await Message.find({
            $or: [
                {senderId: myId, receiverId: userToChatId},
                {senderId: userToChatId, receiverId: myId}
            ]
        })

        response.status(200).json(messages)
    }catch (error){
        console.log('Error in getMessages controller: ', error.message);
        response.status(500).json({error: "Internal service error"})
    }
}

export const sendMessage = async (request, response) =>{
    try{
        const {text, image} = request.body;
        const {id: receiverId} = request.params;
        const senderId = request.user._id;

        let imageUrl;
        if (image){
            const uploadeResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadeResponse.secure_url;
        }

        const newMessage = new Message({
            senderId,
            receiverId,
            text,
            image: imageUrl,
        });

        await newMessage.save();

        //real-time functionality using socket.io
        const receiverSocketId = getReceiverSocketId(receiverId);
        if(receiverSocketId){
            io.to(receiverSocketId).emit('newMessage', newMessage);
        }

        response.status(201).json(newMessage)

    }catch (error){
        console.log('Error in sendMessage controller: ', error.message);
        response.status(500).json({error: "Internal service error"})
    }
}