const router = require("express").Router();
// const WeeklyPlanning = require("../models/ingredient.model");
// const WeeklyPlanning = require("../models/recipeIngredient.model");
const WeeklyPlanning = require("../models/weeklyPlanning.model")

const serverError = (res, error) => {
  console.log("Server-side error");
  return res.status(500).json({
    Error: error.message,
  });
};

// ------------------------ POST ----------------------

router.post("/storeWeeklyData", async (req, res) => {
  try {
    const date = req.body.date;

    const findWeeklyPlanningInformation = await WeeklyPlanning.findOne({
      date: date,
    });

    if (!findWeeklyPlanningInformation) {
        const weeklyPlanningInformation = new WeeklyPlanning({
          date: req.body.date,
          breakfast: req.body.breakfast,
          lunch: req.body.lunch,
          dinner: req.body.dinner,
          snacks: req.body.snacks
        });

        const newWeeklyPlanningInformation = await weeklyPlanningInformation.save();

        res.status(200).json({
          weeklyPlanningInformation: newWeeklyPlanningInformation,
          message: `Success! WeeklyPlanning Saved!`,
        });

    } else {
      res.status(200).json({
        message: `Existing Information`,
      });
    }
  } catch (err) {
    serverError(res, err);
  }
});

// ------------------------- Find One -----------------------

router.get("/findday", async (req, res) => {
  try {
    const date = req.body.date;
    console.log("date", date);
    const findWeeklyPlanningDayInformation = await WeeklyPlanning.findOne({
      date: date,
    });

    findWeeklyPlanningDayInformation
      ? res.status(200).json({
          message: "Found!",
          findWeeklyPlanningDayInformation,
        })
      : res.status(404).json({
          message: `Can't Find the WeeklyPlanning Entry.`,
        });
  } catch (err) {
    serverError(res, err);
  }
});

/* 
router.post("/find", async (req, res) => {
  try {
    const date = req.body.date;
    console.log("date", date);
    const findWeeklyPlanningInformation = await WeeklyPlanning.findOne({
      date: date,
    });

    findWeeklyPlanningInformation
      ? res.status(200).json({
          message: "Found!",
          findWeeklyPlanningInformation,
        })
      : res.status(404).json({
          message: `Can't Find the WeeklyPlanning Entry.`,
        });
  } catch (err) {
    serverError(res, err);
  }
});
*/

// --------------------------Get All ---------------------
router.get("/", async (req, res) => {
  try {
    const getAllWeeklyPlanning = await WeeklyPlanning.find();
    getAllWeeklyPlanning
      ? res.status(200).json({
          message: "All Weekly Planning:",
          getAllWeeklyPlanning,
        })
      : res.status(404).json({
          message: `No Weekly Planning Found!`,
        });
  } catch (err) {
    serverError(res, err);
  }
});
/* 
----------------------------- Delete WeeklyPlanning Endpoint ------------------------
*/
router.delete("/delete/", async (req, res) => {
  try {
    const { date } = req.body;

    const weeklyPlanningID = { date: date };


    const deleteWeeklyPlanningEntry = await WeeklyPlanning.deleteOne(
      weeklyPlanningID
    );

    deleteWeeklyPlanningEntry.deletedCount === 1
      ? res.status(200).json({
          message: `The weekly planning entry was successfully deleted!`,
        })
      : res.status(404).json({
          message: `The weekly planning entry was unable to be deleted.`,
        });
  } catch (err) {
    console.log("oops");
    serverError(res, err);
  }
});

/* ------------------------- Patch WeeklyPlanning Endpoint -------------------*/
// validateSession
router.patch("/updateday/:id",async (req, res) => {
  try {
    //1. Pull value from parameter
    // const { id } = req.params; // Commented out
    // Create a filter to check both id from req.params & owner_id against id from the token
    const filter = {
      _id: req.params.id,
      owner_id: req.user._id
    };


    //2. Pull data from the body.
    const info = req.body;
    // const { title, genre, rating } = req.body;
    
    //3. Use method to locate document based off ID and pass in new information.
    const returnOption = {new: true}// 
    // const updatedOption = {new: true};

    //* findOneAndUpdate(query, document, options)
    // returnOptions allows us to view the updated document
    const updatedDay = await Movie.findOneAndUpdate(filter, info, returnOption);
    // const updatedDay = await Movie.findOneAndUpdate({_id: id}, info, returnOption);
    // const update = await Movie.findOneAndUpdate({_id: id,});
    // const update = await Movie.findOneAndUpdate({id: _id});
    // if (!update) throw new Error ("ID Not Found!");
    //4. Respond to client.
    res.status(200).json({
      message: `${updatedDay} has been updated successfully!`,
      updatedDay,
    });
  } catch (err) {
    errorResponse(res, err);
  }
});

module.exports = router;
