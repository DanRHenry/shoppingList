const mongoose = require("mongoose");

const RecipeSchema = new mongoose.Schema({
    recipeName: {
        type: String,
        required: true
    },
    ingredients: {
        type: Object,
        required: true
    },
    // ingredientName: {
    //     type: String,
    //     required: true
    // },
    // quantity: {
    //     type: Object,
    //     required: true
    // },
    // unit: {
    //     type: Object,
    //     required: true
    // },
    // calories: {
    //     type: Object,
    //     required: true
    // }
})

module.exports = mongoose.model("Recipe", RecipeSchema);