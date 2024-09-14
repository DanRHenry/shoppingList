const mongoose = require("mongoose");

const IngredientSchema = new mongoose.Schema({
    ingredientName: {
        type: String,
        required: true
    },
    cost: {
        type: Number,
        required: false
    },
    recipe: {
        type: Object,
        required: false
    }
})

/* 
    quantity: {
        type: Object,
        required: true
    },
    unit: {
        type: Object,
        required: true
    },
    calories: {
        type: Object,
        required: true
    }
*/

module.exports = mongoose.model("Ingredient", IngredientSchema);