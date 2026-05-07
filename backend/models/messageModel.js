const mongoose = require("mongoose");

const messageModel = new mongoose.Schema({
   sender:{type:mongoose.Types.ObjectId,ref:'User'},
   content:{type:String,trim:true},
   chat:{type:mongoose.Types.ObjectId,ref:'Chat'},
   readBy:[{type:mongoose.Types.ObjectId,ref:'User'}],
}, {
    timestamps: true
});

module.exports = mongoose.model("Message", messageModel);