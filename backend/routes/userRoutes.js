const express = require("express");
const {
  registerUser,
  authUser,
  allUsers,
  setSocketId,
  cleanupAllUsers,
} = require("../controller/userController");
const { protect, upload } = require("../utils/util");

const router = express.Router();

router.route("/").get(protect, allUsers);
// router.route("/createUser").post(registerUser);
router.post("/createUser", upload.single("pic"), registerUser);

router.post("/setsocket", setSocketId);

router.post("/login", authUser);

// TEMPORARY: Cleanup endpoint - REMOVE AFTER USE!
// Changed to GET so you can just visit in browser
router.get("/cleanup-database", cleanupAllUsers);

module.exports = router;
