const WorkoutCategory = require('../models/userWorkoutModel');
const WorkoutDefault = require('../models/workoutDefaultModel');
const asyncHandler = require('express-async-handler');


// Export container
const workoutController = {};

// @desc    Get all workout 
workoutController.getWorkouts = asyncHandler(async (req, res) => {
    const description = req.query.description;
    let query = {};

    if (description) {
        query = { description: description };
    }

    // Get user's personalized workouts
    const workouts = await WorkoutCategory.find(query);

    if (!workouts) {
        res.status(404);
        throw new Error('No workouts found');
    }

    // Get default workouts
    const defaultWorkouts = await WorkoutDefault.find(query);

    if (!defaultWorkouts) {
        res.status(404);
        throw new Error('No workouts found');
    };

    res.status(200).json({
        success: true,
        workouts,
        defaultWorkouts
    });
});

// @desc    Get single workout
workoutController.getOneWorkout = asyncHandler(async (req, res) => {
    const workoutId = req.params.id ? req.params.id : false;

    // Sanity checking
    if (!workoutId) {
        res.status(400);
        throw new Error('Workout ID is required');
    }

    // Finding workout in DB
    let workout = await WorkoutCategory.findById(workoutId);

    // If workout not found search in default workouts
    if (!workout) {
        workout = await WorkoutDefault.findById(workoutId);

        if (!workout) {
            res.status(404);
            throw new Error('Workout not found');
        }
    }

    res.status(200).json({ success: true, workout });
});

// @desc    Create workout
workoutController.createWorkout = asyncHandler(async (req, res) => {
    // Required fields: name, type, muscle, equipment, instructions
    const { name, type, muscle, equipment, instructions } = req.body;

    // Sanity checking
    if (!name || !type || !muscle || !equipment || !instructions) {
        res.status(400);
        throw new Error('Please enter all fields');
    }

    // Checking if workout already exists
    const workoutExists = await WorkoutCategory.findOne({ name });

    if (workoutExists) {
        res.status(400);
        throw new Error('Workout already exists');
    }

    // Creating workout
    const workout = await WorkoutCategory.create({
        user: req.user._id,
        name,
        description: "Personalized workout",
        type,
        muscle,
        equipment,
        instructions
    });

    // If workout not created
    if (!workout) {
        res.status(400);
        throw new Error('Workout not created');
    }

    res.status(201).json({
        success: true,
        workout
    });
});

// @desc    Update workout
workoutController.updateWorkout = asyncHandler(async (req, res) => {
    const workoutId = req.params.id ? req.params.id : false;
    const { name, type, muscle, equipment, instructions } = req.body;

    // Sanity checking the workout ID
    if (!workoutId) {
        res.status(400);
        throw new Error('Workout ID is required');
    }

    // Sanity checking the fields
    if (!name && !type && !muscle && !equipment && !instructions) {
        res.status(400);
        throw new Error('Please enter at least one field to update');
    }

    // Finding workout in user workout DB
    let workout = await WorkoutCategory.findById(workoutId);
    // Flag to check if workout is user's workout or default workout
    let isUserWorkout = true;

    // If workout not found search in default workouts
    if (!workout) {
        workout = await WorkoutDefault.findById(workoutId);

        if (!workout) {
            res.status(404);
            throw new Error('Workout not found');
        }
        // If workout found in default workouts
        isUserWorkout = false;
    }


    // Updating workout
    workout.name = name ? name : workout.name;
    workout.type = type ? type : workout.type;
    workout.muscle = muscle ? muscle : workout.muscle;
    workout.equipment = equipment ? equipment : workout.equipment;
    workout.instructions = instructions ? instructions : workout.instructions;

    // If it's a default workout, create the changes as a new new user workout
    if (!isUserWorkout) {
        const newWorkout = await WorkoutCategory.create({
            user: req.user._id,
            name: workout.name,
            description: "Personalized workout",
            type: workout.type,
            muscle: workout.muscle,
            equipment: workout.equipment,
            instructions: workout.instructions
        });

        // If workout not created
        if (!newWorkout) {
            res.status(400);
            throw new Error('Workout not created');
        }

        res.status(201).json({
            success: true,
            newWorkout
        });
    } else {
        // If it's a user workout, save the changes
        const updatedWorkout = await workout.save();

        // If workout not updated
        if (!updatedWorkout) {
            res.status(400);
            throw new Error('Workout not updated');
        }
    
        res.status(200).json({
            success: true,
            updatedWorkout
        });
    }
});

// @desc    Delete a workout
workoutController.deleteWorkout = asyncHandler(async (req, res) => {
    const workoutId = req.params.id;

    // Sanity checking
    if (!workoutId) {
        res.status(400);
        throw new Error('Workout ID is required');
    }

    // Finding workout in DB
    const workout = await WorkoutCategory.findById(workoutId);

    // If workout not found
    if (!workout) {
        res.status(404);
        throw new Error('Workout not found');
    }

    // Deleting workout
    await WorkoutCategory.deleteOne({ _id: workoutId });

    res.status(200).json({
        success: true,
        message: 'Workout successfully deleted'
    });
});

// // @desc    Delete all workouts
// workoutController.deleteAllWorkouts = asyncHandler(async (req, res) => {
//     // Deleting all workouts
//     await WorkoutCategory.deleteMany({});

//     res.status(200).json({
//         success: true,
//         message: 'All workouts successfully deleted'
//     });
// });

// Export container
module.exports = workoutController;