// ===============================
// 📬 PUSH NOTIFICATION HANDLER
// ===============================

// Listen for incoming push notifications
self.addEventListener("push", (e) => {
    // Parse the push payload as JSON
    const data = e.data.json();
    console.log("📩 Push received:", data);

    // --- Notification Content ---
    const title = data.title || "New Notification"; // Title of the notification
    const options = {
        body: data.body || "",                     // Message body
        icon: "/logo/Yappify-logo1.png",           // Notification icon
        // badge: "badge",                         // (Optional) Small badge icon
        data: data.url || "/",                     // (Optional) URL to open on click
    };

    // Display the notification
    e.waitUntil(
        self.registration.showNotification(title, options)
    );
});

// ===============================
// 🖱️ NOTIFICATION CLICK HANDLER
// ===============================

// Handle user clicks on notifications
self.addEventListener("notificationclick", (e) => {
    e.notification.close(); // Dismiss the notification

    // Open the associated URL in a new window/tab
    e.waitUntil(
        clients.openWindow(e.notification.data)
    );

    console.log("🔔 Notification clicked, opening:", e.notification.data);
});
