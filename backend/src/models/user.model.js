import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
        trim: true// Removes whitespace from both ends of the string
    },
    email: {
        type: String,
        required: true,
        unique: true, // Ensures that no two users can have the same email
        trim: true,
    },
    password: {
        type: String,
        required: true,
        minlength: 4 
    },
    bio: {
        type: String,
        trim: true,
        default: ''
    },
    profilePic: {
        type: String,
        default: ''
    },
    nativeLanguage: {
        type: String,
        trim: true,
        default: ''
    },
    learningLanguage: {
        type: String,
        trim: true,
        default: ''
    },
    location: {
        type: String,
        trim: true,
        default: ''
    },
    isOnboarded: {
        // this should check if user has completed his/her profile
        type: Boolean,
        default: false// false means user has not completed onboarding
    },
    friends: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User' // Refers to the User model
    }]// Array to hold friends' user IDs
},{timestamps: true});
//timestamps: true -> automatically adds createdAt and updatedAt fields

//pre hook --> Hash the password before saving the user
import bcrypt from 'bcryptjs';
userSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }
    next();// Call next() to continue with the save operation
});

//comparePassword method to check if the password is correct
userSchema.methods.comparePassword = async function(password) {
    return await bcrypt.compare(password, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;