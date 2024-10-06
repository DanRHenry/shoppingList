const router = require("express").Router();
const User = require("../models/user.model");
const requireValidation = require("../middleware/validate-session");

const serverError = (res, error) => {
  console.log("Server-side error");
  return res.status(500).json({
    Error: error.message,
  });
};

//! Had to switch from bcrypt to bcryptjs to work on linux
/* 
  Require in the bcryptjs dependency by storing it in a variable.
  Bcryptjs will be included in our controller --> add bcryptjs in any file where we want encryption to take place.
*/
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const SECRET = process.env.JWT;

router.post("/signup", async (req, res) => {
  console.log("req:", req.body)

  try {
    const user = new User({
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 13),
      family: req.body.family,
    });

    const newUser = await user.save();

    // Create a token using the sign method of jwt, (payload, message, exp)
    // The payload should be the user ID, and secret message should eventually be in the .env
    const token = jwt.sign({ id: user._id }, SECRET, { expiresIn: "1 day" });

    if (newUser) {
      console.log("newUser:", newUser, "token:", token);
    }
    // res.header("Access-Control-Allow-Origin", "*");
    // res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

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
  // console.log("req:", req)
  res.header("Access-Control-Allow-Origin", "*");
  // res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//   console.log("connected to login")
//   console.log('req.body',req.body)
  try {
    const { email, password, family } = req.body;
    // console.log("email:",email, "password:",password, "family:", family)
    const user = await User.findOne({ email: email });

    console.log("user:",user)
    if (!user) throw new Error("Email or password does not match.");
    if (!user.family === family) throw new Error("You're not in a family");

    const passwordMatch = await bcrypt.compare(password, user.password);
    // console.log("passwordMatch",passwordMatch)
    if (!passwordMatch) throw new Error("Email or password does not match.");

    const token = jwt.sign({ id: user._id }, SECRET, {
      expiresIn: 60 * 60 * 24,
    });
    return res.status(200).json({
      message: "Login successful!",
      user,
      token,
    });
  } catch (err) {
    console.log("here's the catch")
    serverError(res, err);
  }
});

/* 
----------------------------- Find User Endpoint ------------------------
*/

router.get("/find", requireValidation, async (req, res) => {
  // res.header("Access-Control-Allow-Origin", "*");
  // res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
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

// router.post("/findAdmin", async (req, res) => {
//         try {
//       const { email, password } = req.body;
//           const admin = await User.findOne({email: email})

//       if (!admin) throw new Error("Administrator Not Found")

//         const passwordMatch = await bcrypt.compare(password, admin.password);

//         if (!passwordMatch) throw new Error("Wrong Password");

//         const token = jwt.sign({id: admin._id}, SECRET, {expiresIn: "3 days"});

//         return res.status(200).json({
//           message: "Login Successful",
//           admin,
//           token,
//         });
//       } catch (err) {
//         serverError(res, err);
//       }
//     });

/* 
----------------------------- Update Account Endpoint ------------------------
*/

// router.patch("/edit/", async (req, res) => {
// router.patch("/edit", requireValidation, async (req, res) => {
//   // res.header("Access-Control-Allow-Origin", "*");
//   // res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//   try {
//     // pull value from parameter (id)
//     const id = req.user._id;
//     const userFilter = {_id: id};

//     // const { id } = req.params;
//     const { firstName, lastName, email, password, role, course } = req.body;

//     // if (req.body.password) {
//     //   password = bcrypt.hashSync(req.body.password, 11);
//       const info = {
//         firstName: firstName,
//         lastName: lastName,
//         email: email,
//         password: password,
//         // height: height,
//         role: role,
//         course: course,
//       }
  
//     // pull info from body

//     // const userID = req.user._id;

//     const returnOption = { new: true };

//     //* findOneAndUpdate(query/filter, document, options)
//     const updatedUser = await User.findOneAndUpdate(
//       userFilter,
//       info,
//       returnOption
//     );

//     if (!updatedUser) {
//       return res.status(404).json({
//         message: `User profile unable to be edited`,
//       });
//     }
//     updatedUser
//       ? res.status(200).json({
//           message: `User profile updated!`,
//           updatedUser,
//         })
//       : res.status(404).json({
//           message: `User profile unable to be edited`,
//         });
//   } catch (err) {
//     serverError(res, err);
//   }
// });

/* 
----------------------------- Delete Account Endpoint ------------------------
*/
// router.delete("/delete", requireValidation, async (req, res) => {
//   // res.header("Access-Control-Allow-Origin", "*");
//   // res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//   console.log("deleting...");
//   try {
//     //* Pull the user's info from the req
//     const id = req.user._id;

//     const userID = { _id: id };
//     console.log("_id:", userID);
//     const returnOption = { new: true };

//     //* Remove user profile
//     const deleteUser = await User.deleteOne(userID);

//     deleteUser.deletedCount === 1
//       ? res.status(200).json({
//           message: `User account was successfully deleted!`,
//           // message: `User account ${userName} was successfully deleted!`,
//         })
//       : res.status(404).json({
//           message: `User data unable to be deleted.`,
//         });
//   } catch (err) {
//     console.log("oops");
//     serverError(res, err);
//   }
// });

module.exports = router;
