const mongoose = require("mongoose");

const RecipeSchema = new mongoose.Schema({
    recipeName: {
        type: String,
        required: true
    },
    ingredients: {
        type: Object,
        required: true
    }
})

module.exports = mongoose.model("Recipe", RecipeSchema);