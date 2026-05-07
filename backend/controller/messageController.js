const Message = require("../models/messageModel");
const User = require("../models/userModel");
const Chat = require("../models/chatModel");

//@description     Get all Messages
//@route           GET /api/Message/:chatId
//@access          Protected
const allMessages = async (req, res) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .populate("sender", "name pic email")
      .populate("chat");
    return res.send(messages);
  } catch (error) {
    return res.status(400).send("ERRRRRRRROR");
  }
};

//@description     Create New Message
//@route           POST /api/Message/
//@access          Protected
const sendMessage = async (req, res) => {
  const { content, chatId } = req.body;

  if (!content || !chatId) {
    console.log("Invalid data passed into request");
    return res.status(400).send("Invalid data passed into request");
  }

  var newMessage = {
    sender: req.user._id,
    content: content,
    chat: chatId,
    readBy: [req.user._id], // Sender automatically marked as read
  };

  try {
    var message = await Message.create(newMessage);

    message = await message.populate("sender", "name pic");
    message = await message.populate("chat");
    message = await User.populate(message, {
      path: "chat.users",
      select: "name pic email",
    });

    await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message });

    return res.send(message);
  } catch (error) {
    return res.status(400).send("ERROR");
  }
};

const deleteMessage = async (req, res) => {
  const { messageId } = req.body;

  // if (!content || !chatId) {
  //   console.log("Invalid data passed into request");
  //   return res.status(400).send("Invalid data passed into request");
  // }

  // var newMessage = {
  //   sender: req.user._id,
  //   content: content,
  //   chat: chatId,
  // };

  try {
    let message = await Message.findByIdAndDelete(messageId);
    // console.log(message, "MMEEEESSAGE");
    // let newMessages = await Message.find();
    return res.send({ success: true, data: message });
  } catch (error) {
    return res.status(400).send("ERROR");
  }
};

// Get unread message counts for all chats of a user
const getUnreadCounts = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get all chats for this user
    const chats = await Chat.find({
      users: { $elemMatch: { $eq: userId } }
    });

    const unreadCounts = {};

    // For each chat, count unread messages
    for (const chat of chats) {
      const unreadCount = await Message.countDocuments({
        chat: chat._id,
        readBy: { $ne: userId }, // Messages not in readBy array for this user
      });
      
      if (unreadCount > 0) {
        unreadCounts[chat._id.toString()] = unreadCount;
      }
    }

    return res.status(200).send({ 
      success: true, 
      data: unreadCounts 
    });
  } catch (error) {
    console.error("Error getting unread counts:", error);
    return res.status(500).send({ 
      success: false, 
      message: "Error fetching unread counts" 
    });
  }
};

// Mark all messages in a chat as read by the user
const markMessagesAsRead = async (req, res) => {
  try {
    const { chatId } = req.body;
    const userId = req.user._id;

    if (!chatId) {
      return res.status(400).send({ 
        success: false, 
        message: "Chat ID required" 
      });
    }

    // Update all messages in this chat to add userId to readBy if not already there
    await Message.updateMany(
      { 
        chat: chatId,
        readBy: { $ne: userId }
      },
      { 
        $addToSet: { readBy: userId }
      }
    );

    return res.status(200).send({ 
      success: true, 
      message: "Messages marked as read" 
    });
  } catch (error) {
    console.error("Error marking messages as read:", error);
    return res.status(500).send({ 
      success: false, 
      message: "Error marking messages as read" 
    });
  }
};

module.exports = { allMessages, sendMessage, deleteMessage, getUnreadCounts, markMessagesAsRead };
