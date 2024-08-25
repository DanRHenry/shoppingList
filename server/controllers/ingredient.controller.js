const router = require("express").Router();
const Ingredient = require("../models/ingredient.model");

const serverError = (res, error) => {
  console.log("Server-side error");
  return res.status(500).json({
    Error: error.message,
  });
};

// ------------------------ POST ----------------------

router.post("/storeIngredient", async (req, res) => {
  try {
    const ingredientInfo = new Ingredient({
      ingredientName: req.body.ingredientName,
      cost: req.body.cost
    });

    const newIngredientInfo = await ingredientInfo.save();
    if (newIngredientInfo) {
      // console.log("newIngredient:", newIngredientInfo);
    }
    res.status(200).json({
      ingredientInfo: newIngredientInfo,
      message: `Success! Ingredient Saved!:${req.body}`,
    });
  } catch (err) {
    console.log(Ingredient)
    res.status(500).json({
      ERROR: err.message,
    });
  }
});

// ------------------------- Find One -----------------------

router.post("/find", async (req, res) => {
  try {
    const { ingredientName } = req.body;
    console.log("IngredientName:",ingredientName)
    const findIngredient = await Ingredient.findOne({ "ingredientName": ingredientName });

    findIngredient
      ? res.status(200).json({
          message: "Found!",
          findIngredient,
        })
      : res.status(404).json({
          message: `Can't Find the Ingredient.`,
        });
  } catch (err) {
    serverError(res, err);
  }
})

// --------------------------Get All ---------------------
  router.get("/", async (req, res) => {
    try {
      const getAllIngredients = await Ingredient.find();
      getAllIngredients
        ? res.status(200).json({
            message: "All Ingredients:",
            getAllIngredients,
          })
        : res.status(404).json({
            message: `No Questions Found!`,
          });
    } catch (err) {
      serverError(res, err);
    }
  });
/* 
----------------------------- Delete Ingredient Endpoint ------------------------
*/
router.delete("/delete/", async (req, res) => {
// router.delete("/delete/:id", async (req, res) => {
  // res.header("Access-Control-Allow-Origin", "*");
  // res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  // console.log("deleting...");
  try {
    //* Pull the ingredient's info from the req
    // const {id} = req.params;
    const {ingredientName } = req.body;

    const ingredientID = { ingredientName: ingredientName };
    // const ingredientID = { _id: id };
    // const returnOption = { new: true };

    const deleteIngredient = await Ingredient.deleteOne(ingredientID);

    deleteIngredient.deletedCount === 1
      ? res.status(200).json({
          message: `The ingredient was successfully deleted!`,
        })
      : res.status(404).json({
          message: `The ingredient was unable to be deleted.`,
        });
  } catch (err) {
    console.log("oops");
    serverError(res, err);
  }
});

module.exports = router;
