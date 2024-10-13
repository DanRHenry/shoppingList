const router = require("express").Router();
const User = require("../models/user.model");
const jwt = require("jsonwebtoken")
const SECRET = process.env.JWT;
const requireValidation = require("../middleware/validate-session");

/* 
  Require in the bcryptjs dependency by storing it in a variable.
  Bcryptjs will be included in our controller --> add bcryptjs in any file where we want encryption to take place.
*/
const bcrypt = require("bcryptjs")


const serverError = (res, error) => {
  console.log("Server-side error");
  return res.status(500).json({
    Error: error.message,
  });
};

router.post("/signup", async (req, res) => {
  console.log("req:", req.body)

  try {
    const user = new User({
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 13),
      family: req.body.family,
    });

    const newUser = await user.save();

    // Create a token using the sign method of jwt, (payload, message, exp) - exp removed to keep forever

    const token = jwt.sign({ id: user._id }, SECRET);

    // const token = jwt.sign({ id: user._id }, SECRET, { expiresIn: "1 day" });

    res.status(200).json({
      user: newUser,
      message: "Success! User Created!",
      token,
    });
  } catch (err) {
    res.status(500).json({
      ERROR: err.message,
    });
  }
});

/* 
----------------------------- Login Endpoint ------------------------
*/

router.post("/login", async (req, res) => {
  // res.header("Access-Control-Allow-Origin", "*");
  try {
    const { email, password, family } = req.body;

    const user = await User.findOne({ email: email });

    if (!user) throw new Error("Email or password does not match.");

    if (!user.family === family) throw new Error("You're not in a family");

    const passwordMatch = bcrypt.compare(password, user.password);

    if (!passwordMatch) throw new Error("Email or password does not match.");

    // const token = jwt.sign({ id: user._id }, SECRET, {
    //   expiresIn: 60 * 60 * 24,
    // });
        const token = jwt.sign({ id: user._id }, SECRET);

    return res.status(200).json({
      message: "Login successful!",
      user,
      token,
    });
  } catch (err) {
    serverError(res, err);
  }
});

/* 
----------------------------- Find User Endpoint ------------------------
*/

router.get("/find", requireValidation, async (req, res) => {
      try {
      const id = req.user._id;

      const findUser = await User.findOne({ _id: id });

      findUser
        ? res.status(200).json({
            message: "Found!",
            findUser,
          })
        : res.status(404).json({
            message: `No Users Found.`,
          });
    } catch (err) {
      serverError(res, err);
    }
})


module.exports = router;
