import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import urlBase64ToUint8Array from "../utils/urlBase64ToUint8Array";

/**
 * Custom hook for handling push notifications subscription logic.
 */
export default function usePushNotifications() {
  // --- State Management ---
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [error, setError] = useState(null);

  // --- Auth Store ---
  const { authUser, saveSubscription } = useAuthStore();

  /**
   * Subscribe the user to push notifications.
   */
  const subscribe = async () => {
    try {
      // --- Auth Check ---
      if (!authUser) throw new Error("User not authenticated");

      // --- Fun Mode: Notifications Always ON ---
      if (authUser.funMode === "fun") {
        console.log("Fun mode: notifications always ON, skipping subscription");
        setIsSubscribed(true);
        return;
      }

      // --- Control Mode: User Must Select Notification Mode ---
      if (authUser.funMode !== "control") {
        throw new Error("User has not selected notification mode yet");
      }

      // --- Browser Capability Check ---
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        throw new Error("Push messaging not supported in this browser");
      }

      // --- Wait for Service Worker to be Ready ---
      let registration;
      try {
        registration = await navigator.serviceWorker.ready;
        console.log("Service Worker ready:", registration);
      } catch (err) {
        throw new Error("Service Worker not ready yet");
      }

      // --- Check Existing Subscription ---
      const existingSubscription = await registration.pushManager.getSubscription();
      if (existingSubscription) {
        console.log("Already subscribed:", existingSubscription);
        setIsSubscribed(true);
        return;
      }

      // --- Request Notification Permission ---
      const permission = await Notification.requestPermission();
      console.log("Permission result:", permission);
      if (permission !== "granted") throw new Error("Notification permission denied");

      // --- Subscribe to Push Notifications ---
      const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
      if (!vapidPublicKey) throw new Error("Missing VAPID public key");

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });

      // --- Send Subscription to Server ---
      await saveSubscription(JSON.parse(JSON.stringify(subscription)));
      console.log("Subscription completed:", subscription);
      setIsSubscribed(true);

    } catch (err) {
      // --- Error Handling ---
      console.error("Subscription error:", err);
      setError(err.message);
    }
  };

  // --- Hook Return ---
  return { isSubscribed, error, subscribe };
}
