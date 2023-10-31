const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    review: {
        type: String,
       
    }
})

const Listing = mongoose.model('Listing', listingSchema);

module.exports = Listing;