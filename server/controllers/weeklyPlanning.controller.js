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

module.exports = router;
