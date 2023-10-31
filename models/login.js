const mongoose = require('mongoose');

const loginSchema = new mongoose.Schema({
    email: {
        type: Number,
        required: true,
        
    },
    password: {
        type: String,
        required: true,
        
    }
})

const Login = mongoose.model('Login', loginSchema);

module.exports = Login;