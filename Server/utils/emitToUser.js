const { io, getReceiverSocketId } = require("../config/socket.Config.js");

/**
 * Emit an event to a specific user.
 * @param {String} userId - The target user's ID.
 * @param {String} event - The event name to emit.
 * @param {Object} data - The payload to send with the event.
 */
const emitToUser = (userId, event, data) => {
  // Get all socket IDs associated with this user
  const socketIds = getReceiverSocketId(userId);

  // Emit the event to each of the user's connected sockets
  socketIds.forEach((id) => {
    io.to(id).emit(event, data);
  });
};

module.exports = emitToUser;
