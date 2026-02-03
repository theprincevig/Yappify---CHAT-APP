const express = require("express");
const router = express.Router();

const { isLoggedIn } = require("../middleware/auth.js");
const friendController = require("../controller/friend.js");
const wrapAsync = require("../middleware/wrapAsync.js");

/* ======================
   FRIEND REQUESTS
====================== */

// Get friend request
router.get("/requests", isLoggedIn, wrapAsync(friendController.getRequests));

// Send or Cancel sent request
router.route("/requests/:userId")
      .post(
        isLoggedIn,
        wrapAsync(friendController.sendRequest)
      )
      .delete(
        isLoggedIn,
        wrapAsync(friendController.cancelRequest)
      );

// Accept received request
router.patch(
  "/requests/:userId/accept",
  isLoggedIn,
  wrapAsync(friendController.acceptRequest)
);

// Reject received request
router.delete(
  "/requests/:userId/reject",
  isLoggedIn,
  wrapAsync(friendController.rejectRequest)
);

/* ======================
   FRIENDS
====================== */

// List friends
router.get(
  "/",
  isLoggedIn,
  wrapAsync(friendController.getFriends)
);

// Remove friend
router.delete(
  "/:userId",
  isLoggedIn,
  wrapAsync(friendController.removeFriends)
);

/* ======================
   UTILITIES
====================== */

// Relationship status
router.get(
  "/status/:userId",
  isLoggedIn,
  wrapAsync(friendController.checkStatus)
);

// Search users
router.get(
  "/search",
  isLoggedIn,
  wrapAsync(friendController.searchUser)
);

module.exports = router;
