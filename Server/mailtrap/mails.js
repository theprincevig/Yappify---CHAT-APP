const { mailtrapClient, sender } = require("./mailtrap.config");
const {
    VERIFICATION_EMAIL_TEMPLATE,
    WELCOME_EMAIL_TEMPLATE,
    PASSWORD_RESET_EMAIL_TEMPLATE,
    PASSWORD_RESET_SUCCESS_TEMPLATE
} = require("./mailTemplates");


module.exports.sendVerificationEmail = async (email, verificationToken) => {
    const recipient = [{ email }];

    try {
        const response = await mailtrapClient.send({
            from: sender,
            to: recipient,
            subject: "Verify your email for Yappify",
            html: VERIFICATION_EMAIL_TEMPLATE
            .replace(/{{code}}/g, verificationToken.code)
            .replace(/{{username}}/g, verificationToken.username)
            .replace(/{{expiry}}/g, verificationToken.expiryMinutes),
            category: "Email Verification",
        });

        console.log("Verification email sent:", response);
        return response;
                
    } catch (error) {
        console.error(`Error sending verification email: ${error}`);
        throw new Error(`Failed to send verification email: ${error}`);
    }
}

module.exports.sendWelcomeEmail = async (email, username) => {
    const recipient = [{ email }];

    try {
        const response = await mailtrapClient.send({
            from: sender,
            to: recipient,
            subject: "Welcome to Yappify!",
            html: WELCOME_EMAIL_TEMPLATE
            .replace(/{{username}}/, username),
            category: "Welcome Email",
        });

        console.log("Welcome email sent:", response);
        return response;
        
    } catch (error) {
        console.error(`Error sending welcome email: ${error}`);
        throw new Error(`Failed to send welcome email: ${error}`);
    }
}

module.exports.sendPasswordResetEmail = async (email, username, resetUrl) => {
    const recipient = [{ email }];

    try {
        const response = await mailtrapClient.send({
            from: sender,
            to: recipient,
            subject: "Reset your Yappify! password",
            html: PASSWORD_RESET_EMAIL_TEMPLATE
            .replace(/{{username}}/g, username)
            .replace(/{{resetUrl}}/g, resetUrl),
            category: "Password Reset",
        });

        console.log("Password reset email sent:", response);
        return response;

    } catch (error) {
        console.error(`Error sending password reset email: ${error}`);
        throw new Error(`Failed to send password reset email: ${error}`);
    }
}

module.exports.sendPasswordResetSuccessEmail = async (email, username) => {
    const recipient = [{ email }];

    try {
        const response = await mailtrapClient.send({
            from: sender,
            to: recipient,
            subject: "Password Reset Successfully!",
            html: PASSWORD_RESET_SUCCESS_TEMPLATE
            .replace(/{{username}}/, username),        
            category: "Password Reset",
        });

        console.log("Password reset email sent:", response);
        return response;

    } catch (error) {
        console.error(`Error sending password reset success email: ${error}`);
        throw new Error(`Failed to send password reset success email: ${error}`);
    }
}
