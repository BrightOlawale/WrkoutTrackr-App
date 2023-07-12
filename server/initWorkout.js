// const workoutCategory = require('./models/userWorkoutModel');
const defaultWorkout = require('./models/workoutDefaultModel');
const helpers = require('./helpers');
const config = require('./config/connectDB');


// Generate container
const initializer = {};

// Function to create default categories
initializer.createDefaultCategories = async () => {
    try {
         // Get beginner categories
        const beginnerCategories = await helpers.getCategories('beginner');
        // Get intermediate categories
        const intermediateCategories = await helpers.getCategories('intermediate');
        // Get advanced categories
        const advancedCategories = await helpers.getCategories('expert');

        // Add beginner categories to the database
        for (const category of beginnerCategories) {
            await defaultWorkout.create({
                name: category.name,
                description: 'beginner',
                type: category.type,
                muscle: category.muscle,
                equipment: category.equipment,
                instructions: category.instructions,
            });
        }

        // Add intermediate categories to the database
        for (const category of intermediateCategories) {
            await defaultWorkout.create({
                name: category.name,
                description: 'intermediate',
                type: category.type,
                muscle: category.muscle,
                equipment: category.equipment,
                instructions: category.instructions,
            });
        }

        // Add advanced categories to the database
        for (const category of advancedCategories) {
            await defaultWorkout.create({
                name: category.name,
                description: 'advanced',
                type: category.type,
                muscle: category.muscle,
                equipment: category.equipment,
                instructions: category.instructions,
            });
        }

        console.log('DB: Default categories created');
    } catch (error) {
        console.error(error);
        throw new Error('DB: Default categories creation failed');        
    }
};

// // Function to create default workout from the already existing default categories for the new user
// initializer.createDefaultWorkout = async (userId) => {

//     // Get beginner categories
//     const beginnerCategories = await defaultWorkout.find({ description: 'beginner' });

//     // Get intermediate categories
//     const intermediateCategories = await defaultWorkout.find({ description: 'intermediate' });

//     // Get advanced categories
//     const advancedCategories = await defaultWorkout.find({ description: 'advanced' });


//     // Insert beginner categories int the workout 
//     for (const category of beginnerCategories) {
//         await workoutCategory.create({
//             user: userId,
//             name: category.name,
//             description: category.description,
//             type: category.type,
//             muscle: category.muscle,
//             equipment: category.equipment,
//             instructions: category.instructions,
//         });
//     }  

//     // Insert intermediate categories int the workout 
//     for (const category of intermediateCategories) {
//         await workoutCategory.create({
//             user: userId,
//             name: category.name,
//             description: category.description,
//             type: category.type,
//             muscle: category.muscle,
//             equipment: category.equipment,
//             instructions: category.instructions,
//         });
//     }

//     // Insert advanced categories int the workout
//     for (const category of advancedCategories) {
//         await workoutCategory.create({
//             user: userId,
//             name: category.name,
//             description: category.description,
//             type: category.type,
//             muscle: category.muscle,
//             equipment: category.equipment,
//             instructions: category.instructions,
//         });
//     }

//     console.log('DB: Default workout created');
// };

// // Function to delete a user's workout
// initializer.deleteWorkout = async (userId) => {
//     // Sanity checking
//     if (!userId) {
//         throw new Error('DB: User ID is required');
//     }

//     // Delete user's workout
//     const workout = await workoutCategory.deleteOne({ user: userId });

//     // Sanity checking
//     if (!workout) {
//         throw new Error('DB: Workout deletion failed');
//     }

//     console.log('DB: Workout deleted');
// };

// Export container
module.exports = initializer;
