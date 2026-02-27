const express = require("express");
const router = express.Router();

const { requireAuth } = require("../middleware/auth.middleware.js");
const friendController = require("../controller/friend.controller.js");
const asyncHandler = require("../utils/asyncHandler.js");

/* ======================
   FRIEND REQUESTS
====================== */

// Get friend request
router.get("/requests", requireAuth, asyncHandler(friendController.getRequests));

// Send or Cancel sent request
router
  .route("/requests/:userId")
  .post(requireAuth, asyncHandler(friendController.sendRequest))
  .delete(requireAuth, asyncHandler(friendController.cancelRequest));

// Accept received request
router.patch(
  "/requests/:userId/accept",
  requireAuth,
  asyncHandler(friendController.acceptRequest),
);

// Reject received request
router.delete(
  "/requests/:userId/reject",
  requireAuth,
  asyncHandler(friendController.rejectRequest),
);

/* ======================
   FRIENDS
====================== */

// List friends
router.get("/", requireAuth, asyncHandler(friendController.getFriends));

// Remove friend
router.delete(
  "/:userId",
  requireAuth,
  asyncHandler(friendController.removeFriends),
);

/* ======================
   UTILITIES
====================== */

// Relationship status
router.get(
  "/status/:userId",
  requireAuth,
  asyncHandler(friendController.checkStatus),
);

// Search users
router.get("/search", requireAuth, asyncHandler(friendController.searchUser));

module.exports = router;
