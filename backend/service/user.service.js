import userModel from "../models/user.model.js";

export const createUser = async ({ username, email, password }) => {
    if (!username) {
        throw new Error('Username is required');
    }
    if (!email) {
        throw new Error('Email is required');
    }
    if (!password) {
        throw new Error('Password is required');
    }
    const existingUser = await userModel.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
        throw new Error("User with this email or username already exists");
    }
    const hashedPassword = await userModel.hashpassword(password);
    const User = await userModel.create({
        username,
        email,
        password: hashedPassword,

    });
    return User;

}