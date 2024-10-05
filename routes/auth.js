const express = require('express'); //importer le module express
const router = express.Router(); //créer un routeur express
const User = require('../models/User'); //importer le modèle de l'utilisateur
const jwt = require('jsonwebtoken'); //importer le module jsonwebtoken

// REGISTER

// POST /api/auth/register - Register a new user
router.post('/register', async (req, res) => { //route pour enregistrer un nouvel utilisateur
    const { email, password } = req.body; //récupérer l'email et le mot de passe de la requête

    try {
        // Check if user already exists
        const existingUser = await User.findOne({ email }); //Variable pour vérifier si l'utilisateur existe déjà
        if (existingUser) { //Si l'utilisateur existe déjà
            return res.status(400).json({ message: 'User already exists' }); //retourner un message d'erreur
        }

        // Create a new user
        const user = await User.create({ email, password }); 

        // Create a JWT token
        // JWT (JSON Web Token) is a standard for creating access tokens that assert some number of claims
        // The server generates a token and sends it to the client
        // The client sends the token in an Authorization header in subsequent requests
        // The server verifies the token and sends the response
        // The token is signed using a secret key, which is only known to the server
        // The token contains a payload with the user ID and an expiration time
        // The server verifies the token and extracts the user ID from the payload
        // The server can then use the user ID to identify the user and send the response
        // The token is sent in the Authorization header as a Bearer token
        // The token is sent in the format "Bearer <token>"

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { //Créer un token JWT
            expiresIn: '1h',  // Token will expire in 1 hour
        });

        // Send the token back to the client
        res.status(201).json({ token });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;

// LOGIN

// POST /api/auth/login - Log in an existing user
router.post('/login', async (req, res) => { //route pour connecter un utilisateur existant
    const { email, password } = req.body; //récupérer l'email et le mot de passe de la requête

    try {
        // Find the user by email
        const user = await User.findOne({ email }); //Trouver l'utilisateur par email
        if (!user) { //Si l'utilisateur n'existe pas ou l'email est incorrect
            return res.status(400).json({ message: 'Invalid credentials' }); //retourner un message d'erreur
        }

        // Check if the entered password matches the stored hashed password
        const isMatch = await user.matchPassword(password); //Vérifier si le mot de passe entré correspond au mot de passe enregistré
        if (!isMatch) { //Si le mot de passe ne correspond pas
            return res.status(400).json({ message: 'Invalid credentials' }); //retourner un message d'erreur
        }

        // Generate JWT token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { //Créer un token JWT
            expiresIn: '1h',
        });

        // Send the token to the client
        res.status(200).json({ token });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;

// PROTECT

// Middleware to protect routes
const protect = async (req, res, next) => { //Middleware pour protéger les routes
    let token; //Variable pour stocker le token

    // Check if the token is sent in the Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) { 
        try {
            token = req.headers.authorization.split(' ')[1]; //Extraire le token de l'en-tête Authorization

            const decoded = jwt.verify(token, process.env.JWT_SECRET); //Vérifier le token

            req.user = decoded.id; //Attacher l'ID de l'utilisateur à l'objet de requête pour une utilisation future

            next();
        } catch (error) {
            res.status(401).json({ message: 'Not authorized' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'No token, authorization denied' });
    }
};

module.exports = protect;
