const express = require("express");
const userController = require("../controllers/user");
const router = express.Router();
const { verifyAdmin, verify } = require("../auth");

router.post("/", userController.registerUser);

router.post("/login", userController.loginUser);

router.get("/details", verify, userController.userDetails);

router.patch(
  "/:userId/set-as-admin",
  verify,
  verifyAdmin,
  userController.updateUserAsAdmin
);

router.patch("/update-password", verify, userController.updatePassword);

module.exports = router;
