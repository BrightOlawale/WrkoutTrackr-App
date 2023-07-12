const User = require('../models/usersModel');
const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');
const authHelpers = require('../middleware/authMiddleware');
const helpers = require('../helpers');

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

// Export container
module.exports = usersController;