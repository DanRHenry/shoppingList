const router = require("express").Router();
const RecipeIngredient = require("../models/ingredient.model");

const serverError = (res, error) => {
  console.log("Server-side error");
  return res.status(500).json({
    Error: error.message,
  });
};

// ------------------------ POST ----------------------

router.post("/storeRecipeIngredient", async (req, res) => {
  try {
    const ingredientInfo = new RecipeIngredient({
      recipeIngredientName: req.body.recipeIngredientName,
      quantity: req.body.quantity,
      unit: req.body.unit,
      calories: req.body.calories
    });

    const newIngredientInfo = await ingredientInfo.save();
    if (newIngredientInfo) {
      // console.log("newIngredient:", newIngredientInfo);
    }
    res.status(200).json({
      ingredientInfo: newIngredientInfo,
      message: `Success! RecipeIngredient Saved!`,
    });
  } catch (err) {
    console.log(RecipeIngredient)
    res.status(500).json({
      ERROR: err.message,
    });
  }
});

// ------------------------- Find One -----------------------

router.post("/find", async (req, res) => {
  try {
    const { recipeIngredientName } = req.body;
    // console.log("IngredientName:",recipeIngredientName)
    const findIngredient = await RecipeIngredient.findOne({ "recipeIngredientName": recipeIngredientName });

    findIngredient
      ? res.status(200).json({
          message: "Found!",
          findIngredient,
        })
      : res.status(404).json({
          message: `Can't Find the RecipeIngredient.`,
        });
  } catch (err) {
    serverError(res, err);
  }
})

// --------------------------Get All ---------------------
  router.get("/", async (req, res) => {
    try {
      const getAllRecipeIngredients = await RecipeIngredient.find();
      getAllRecipeIngredients
        ? res.status(200).json({
            message: "All Recipe Ingredients:",
            getAllRecipeIngredients,
          })
        : res.status(404).json({
            message: `No Recipe Ingredients Found!`,
          });
    } catch (err) {
      serverError(res, err);
    }
  });
/* 
----------------------------- Delete RecipeIngredient Endpoint ------------------------
*/
router.delete("/delete/", async (req, res) => {
// router.delete("/delete/:id", async (req, res) => {
  // res.header("Access-Control-Allow-Origin", "*");
  // res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  // console.log("deleting...");
  try {
    //* Pull the ingredient's info from the req
    // const {id} = req.params;
    const {recipeIngredientName } = req.body;

    const recipeIngredientID = { recipeIngredientName: recipeIngredientName };
    // const recipeIngredientID = { _id: id };
    // const returnOption = { new: true };

    const deleteRecipeIngredient = await RecipeIngredient.deleteOne(recipeIngredientID);

    deleteRecipeIngredient.deletedCount === 1
      ? res.status(200).json({
          message: `The recipe ingredient was successfully deleted!`,
        })
      : res.status(404).json({
          message: `The recipe ingredient was unable to be deleted.`,
        });
  } catch (err) {
    console.log("oops");
    serverError(res, err);
  }
});

module.exports = router;
