module.exports.VERIFICATION_EMAIL_TEMPLATE = `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Email verification</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Comfortaa:wght@300..700&family=Kaushan+Script&family=Playwrite+AU+NSW:wght@100..400&family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap" rel="stylesheet">
  </head>
  <body style="margin:0;padding:0;background:#212121;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td align="center" style="padding:24px;">
          <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="max-width:600px;background:#111;overflow:hidden;border-radius:6px;">
            
            <!-- Top Border -->
            <tr>
              <td style="background:#5162ff; padding:2px;"></td>
            </tr>

            <!-- Header -->
            <tr>
              <td style="padding:24px;text-align:left;">
                
                <!-- Logo + Brand -->
                <table role="presentation" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
                  <tr>
                    <td>
                      <img 
                        src="https://yappify.onrender.com/logo/Yappify-logo1.png" 
                        alt="Yappify Logo"
                        width="50"
                        style="display:block;"
                      >
                    </td>
                    <td style="padding-left:10px;vertical-align:middle;">
                      <span style="font-family:'Kaushan Script',sans-serif;font-size:22px;font-weight:bold;color:#5162ff;letter-spacing:1px;">Yappify</span>
                    </td>
                  </tr>
                </table>

                <!-- Content -->
                <h2 style="margin:0 0 12px 0;font-size:20px;color:#fff;font-family:'Poppins',sans-serif;">Verify your email</h2>
                <p style="margin:0 0 20px 0;color:#ccc;line-height:1.5;font-family:'Comfortaa',sans-serif;">
                  Dear {{username}},<br><br>
                  Use the verification code below to confirm your email address.<br>
                  It expires in {{expiry}} minutes.
                </p>

                <!-- Code -->
                <div style="text-align:center;margin:20px 0;font-family:'Poppins',sans-serif;">
                  <span style="display:inline-block;padding:16px 22px;border-radius:6px;font-size:28px;letter-spacing:4px;font-weight:700;color:#eee;background:#1e1e1e;">
                    {{code}}
                  </span>
                </div>

                <p style="margin:0 0 20px 0;color:#aaa;font-family:'Comfortaa',sans-serif;">If you didn't request this, ignore this email.</p>
                <p style="margin:0;color:#888;font-size:12px;font-family:'Poppins',sans-serif;">Thanks — The Yappify Team</p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background:#bbb;padding:10px 24px;font-size:12px;color:#222;text-align:center;">
                This code will expire in {{expiry}} minutes.
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;

module.exports.PASSWORD_RESET_EMAIL_TEMPLATE = `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Password Reset Request</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Comfortaa:wght@300..700&family=Kaushan+Script&family=Playwrite+AU+NSW:wght@100..400&family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap" rel="stylesheet">
  </head>
  <body style="margin:0;padding:0;background:#212121;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td align="center" style="padding:24px;">
          <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="max-width:600px;background:#111;overflow:hidden;border-radius:6px;">
            
            <!-- Top Border -->
            <tr>
              <td style="background:#5162ff; padding:2px;"></td>
            </tr>

            <!-- Header -->
            <tr>
              <td style="padding:24px;text-align:left;">
                <!-- Logo + Brand -->
                <table role="presentation" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
                  <tr>
                    <td>
                      <img src="https://yappify.onrender.com/logo/Yappify-logo1.png" alt="Yappify Logo" width="50" style="display:block;">
                    </td>
                    <td style="padding-left:10px;vertical-align:middle;">
                      <span style="font-family:'Kaushan Script',sans-serif;font-size:22px;font-weight:bold;color:#5162ff;letter-spacing:1px;">Yappify</span>
                    </td>
                  </tr>
                </table>

                <!-- Content -->
                <h2 style="margin:0 0 12px 0;font-size:20px;color:#fff;font-family:'Poppins',sans-serif;">Password Reset Request</h2>
                <p style="margin:0 0 20px 0;color:#ccc;line-height:1.5;font-family:'Comfortaa',sans-serif;">
                  Dear {{username}},<br><br>
                  We received a request to reset your Yappify account password.<br>
                  Use the code below or click the button to reset your password.
                </p>

                <!-- Reset Button -->
                <div style="text-align:center;margin:20px 0;font-family:'Poppins',sans-serif;">
                  <a href="{{resetUrl}}" style="display:inline-block;padding:12px 20px;border-radius:6px;background:#5162ff;color:#fff;text-decoration:none;font-weight:600;">
                    Reset Password
                  </a>
                </div>

                <p style="margin:0 0 20px 0;color:#aaa;font-family:'Comfortaa',sans-serif;">If you didn’t request this, you can safely ignore this email.</p>
                <p style="margin:0;color:#888;font-size:12px;font-family:'Poppins',sans-serif;">Thanks — The Yappify Team</p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background:#bbb;padding:10px 24px;font-size:12px;color:#222;text-align:center;">
                This reset code/link will expire in 30 minutes.
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;

