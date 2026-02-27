const express = require("express");
const router = express.Router();

const userController = require("../controller/user.controller.js");
const asyncHandler = require("../utils/asyncHandler.js");
const { requireAuth } = require("../middleware/auth.middleware.js");
const { validateUsername } = require("../middleware/validator.middleware.js");
const authenticateLocal = require("../middleware/passport.middleware.js");

/* ======================
   SESSION (AUTH)
====================== */

// Get current session
router
  .route("/session")
  .get(requireAuth, asyncHandler(userController.session))
  .post(authenticateLocal, asyncHandler(userController.loginUser))
  .delete(asyncHandler(userController.logoutUser));

/* ======================
   USERS
====================== */

// Signup
router.post("/signup", validateUsername, asyncHandler(userController.signupUser));

/* ======================
   PASSWORD
====================== */
router.patch("/password", requireAuth, asyncHandler(userController.changePassword));

/* ======================
   PREFERENCES
====================== */

router.patch(
  "/preferences/mode",
  requireAuth,
  asyncHandler(userController.updateNotifications),
);

/* ======================
   NOTIFICATIONS
====================== */

router.post(
  "/notifications/subscription",
  requireAuth,
  asyncHandler(userController.saveSubscription),
);
router.patch(
  "/notifications",
  requireAuth,
  asyncHandler(userController.toggleNotifications),
);

module.exports = router;
