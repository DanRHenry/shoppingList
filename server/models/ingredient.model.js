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

module.exports = mongoose.model("Ingredient", IngredientSchema);