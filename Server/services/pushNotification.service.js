const webpush = require('../config/webPush.Config');
const User = require('../models/user');

/**
 * Sends a push notification to a specific user if they have a valid subscription.
 * Respects the user's "fun" or "control" mode settings.
 *
 * @param {string} userId - The ID of the user to send the notification to.
 * @param {Object} payload - The payload to send in the push notification.
 */
module.exports.sendNotificationToUser = async (userId, payload) => {
    try {
        // Fetch the user from the database
        const user = await User.findById(userId);
        if (!user) {
            console.warn(`Push skipped: User not found (ID: ${userId})`);
            return;
        }

        const subscription = user.notificationSubscription;
        // Check if the user has a valid push subscription
        if (!subscription?.endpoint) {
            console.warn(`Push skipped: No valid subscription for user ${user.username || userId}`);
            return;
        }

        const { funMode, notificationsEnabled } = user;

        const canNotify = 
            funMode === "fun" ||
            (funMode === "control" && notificationsEnabled);

        if (!canNotify) return;

        await webpush.sendNotification(subscription, JSON.stringify(payload));
        
    } catch (error) {
        console.error(`Unexpected error in sendNotificationToUser for user ${userId}:`, error);
    }
};
