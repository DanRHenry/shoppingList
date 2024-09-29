const mongoose = require("mongoose");

const RecipeSchema = new mongoose.Schema({
    recipeName: {
        type: String,
        required: true
    },
    time: {
        type: String,
        required: true
    },
    temperature: {
        type: String,
        required: true
    },
    ingredients: {
        type: Array,
        required: true
    },
    instructions: {
        type: Array,
        required: true
    }
})

module.exports = mongoose.model("Recipe", RecipeSchema);