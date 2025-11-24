const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    googleId: { 
        type: String, 
        required: true,
        unique: true
    },
    displayName: { 
        type: String, 
        required: true 
    },
    email: { 
        type: String 
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

// Export the model as 'User' (Mongoose will create a 'users' collection)
module.exports = mongoose.model('User', UserSchema);
