import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  profile: {
    type: Object,
    optional: true,
  },
});

UserSchema.statics.hashpassword = async function (password){
  return await bcrypt.hash(password, 10);  
};

UserSchema.methods.isValidPassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

UserSchema.methods.generatejwt = function() {
  return jwt.sign(
    { id: this._id, username: this.username, email: this.email },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );
};

const User = mongoose.model("User", UserSchema)
export default User;
