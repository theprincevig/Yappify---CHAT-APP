// ==============================
//   REGEX VALIDATIONS
// ==============================
const usernameRegex = /^(?![._])(?!.*[._]{2})[a-zA-Z0-9._]{3,30}(?<![._])$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,64}$/;

// ==============================
//   HELPER VALIDATION FUNCTIONS
// ==============================
export const validateUsername = (username) => usernameRegex.test(username);
export const validateEmail = (email) => emailRegex.test(email);
export const validatePassword = (password) => passwordRegex.test(password);

// ==============================
//   VALIDATION MESSAGES
// ==============================
export const validationMessages = {
  username:
    "3–30 characters. Letters, numbers, dot and underscore only. No leading/trailing or consecutive dots/underscores.",
  email:
    "Please enter a valid email address.",
  password:
    "Password must be 8–64 characters long and include uppercase, lowercase, number, and special character.",
};
