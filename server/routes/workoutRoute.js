const express = require('express');
const { getWorkouts, getOneWorkout, createWorkout, updateWorkout, deleteWorkout } = require('../controllers/workoutController');
const authHelpers = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/').get(authHelpers.authenticateToken, getWorkouts);
router.route('/:id').get(authHelpers.authenticateToken, getOneWorkout);
router.route('/').post(authHelpers.authenticateToken, createWorkout);
router.route('/:id').put(authHelpers.authenticateToken, updateWorkout);
router.route('/:id').delete(authHelpers.authenticateToken, deleteWorkout);

module.exports = router;    