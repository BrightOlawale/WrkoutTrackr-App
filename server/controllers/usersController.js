const User = require('../models/usersModel');
const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');
const authHelpers = require('../middleware/authMiddleware');
const helpers = require('../helpers');
const Token = require('../models/tokenModel');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Export container
const usersController = {};

// @desc    Get all users
usersController.getUsers = asyncHandler(async (req, res) => {
    const users = await User.find({});

    res.status(200).json({
        success: true,
        users
    })
}
);

// @desc    Get single user
usersController.getUser = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    // Sanity checking
    if (!userId) {
        res.status(400);
        throw new Error('User ID is required');
    }

    // Finding user in DB
    const user = await User.findById(userId);

    // If user not found
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    res.status(200).json({ success: true, user });
});

// @desc    Create user
usersController.createUser = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    // Sanity checking
    if (!name || !email || !password) {
        res.status(400);
        throw new Error('Please enter all fields');
    }

    // Checking password length  if user already exists
    if (password.length < 8){
        res.status(400);
        throw new Error('Password cannot be less than 8 characters');
    }

    if ( await User.findOne({ email })){
        res.status(400);
        throw new Error('User already exists');
    }

    // Create new user
    const newUser = await User.create({
        name,
        email,
        password
    });

    // If user created successfully
    if (newUser) {
        const userToken = await authHelpers.generateToken({ id: newUser._id});

        const { password, ...user } = newUser.toObject();
        res.status(201).json({
            success: true,
            user: user,
            token: userToken
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

// @desc    Update user
usersController.updateUser = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    if (!userId) {
        res.status(400);
        throw new Error('User ID is required');
    }

    const { name, email } = req.body;

    if (!name && !email) {
        res.status(400);
        throw new Error('Please enter at least one fields');
    }

    // Finding user in DB   
    const user = await User.findById(userId);

    // If user not found
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    // Update user
    if (name) user.name = name;
    if (email) user.email = email;

    // Save user
    await user.save();

    res.status(200).json({ success: true, user });
});

// @desc    Delete user
usersController.deleteUser = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    if (!userId) {
        res.status(400);
        throw new Error('User ID is required');
    }

    // Finding user in DB
    const user = await User.findById(userId);

    // If user not found
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    // Delete workout
    await helpers.deleteUserWorkouts(userId);

    // Delete user
    await User.deleteOne({ _id: userId });

    res.status(200).json({ success: true, message: 'User removed successfully' });
}); 

// @desc    Login user
usersController.loginUser = asyncHandler(async (req, res) => {
    // Get the email and password from req.body
    const { email, password } = req.body;

    // Sanity checking
    if (!email || !password) {
        res.status(400);
        throw new Error('Please enter all fields');
    }

    // Finding user in DB
    const user = await User.findOne({ email }).select('+password');

    // If user not found
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    // Check if password matche
    const isMatch = await bcrypt.compare(password, user.password);

    // If password not match
    if (!isMatch) {
        res.status(400);
        throw new Error('Invalid credentials');
    }

    // If password match
    const userToken = await authHelpers.generateToken({ id: user._id});
    const { password: thePassword, ...userData } = user.toObject();
    res.status(200).json({
        success: true,
        user: userData,
        token: userToken
    });
});

// @desc    Logout user
usersController.logoutUser = asyncHandler(async (req, res) => {
    res.status(200).json({ success: true, message: 'User logged out successfully', token: null});
}); 

// @desc    Change user password
usersController.changePassword = asyncHandler(async (req, res) => { 
    const userId = req.user._id;

    if (!userId) {
        res.status(400);
        throw new Error('User ID is required');
    }

    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
        res.status(400);
        throw new Error('Please enter all fields');
    }

    // Finding user in DB
    const user = await User.findById(userId).select('+password');

    // If user not found
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    // Check if password matches the old password
    const isMatch = await bcrypt.compare(oldPassword, user.password);

    // If password not match
    if (!isMatch) {
        res.status(400);
        throw new Error('Old password is incorrect');
    }

    // If password match
    user.password = newPassword;

    // Save user
    const savePassword = await user.save();

    // If password not saved
    if (!savePassword) {
        res.status(400);
        throw new Error('Password not saved');
    }

    res.status(200).json({ success: true, message: 'Password changed successfully' });
});

// @desc    Forgot password
usersController.forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;

    // Sanity checking
    if (!email) {
        res.status(400);
        throw new Error('Email is required');
    }

    // Finding user in DB
    const user = await User.findOne({ email });

    // If user not found
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    // check if user has a reset token
    const tokenExists = await Token.findOne({ userId: user._id });

    // If token exists, delete it
    if (tokenExists) {
        await Token.deleteOne({ userId: user._id });
    }

    // Create a new token
    const newToken = crypto.randomBytes(32).toString('hex') + user._id;
    const hashedToken = crypto.createHash('sha256').update(newToken).digest('hex');

    // Save token
    await Token.create({
        userId: user._id,
        token: hashedToken,
        createdAt: Date.now()
    });

    // Set reset url
    const resetLink = `${process.env.FRONTEND_URL}/api/users/reset-password/${newToken}`;

    // Construct email message
    const html = fs.readFileSync(path.join(__dirname, '../templates/message.html'), 'utf8');

    let message = html.replace('${resetLink}', resetLink);

    // replace user name
    message = message.replace('${userName}', user.name);

    const subject = 'Password reset request';
    const emailTo = user.email;

    // Send email
    try {
        await helpers.sendEmail(emailTo, subject, message);

        res.status(200).json({ success: true, message: 'Email sent successfully' });
    }
    catch (err) {
        res.status(500);
        throw new Error('Email could not be sent');
    }
});

// @desc    Reset password
usersController.resetPassword = asyncHandler(async (req, res) => {
    const newPassword = req.body.password;
    const token = req.params.token;

    // Sanity checking password
    if (!newPassword) {
        res.status(400);
        throw new Error('Password is required');
    }

    // Sanity checking token
    if (!token) {
        res.status(400);
        throw new Error('Token is required');
    }

    // confirm token validity
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Finding token in DB
    const tokenExists = await Token.findOne({ token: hashedToken });

    // If token not found
    if (!tokenExists) {
        res.status(404);
        throw new Error('Token not found');
    }

    // Finding user in DB
    const user = await User.findById(tokenExists.userId);

    // If user not found
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    // If user found
    user.password = newPassword;

    // Save user
    const savePassword = await user.save();

    // If password not saved
    if (!savePassword) {
        res.status(400);
        throw new Error('Password not saved');
    }

    // Delete token
    await Token.deleteOne({ token: hashedToken });

    res.status(200).json({ success: true, message: 'Password changed successfully' });
});

// Export container
module.exports = usersController;