const express = require("express");
const router = express.Router();

const asyncHandler = require("../utils/asyncHandler.js");
const messageController = require("../controller/message.controller.js");
const { requireAuth } = require("../middleware/auth.middleware.js");

const multer = require("multer");
const { storage } = require("../config/cloud.Config.js");
const upload = multer({ storage });

/* ======================
   CHATS
====================== */

// Sidebar chats (friends + last message)
router
  .route("/")
  .get(requireAuth, asyncHandler(messageController.getChats))
  .post(requireAuth, asyncHandler(messageController.createChat));

/* ======================
   MESSAGES
====================== */

// Messages inside a chat
router
  .route("/:chatId/messages")
  .get(requireAuth, asyncHandler(messageController.getMessages))
  .post(
    requireAuth,
    upload.single("media"),
    asyncHandler(messageController.sendMessage),
  );

// Delete a specific message
router.delete(
  "/:chatId/messages/:messageId",
  requireAuth,
  asyncHandler(messageController.deleteMessage),
);

/* ======================
   REACTIONS
====================== */

router.post(
  "/:chatId/messages/:messageId/reactions",
  requireAuth,
  asyncHandler(messageController.upsertReaction),
);

/* ======================
   FORWARDING
====================== */

router.post(
  "/:chatId/messages/:messageId/forwards",
  requireAuth,
  asyncHandler(messageController.forwardMessage),
);

/* ======================
   READ STATUS
====================== */

router.patch(
  "/:chatId/read-status",
  requireAuth,
  asyncHandler(messageController.updateReadStatus),
);

module.exports = router;
