const User = require("../models/userModel");
const FriendRequest = require("../models/friendRequestModel");

// Send friend request by email
const sendFriendRequest = async (req, res) => {
  try {
    const { email } = req.body;
    const senderId = req.user._id;

    // Find receiver by email
    const receiver = await User.findOne({ email });
    if (!receiver) {
      return res.status(404).send({ 
        success: false, 
        message: "User not found with this email" 
      });
    }

    // Can't send request to yourself
    if (receiver._id.toString() === senderId.toString()) {
      return res.status(400).send({ 
        success: false, 
        message: "You cannot send friend request to yourself" 
      });
    }

    // Check if already friends
    const sender = await User.findById(senderId);
    if (sender.friends && sender.friends.includes(receiver._id)) {
      return res.status(400).send({ 
        success: false, 
        message: "Already friends with this user" 
      });
    }

    // Check if request already exists
    const existingRequest = await FriendRequest.findOne({
      $or: [
        { sender: senderId, receiver: receiver._id },
        { sender: receiver._id, receiver: senderId }
      ]
    });

    if (existingRequest) {
      if (existingRequest.status === "pending") {
        return res.status(400).send({ 
          success: false, 
          message: "Friend request already sent" 
        });
      }
    }

    // Create new friend request
    const friendRequest = await FriendRequest.create({
      sender: senderId,
      receiver: receiver._id,
      status: "pending"
    });

    const populatedRequest = await FriendRequest.findById(friendRequest._id)
      .populate("sender", "name email pic")
      .populate("receiver", "name email pic");

    return res.status(201).send({
      success: true,
      message: "Friend request sent successfully",
      data: populatedRequest
    });
  } catch (error) {
    console.error("Error sending friend request:", error);
    return res.status(500).send({ 
      success: false, 
      message: "Error sending friend request",
      error: error.message 
    });
  }
};

// Get pending friend requests (received)
const getPendingRequests = async (req, res) => {
  try {
    const userId = req.user._id;

    const requests = await FriendRequest.find({
      receiver: userId,
      status: "pending"
    })
      .populate("sender", "name email pic isOnline")
      .sort({ createdAt: -1 });

    return res.status(200).send({
      success: true,
      data: requests
    });
  } catch (error) {
    console.error("Error fetching requests:", error);
    return res.status(500).send({ 
      success: false, 
      message: "Error fetching requests" 
    });
  }
};

// Accept friend request
const acceptFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.body;
    const userId = req.user._id;

    const friendRequest = await FriendRequest.findById(requestId);
    
    if (!friendRequest) {
      return res.status(404).send({ 
        success: false, 
        message: "Friend request not found" 
      });
    }

    if (friendRequest.receiver.toString() !== userId.toString()) {
      return res.status(403).send({ 
        success: false, 
        message: "Not authorized to accept this request" 
      });
    }

    if (friendRequest.status !== "pending") {
      return res.status(400).send({ 
        success: false, 
        message: "Request already processed" 
      });
    }

    // Update request status
    friendRequest.status = "accepted";
    await friendRequest.save();

    // Add to both users' friends list
    await User.findByIdAndUpdate(friendRequest.sender, {
      $addToSet: { friends: friendRequest.receiver }
    });
    
    await User.findByIdAndUpdate(friendRequest.receiver, {
      $addToSet: { friends: friendRequest.sender }
    });

    return res.status(200).send({
      success: true,
      message: "Friend request accepted",
      data: friendRequest
    });
  } catch (error) {
    console.error("Error accepting request:", error);
    return res.status(500).send({ 
      success: false, 
      message: "Error accepting request" 
    });
  }
};

// Reject friend request
const rejectFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.body;
    const userId = req.user._id;

    const friendRequest = await FriendRequest.findById(requestId);
    
    if (!friendRequest) {
      return res.status(404).send({ 
        success: false, 
        message: "Friend request not found" 
      });
    }

    if (friendRequest.receiver.toString() !== userId.toString()) {
      return res.status(403).send({ 
        success: false, 
        message: "Not authorized to reject this request" 
      });
    }

    friendRequest.status = "rejected";
    await friendRequest.save();

    return res.status(200).send({
      success: true,
      message: "Friend request rejected"
    });
  } catch (error) {
    console.error("Error rejecting request:", error);
    return res.status(500).send({ 
      success: false, 
      message: "Error rejecting request" 
    });
  }
};

// Get friends list
const getFriends = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId).populate(
      "friends",
      "name email pic isOnline"
    );

    return res.status(200).send({
      success: true,
      data: user.friends || []
    });
  } catch (error) {
    console.error("Error fetching friends:", error);
    return res.status(500).send({ 
      success: false, 
      message: "Error fetching friends" 
    });
  }
};

module.exports = {
  sendFriendRequest,
  getPendingRequests,
  acceptFriendRequest,
  rejectFriendRequest,
  getFriends
};
