const express = require("express");
const {
  allMessages,
  sendMessage,
  deleteMessage,
  getUnreadCounts,
  markMessagesAsRead,
} = require("../controller/messageController");
const { protect } = require("../utils/util");

const router = express.Router();

router.route("/fetchMessage/:chatId").get(protect, allMessages);
router.route("/sendMessage").post(protect, sendMessage);
router.route("/deleteMessage").post(protect, deleteMessage);
router.route("/unreadCounts").get(protect, getUnreadCounts);
router.route("/markAsRead").post(protect, markMessagesAsRead);

module.exports = router;
