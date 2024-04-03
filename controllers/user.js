const User = require("../models/User");
const bcrypt = require("bcryptjs");
const auth = require("../auth");

module.exports.registerUser = (req, res) => {
  const { email, firstName, lastName, mobileNo, password } = req.body;

  // Basic validation checks
  if (!email.includes("@")) {
    return res.status(400).send({ error: "Invalid email format" });
  } else if (mobileNo.length !== 11) {
    return res.status(400).send({ error: "Mobile number must be 11 digits" });
  } else if (password.length < 8) {
    return res
      .status(400)
      .send({ error: "Password must be at least 8 characters" });
  }

  // Check if email already exists
  User.findOne({ email })
    .then((existingUser) => {
      if (existingUser) {
        return res.status(400).send({ error: "Email already exists" });
      }

      // Create new user
      const newUser = new User({
        firstName,
        lastName,
        email,
        mobileNo,
        password: bcrypt.hashSync(password, 10),
      });

      return newUser.save();
    })
    .then((user) => {
      res.status(201).send({
        message: "Registered Successfully",
        user: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          mobileNo: user.mobileNo,
        },
      });
    })
    .catch((err) => {
      console.error("Error in saving: ", err);
      res.status(500).send({ error: "Error in save" });
    });
};

module.exports.loginUser = (req, res) => {
  const { email, password } = req.body;

  // Basic validation check for email format
  if (!email.includes("@")) {
    return res.status(400).send({ error: "Invalid Email" });
  }

  // Find user by email
  User.findOne({ email })
    .then((user) => {
      if (!user) {
        return res.status(404).send({ error: "No Email Found" });
      }

      // Compare passwords
      const isPasswordCorrect = bcrypt.compareSync(password, user.password);
      if (!isPasswordCorrect) {
        return res
          .status(401)
          .send({ error: "Email and password do not match" });
      }

      // Generate access token
      const accessToken = auth.createAccessToken(user);
      res.status(200).send({ access: accessToken });
    })
    .catch((err) => {
      console.error("Error in find: ", err);
      res.status(500).send({ error: "Error in find" });
    });
};

module.exports.userDetails = (req, res) => {
  const userId = req.user.id;

  User.findById(userId)
    .then((user) => {
      if (!user) {
        return res.status(404).send({ error: "User not found" });
      }
      user.password = undefined;

      return res.status(200).send({ user });
    })
    .catch((err) => {
      console.error("Error in fetching user profile", err);
      return res.status(500).send({ error: "Failed to fetch user profile" });
    });
};

module.exports.updateUserAsAdmin = (req, res) => {
  const updateAsAdmin = {
    isAdmin: true,
  };
  const userIdToUpdate = req.params.userId;

  User.findByIdAndUpdate(userIdToUpdate, updateAsAdmin)
    .then((updatedUser) => {
      if (!updatedUser) {
        return res
          .status(404)
          .send({ message: "User not found or unable to update" });
      }
      res.status(200).send({ message: "User updated as admin successfully" });
    })
    .catch((err) => {
      console.error("Failed updating user as Admin", err);
      res.status(500).send({ error: "Failed updating user as Admin" });
    });
};

module.exports.updatePassword = (req, res) => {
  const { newPassword } = req.body;
  const { id } = req.user;

  const hashedNewPassword = bcrypt.hashSync(newPassword, 10);

  User.findByIdAndUpdate(id, { password: hashedNewPassword })
    .then(() => {
      res.status(200).json({ message: "Password updated successfully" });
    })
    .catch((error) => {
      console.error("Error in updating password:", error);
      res.status(500).json({ error: "Error updating password" });
    });
};
