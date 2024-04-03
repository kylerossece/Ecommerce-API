const mongoose = require("mongoose");

//[Schema/Blueprint]

const cartSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: [true, 'User ID is Required']
    },
    cartItems: [
    {
        productId: {
            type: String,
            required: [true, 'Product ID is Required']
        },
        quantity: {
            type: Number,
            required: [true, 'Quantity is Required']
        },
        subtotal: {
            type: Number,
            required: [true, 'Subtotal is Required']
        }
    }
],
    totalPrice: {
        type: Number,
        required: [true, 'TotalPrice is Required']
    },
    orderedOn: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Cart', cartSchema);
