// ==============================
// Axios Instance Configuration
// ==============================

import axios from 'axios';

// Create a reusable Axios instance with custom settings
export const axiosInstance = axios.create({
    // Dynamically set the base URL:
    // - Use '/' for production (relative to deployed domain)
    // - Use VITE_API_BASE_URL from environment variables for development
    baseURL: import.meta.env.VITE_BASE_URL || "/",    
    withCredentials: true   // Send cookies and authentication headers with every request
});

// ==============================
// End of Axios Configuration
// ==============================