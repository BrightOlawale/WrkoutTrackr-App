const mongoose = require('mongoose');

// Create the schema
const workoutCategorySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        require: [true, 'User must exist']
    },
    name: {
        type: String,
        required: [true, 'Please enter a name'],
        trim: true,
    },
    description: {
        type: String,
        required: [true, 'Please enter a description'],
        trim: true,
    },
    type: {
        type: String,
        required: [true, 'Please enter a workout'],
        trim: true,
    },
    muscle: {
        type: String,
        required: [true, 'Please enter a muscle'],
        trim: true,
    },
    equipment: {
        type: String,
        required: [true, 'Please enter a equipment'],
        trim: true,
    },
    instructions: {
        type: String,
        required: false,
        trim: true,
    }
},
{
    timestamps: true
}
);

// Create the model
const WorkoutCategory = mongoose.model('UserWorkout', workoutCategorySchema);

// Export the model
module.exports = WorkoutCategory;