import { Chat } from "../../model/chat.js";
import { Message } from "../../model/message.js";


const postChat = async (req, res) => {
	const { userId } = req.body;
	if (!userId) {
		return res.status(400).json({ message: "userId not provided" });
	}

	if (!req.user || (!req.user._id && !userId)) {
		return res.status(400).json({ message: "Invalid user request" });
	}

	
	const existingChat = await Chat.find({
		isGroupChat: false,
		$and: [
			{ users: { $elemMatch: { $eq: req.user._id } } },
			{ users: { $elemMatch: { $eq: userId } } },
		],
	}).populate("users", "-password")
	  .populate({
			path: "latestMessage",
			populate: {
				path: "sender",
				select: "-password",
			},
		});

	if (existingChat.length == 0) {
		const chatName = "Messenger";  
		const isGroupChat = false;
		const users = [req.user._id, userId]; 
		const chat = await Chat.create({
			chatName,
			isGroupChat,
			users,
		});
		const chatDetails = await Chat.findOne({ _id: chat._id })
			.populate("users", "-password");
		return res.status(200).json({ data: chatDetails });
	} else {
		const chat = existingChat[0];
		return res.status(200).json({ data: chat });
	}
};


const getChat = async (req, res) => {
	const chat = await Chat.find({
		users: { $elemMatch: { $eq: req.user._id } },
	})
		.sort({ updatedAt: -1 })
		.populate("users", "-password")
		.populate({
			path: "latestMessage",
			populate: {
				path: "sender",
				select: "-password",
			},
		});

	return res.status(200).json({ data: chat });
};

const deleteChat = async (req, res) => {
	const chatId = req.params.chatId;


	await Message.deleteMany({ chat: chatId });
	await Chat.deleteOne({ _id: chatId });

	return res.status(200).json({ message: "Chat deleted successfully" });
};

export  {postChat,getChat,deleteChat};
