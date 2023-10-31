const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true,
        min: 0
    },
    description: {
        type: String,
        required: true,
        
    },
    address: {
        type: String,
        required: true,
        
    },
    category: {
        type: String,
        enum: ['Studio Unit', 'Villa', 'Family Villa', 'Suite', 'Condo Unit']
    },
    image: {
        data: Buffer,
        contentType: String
    },
    review: {
        type: String,
       
    }
})

const Listing = mongoose.model('Listing', listingSchema);

module.exports = Listing;