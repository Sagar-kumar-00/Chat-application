const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
//@description     Get or Search all users
//@route           GET /api/user?search=
//@access          Public
const allUsers = async (req, res) => {
  const keyword = req.query.search
    ? {
        $or: [
          { name: { $regex: req.query.search, $options: "i" } },
          { email: { $regex: req.query.search, $options: "i" } },
        ],
      }
    : {};

  const users = await User.find(keyword).find({ _id: { $ne: req.user._id } });
  res.send(users);
};

//@description     Register new user
//@route           POST /api/user/
//@access          Public
const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Please Enter all the Feilds");
  }

  const userExists = await User.findOne({ email });

  if (userExists) {
    return res.status(200).send({message:"User already Exists", success:false});
    // throw new Error("User already exists");
  }

  const salt = await bcrypt.genSalt(5); //complexity of salt generation
  const hashpassword = await bcrypt.hash(req.body.password, salt); // password hashing

  const userData = {
    name,
    email,
    password: hashpassword,
  };

  // Only add pic if file was uploaded
  if (req.file) {
    userData.pic = req.file.filename;
  }

  const user = await User.create(userData);

  if (user) {
    const token = jwt.sign({ id: user._id }, process.env.TOKEN_SECRET);

    return res.status(201).send({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      pic: user.pic,
      token: token,
      success:true
    });
  } else {
    return res.status(400).send("Some Error");
  }
};

//@description     Auth the user
//@route           POST /api/users/login
//@access          Public
const authUser = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res
      .status(200)
      .send({ success: false, message: "Invalid Email or Password" });
  } else {
    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );

    if (!validPassword) {
      return res
        .status(200)
        .send({ message: "Invalid Password", success: false });
    }

    const token = jwt.sign({ id: user._id }, process.env.TOKEN_SECRET);

    return res.send({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        pic: user.pic,
        token: token,
      },
    });
  }
};

const setSocketId = async (req, res) => {
  const data = await User.findByIdAndUpdate(req.body.userId, {
    socketId: req.body.socketId,
  });
  return res.send(req.body.socketId);
};

module.exports = { allUsers, registerUser, authUser, setSocketId };
