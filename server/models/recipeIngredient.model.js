const mongoose = require("mongoose");

const RecipeIngredientSchema = new mongoose.Schema({
    recipeIngredientName: {
        type: String,
        required: true
    },
    calories: {
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

module.exports = mongoose.model("RecipeIngredient", RecipeIngredientSchema);