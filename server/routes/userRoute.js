const express = require('express');
const { getUsers, getUser, createUser, updateUser, deleteUser, loginUser, logoutUser, changePassword, forgotPassword, resetPassword } = require('../controllers/usersController');
const authHelpers = require('../middleware/authMiddleware');


const router = express.Router();

// create user
router.route('/').post(createUser);
// get users
router.route('/').get(getUsers);
// login user
router.route('/login').post(loginUser);
// get user profile
router.route('/profile').get(authHelpers.authenticateToken, getUser);
// update user profile
router.route('/profile/update').put(authHelpers.authenticateToken, updateUser);
// delete user profile
router.route('/profile/delete').delete(authHelpers.authenticateToken, deleteUser);
// logout user
router.route('/profile/logout').get(authHelpers.authenticateToken, logoutUser);
//  Change password
router.route('/profile/change-password').put(authHelpers.authenticateToken, changePassword);
// Forgot password
router.route('/forgot-password').post(forgotPassword);
// Reset password using mailgun
router.route('/reset-password/:token').post(resetPassword);

module.exports = router;