const router = require("express").Router();
const Recipe = require("../models/recipe.model");

const serverError = (res, error) => {
  console.log("Server-side error");
  return res.status(500).json({
    Error: error.message,
  });
};

// ------------------------ POST ----------------------

router.post("/storeRecipe", async (req, res) => {
  try {
    const recipeInfo = new Ingredient({
      recipeName: req.body.recipeName,
      cost: req.body.cost
    });

    const newRecipeInfo = await recipeInfo.save();
    if (newIngredientInfo) {
      console.log("newRecipe:", newRecipeInfo);
    }
    res.status(200).json({
      newRecipeInfo: newRecipeInfo,
      message: `Success! Recipe Saved!:${req.body}`,
    });
  } catch (err) {
    console.log(Recipe)
    res.status(500).json({
      ERROR: err.message,
    });
  }
});

// ------------------------- GET -----------------------

router.get("/find/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log("id:", id);
    const findRecipe = await Recipe.findOne({ _id: id });

    findRecipe
      ? res.status(200).json({
          message: "Found!",
          findRecipe,
        })
      : res.status(404).json({
          message: `Can't Find the Recipe.`,
        });
  } catch (err) {
    serverError(res, err);
  }
})

// --------------------------Get All ---------------------
  router.get("/", async (req, res) => {
    try {
      const getAllRecipes = await Recipe.find();
      getAllRecipes
        ? res.status(200).json({
            message: "All Ingredients:",
            getAllRecipes,
          })
        : res.status(404).json({
            message: `No Recipes Found!`,
          });
    } catch (err) {
      serverError(res, err);
    }
  });
/* 
----------------------------- Delete Ingredient Endpoint ------------------------
*/
router.delete("/delete/:id", async (req, res) => {
  // res.header("Access-Control-Allow-Origin", "*");
  // res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  // console.log("deleting...");
  try {
    //* Pull the ingredient's info from the req
    const {id} = req.params;

    const recipeId = { _id: id };

    // const returnOption = { new: true };

    const deleteRecipe = await Recipe.deleteOne(recipeId);

    deleteRecipe.deletedCount === 1
      ? res.status(200).json({
          message: `The recipe was successfully deleted!`,
        })
      : res.status(404).json({
          message: `The recipe was unable to be deleted.`,
        });
  } catch (err) {
    console.log("oops");
    serverError(res, err);
  }
});

module.exports = router;
