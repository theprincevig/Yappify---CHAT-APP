const express = require("express");
const router = express.Router();

const userController = require("../controller/user.js");
const wrapAsync = require("../middleware/wrapAsync.js");
const { isLoggedIn } = require("../middleware/auth.js");
const { validateUsername } = require("../middleware/validateUsername.js");
const authenticateLocal = require("../middleware/passportAuth.js");

/* ======================
   SESSION (AUTH)
====================== */

// Get current session
router.route("/session")
      .get(isLoggedIn, wrapAsync(userController.checkAuth))
      .post(authenticateLocal, wrapAsync(userController.loginUser))
      .delete(wrapAsync(userController.logoutUser));

/* ======================
   USERS
====================== */

// Signup
router.post("/users", validateUsername, wrapAsync(userController.signupUser));

/* ======================
   EMAIL VERIFICATION
====================== */

router.post("/email/verification", wrapAsync(userController.verifyEmail));
router.post("/email/verification/resend", wrapAsync(userController.resendVerificationEmail));

/* ======================
   PASSWORD
====================== */

router.post("/password/forgot", wrapAsync(userController.forgotPassword));
router.post("/password/reset/:token", wrapAsync(userController.resetPassword));
router.patch("/password", isLoggedIn, wrapAsync(userController.changePassword));

/* ======================
   PREFERENCES
====================== */

router.patch("/preferences/mode", isLoggedIn, wrapAsync(userController.updateNotifications));

/* ======================
   NOTIFICATIONS
====================== */

router.post("/notifications/subscription", isLoggedIn, wrapAsync(userController.saveSubscription));
router.patch("/notifications", isLoggedIn, wrapAsync(userController.toggleNotifications));

module.exports = router;
