const webpush = require('../config/webPush');
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
        if (!subscription || !subscription.endpoint) {
            console.warn(`Push skipped: No valid subscription for user ${user.username || userId}`);
            return;
        }

        const { funMode, notificationsEnabled } = user;

        // Only send notifications if:
        // 1. User is in "fun" mode (always on)
        // 2. User is in "control" mode and has notifications enabled
        if (funMode === 'fun' || (funMode === 'control' && notificationsEnabled)) {
            try {
                await webpush.sendNotification(subscription, JSON.stringify(payload));
            } catch (error) {
                console.error(`Push Error for user ${user.username || userId}:`, error);
            }
        }
    } catch (error) {
        console.error(`Unexpected error in sendNotificationToUser for user ${userId}:`, error);
    }
};
