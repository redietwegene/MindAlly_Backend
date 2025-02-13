import { Chat } from "../../model/chat.js";
import { Message } from "../../model/message.js";


const createMessage = async (req, res) => {
	const { message, chatId } = req.body;
	if (!message || !chatId) {
		return res.status(400).json({ message: "Message and chatId are required" });
	}

	
	const chat = await Chat.findOne({ _id: chatId, isGroupChat: false })
		.populate("users", "-password");
	if (!chat || !chat.users.includes(req.user._id)) {
		return res.status(400).json({ message: "Invalid chat or user not part of chat" });
	}

	
	const newMessage = await Message.create({
		sender: req.user._id,
		message: message,
		chat: chatId,
	});

	await Chat.findByIdAndUpdate(chatId, {
		latestMessage: newMessage._id,
	});


	const fullMessage = await Message.findById(newMessage._id)
		.populate("sender", "-password")
		.populate({
			path: "chat",
			populate: { path: "users", select: "-password" },
		});

	return res.status(201).json({ data: fullMessage });
};


const allMessage = async (req, res) => {
	const chatId = req.params.chatId;


	const chat = await Chat.findOne({ _id: chatId, isGroupChat: false });
	if (!chat || !chat.users.includes(req.user._id)) {
		return res.status(400).json({ message: "Invalid chat or user not part of chat" });
	}

	const messages = await Message.find({ chat: chatId })
		.populate("sender", "-password")
		.populate("chat");

	return res.status(200).json({ data: messages });
};


const clearChat = async (req, res) => {
	const chatId = req.params.chatId;

	
	const chat = await Chat.findOne({ _id: chatId, isGroupChat: false });
	if (!chat || !chat.users.includes(req.user._id)) {
		return res.status(400).json({ message: "Invalid chat or user not part of chat" });
	}

	await Message.deleteMany({ chat: chatId });

	return res.status(200).json({ message: "All messages deleted successfully" });
};

export { createMessage, allMessage, clearChat };
