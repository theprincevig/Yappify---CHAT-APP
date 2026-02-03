const express = require("express");
const router = express.Router();

const wrapAsync = require("../middleware/wrapAsync");
const messageController = require("../controller/message.js");
const { isLoggedIn } = require("../middleware/auth.js");

const multer = require("multer");
const { storage } = require("../config/cloudConfig.js");
const upload = multer({ storage });

/* ======================
   CHATS
====================== */

// Sidebar chats (friends + last message)
router.get(
  "/",
  isLoggedIn,
  wrapAsync(messageController.getChats)
);

// Unread message counts
router.get(
  "/unread-counts",
  isLoggedIn,
  wrapAsync(messageController.getUnreadCounts)
);

/* ======================
   MESSAGES
====================== */

// Messages inside a chat
router
  .route("/:chatId/messages")
  .get(
    isLoggedIn,
    wrapAsync(messageController.getMessages)
  )
  .post(
    isLoggedIn,
    upload.single("media"),
    wrapAsync(messageController.sendMessages)
  );

// Delete a specific message
router.delete(
  "/:chatId/messages/:messageId",
  isLoggedIn,
  wrapAsync(messageController.deleteMessages)
);

/* ======================
   REACTIONS
====================== */

router.post(
  "/:chatId/messages/:messageId/reactions",
  isLoggedIn,
  wrapAsync(messageController.upsertReaction)
);

/* ======================
   FORWARDING
====================== */

router.post(
  "/:chatId/messages/:messageId/forwards",
  isLoggedIn,
  wrapAsync(messageController.forwardMessage)
);

/* ======================
   READ STATUS
====================== */

router.patch(
  "/:chatId/read-status",
  isLoggedIn,
  wrapAsync(messageController.updateReadStatus)
);

module.exports = router;
