const express = require('express');
const { getWorkouts, getOneWorkout, createWorkout, updateWorkout, deleteWorkout } = require('../controllers/workoutController');
const authHelpers = require('../middleware/authMiddleware');

const router = express.Router();

// Get all workouts
router.route('/').get(authHelpers.authenticateToken, getWorkouts);
// Get single workout
router.route('/:id').get(authHelpers.authenticateToken, getOneWorkout);
// Create workout
router.route('/').post(authHelpers.authenticateToken, createWorkout);
// Update workout
router.route('/:id').put(authHelpers.authenticateToken, updateWorkout);
// Delete workout
router.route('/:id').delete(authHelpers.authenticateToken, deleteWorkout);

module.exports = router;    