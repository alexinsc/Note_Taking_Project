const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Define the User schema
const userSchema = new mongoose.Schema({ //schema de l'utilisateur
    email: {
        // Email field with validation
        type: String,
        required: true,
        unique: true,  // Ensure no two users can register with the same email
        match: [/.+\@.+\..+/, 'Please enter a valid email']  // Validate email format
    },
    password: {
        // Password field with validation
        type: String,
        required: true
    },
    createdAt: {
        // Timestamp to track when the user was created
        type: Date,
        default: Date.now
    }
});

// Pre-save hook to hash the password before saving the user
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();  // If password isn't modified, skip

    // Hash the password using bcrypt - Salagee du mot de passe + Encription avec un hash
    const salt = await bcrypt.genSalt(10); //Générer un salt pour le mot de passe (10 est le nombre de rounds)
    this.password = await bcrypt.hash(this.password, salt); //Encription du mot de passe
    next();
});

// Method to compare entered password with stored hashed password
userSchema.methods.matchPassword = async function (enteredPassword) { //fonction pour comparer le mot de passe entre l'entrée et le mot de passe enregistré
    return await bcrypt.compare(enteredPassword, this.password); //encription du mot de passe
};

// Create the User model
const User = mongoose.model('User', userSchema);
module.exports = User; //exporter le modèle de l'utilisateur
