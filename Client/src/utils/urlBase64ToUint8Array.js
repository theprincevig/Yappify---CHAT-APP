/**
 * Converts a URL-safe Base64 string into a Uint8Array.
 *
 * This function is commonly used for decoding cryptographic keys or tokens
 * that are transmitted in URL-safe Base64 format (e.g., for push notifications).
 *
 * @function urlBase64ToUint8Array
 * @param {string} base64String - The URL-safe Base64 encoded string to decode.
 *
 * @returns {Uint8Array} The decoded data as a Uint8Array.
 *
 * @example
 * // Decode a VAPID public key for Web Push
 * const uint8Array = urlBase64ToUint8Array('BK...Ag');
 *
 * @section
 * ## How It Works
 * - Adds necessary padding to the Base64 string.
 * - Replaces URL-safe characters with standard Base64 equivalents.
 * - Decodes the Base64 string to binary data.
 * - Converts binary data to a Uint8Array.
 */
export default function urlBase64ToUint8Array(base64String) {
    const padding = "=".repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }

    return outputArray;
}