/**
 * Email Templates for Resend
 */

export const createWelcomeEmailTemplate = (name, clientUrl) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to BaatCheet</title>
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0f172a; margin: 0; padding: 0; color: #f8fafc;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0f172a; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #1e293b; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.3); border: 1px solid #334155;">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 32px 40px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                💬 BaatCheet
              </h1>
              <p style="color: #e0e7ff; margin: 8px 0 0 0; font-size: 15px;">Connect & Chat Instantly</p>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 40px 40px 30px 40px;">
              <h2 style="color: #f8fafc; margin-top: 0; font-size: 22px; font-weight: 600;">
                Welcome aboard, ${name}! 👋
              </h2>
              <p style="color: #94a3b8; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
                We're thrilled to have you join <strong>BaatCheet</strong>. Get ready to connect with friends, family, and colleagues with seamless, real-time messaging.
              </p>

              <!-- Features Box -->
              <div style="background-color: #0f172a; border-radius: 12px; padding: 24px; margin-bottom: 32px; border: 1px solid #334155;">
                <h3 style="color: #cbd5e1; margin-top: 0; font-size: 16px; font-weight: 600; margin-bottom: 12px;">
                  Here's what you can do next:
                </h3>
                <ul style="color: #94a3b8; font-size: 15px; line-height: 1.8; margin: 0; padding-left: 20px;">
                  <li>⚡ <strong>Real-Time Messaging:</strong> Chat instantly with socket-powered updates.</li>
                  <li>🖼️ <strong>Profile Customization:</strong> Upload your custom avatar.</li>
                  <li>🟢 <strong>Online Status:</strong> See who is active right now.</li>
                </ul>
              </div>

              <!-- CTA Button -->
              <div style="text-align: center; margin-bottom: 32px;">
                <a href="${clientUrl}" style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-weight: 600; font-size: 16px; display: inline-block; box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);">
                  Open BaatCheet
                </a>
              </div>

              <p style="color: #64748b; font-size: 14px; line-height: 1.5; margin: 0;">
                If you have any questions or feedback, feel free to reply to this email. Happy chatting!
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #0f172a; padding: 20px 40px; text-align: center; border-top: 1px solid #334155;">
              <p style="color: #64748b; font-size: 12px; margin: 0;">
                © ${new Date().getFullYear()} BaatCheet Inc. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
};