module.exports.PASSWORD_RESET_SUCCESS_TEMPLATE = `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Password Reset Successful</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Comfortaa:wght@300..700&family=Kaushan+Script&family=Playwrite+AU+NSW:wght@100..400&family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap" rel="stylesheet">
  </head>
  <body style="margin:0;padding:0;background:#212121;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td align="center" style="padding:24px;">
          <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="max-width:600px;background:#111;overflow:hidden;border-radius:6px;">
            
            <!-- Top Border -->
            <tr>
              <td style="background:#5162ff; padding:2px;"></td>
            </tr>

            <!-- Header -->
            <tr>
              <td style="padding:24px;text-align:left;">
                <!-- Logo + Brand -->
                <table role="presentation" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
                  <tr>
                    <td>
                      <img src="https://yappify.onrender.com/logo/Yappify-logo1.png" alt="Yappify Logo" width="50" style="display:block;">
                    </td>
                    <td style="padding-left:10px;vertical-align:middle;">
                      <span style="font-family:'Kaushan Script',sans-serif;font-size:22px;font-weight:bold;color:#5162ff;letter-spacing:1px;">Yappify</span>
                    </td>
                  </tr>
                </table>

                <!-- Content -->
                <h2 style="margin:0 0 12px 0;font-size:20px;color:#fff;font-family:'Poppins',sans-serif;">Password Reset Successful</h2>
                <p style="margin:0 0 20px 0;color:#ccc;line-height:1.5;font-family:'Comfortaa',sans-serif;">
                  Dear {{username}},<br><br>
                  Your password has been successfully reset. You can now log in to your Yappify account with your new password.
                </p>

                <p style="margin:0 0 20px 0;color:#aaa;font-family:'Comfortaa',sans-serif;">If you didn’t reset your password, please <a href="mailto:princevig2590@gmail.com" style="color:#5162ff;text-decoration:none;">contact support</a> immediately.</p>
                <p style="margin:0;color:#888;font-size:12px;font-family:'Poppins',sans-serif;">Thanks — The Yappify Team</p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background:#bbb;padding:10px 24px;font-size:12px;color:#222;text-align:center;">
                This is a confirmation message. No action is required.
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;

module.exports.WELCOME_EMAIL_TEMPLATE = `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Welcome to Yappify</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Comfortaa:wght@300..700&family=Kaushan+Script&family=Playwrite+AU+NSW:wght@100..400&family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap" rel="stylesheet">
  </head>
  <body style="margin:0;padding:0;background:#212121;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td align="center" style="padding:24px;">
          <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="max-width:600px;background:#111;overflow:hidden;border-radius:6px;">
            
            <!-- Top Border -->
            <tr>
              <td style="background:#5162ff; padding:2px;"></td>
            </tr>

            <!-- Header -->
            <tr>
              <td style="padding:24px;text-align:left;">
                <!-- Logo + Brand -->
                <table role="presentation" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
                  <tr>
                    <td>
                      <img src="https://yappify.onrender.com/logo/Yappify-logo1.png" alt="Yappify Logo" width="50" style="display:block;">
                    </td>
                    <td style="padding-left:10px;vertical-align:middle;">
                      <span style="font-family:'Kaushan Script',sans-serif;font-size:22px;font-weight:bold;color:#5162ff; letter-spacing:1px;">Yappify</span>
                    </td>
                  </tr>
                </table>

                <!-- Content -->
                <h2 style="margin:0 0 12px 0;font-size:20px;color:#fff;font-family:'Poppins',sans-serif;">Welcome to Yappify 🎉</h2>
                <p style="margin:0 0 20px 0;color:#ccc;line-height:1.5;font-family:'Comfortaa',sans-serif;">
                  Dear {{username}},<br><br>
                  Welcome to <strong>Yappify</strong> — we’re thrilled to have you join our community!  
                  Your account has been created successfully, and you’re all set to explore, connect, and share your thoughts with friends.
                </p>

                <p style="margin:0 0 20px 0;color:#ccc;line-height:1.5;font-family:'Comfortaa',sans-serif;">
                  To get started, simply log in to your Yappify account and complete your profile.  
                  This helps your friends discover and connect with you more easily!
                </p>

                <p style="margin:0 0 20px 0;color:#aaa;font-family:'Comfortaa',sans-serif;">
                  Need help? Feel free to <a href="mailto:princevig2590@gmail.com" style="color:#5162ff;text-decoration:none;">contact our support team</a> anytime.
                </p>

                <p style="margin:0;color:#888;font-size:12px;font-family:'Poppins',sans-serif;">Thanks for joining — The Yappify Team 💙</p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background:#bbb;padding:10px 24px;font-size:12px;color:#222;text-align:center;">
                This is an automated welcome message. No action is required.
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;
