const express = require("express");
const {
  sendFriendRequest,
  getPendingRequests,
  acceptFriendRequest,
  rejectFriendRequest,
  getFriends
} = require("../controller/friendController");
const { protect } = require("../utils/util");

const router = express.Router();

router.post("/send", protect, sendFriendRequest);
router.get("/requests", protect, getPendingRequests);
router.post("/accept", protect, acceptFriendRequest);
router.post("/reject", protect, rejectFriendRequest);
router.get("/list", protect, getFriends);

module.exports = router;
