// --- Color Palette based on the light-mode image design ---
const COLORS = {
    BG_OUTER: '#f8fafc',    // Off-white/Creamy background (from user's BG_LIGHT)
    BG_CARD: '#ffffff',     // White for the main content card
    BG_HEADER_ACCENT: '#fff9e6', // Soft cream/yellow for the header banner
    TEXT_DARK: '#0f172a',   // Very dark navy for primary text (from user's BG_DARK, now used as text)
    TEXT_PRIMARY: '#333333', // Standard dark gray for body text
    TEXT_SECONDARY: '#64748b', // Muted gray for subtext
    HIGHLIGHT: '#ffc300', // Gold/Yellow accent color for buttons
};

// Common wrapper
const emailWrapper = (content) => `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Affi Mall</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      /* General Reset */
      body { margin: 0; padding: 0; font-family: Arial, sans-serif; }
    </style>
  </head>
  <body style="margin:0; padding:0; background-color:${COLORS.BG_OUTER};">
    <table width="100%" cellspacing="0" cellpadding="0" style="padding:40px 0;">
      <tr>
        <td align="center">
          <!-- Main Content Area (White Card) -->
          <table width="600" cellspacing="0" cellpadding="0" style="background-color:${COLORS.BG_CARD}; border-radius:12px; overflow:hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
            <tr>
              <td align="center">

                <!-- 1. Header Banner (Cream/Gold Accent) -->
                <table width="100%" cellspacing="0" cellpadding="0" style="background-color:${COLORS.BG_HEADER_ACCENT}; border-top-left-radius:12px; border-top-right-radius:12px; padding:30px 40px;">
                  <tr>
                    <td align="center">
                      <!-- Large, Centered Header Text -->
                      <h1 style="color:${COLORS.TEXT_DARK}; font-size:36px; font-weight:bold; margin:0; line-height:1;">Affi Mall</h1>
                    </td>
                  </tr>
                </table>
                
                <!-- 2. Main Body Content -->
                <table width="100%" cellspacing="0" cellpadding="0" style="padding:30px 40px;">
                  <tr>
                    <td>
                      ${content}
                    </td>
                  </tr>
                </table>

                <!-- 3. Simple Footer (Only Copyright) -->
                <table width="100%" cellspacing="0" cellpadding="0" style="padding:20px 40px; border-top: 1px solid #eeeeee;">
                  <tr>
                    <td align="center">
                      <p style="color:${COLORS.TEXT_SECONDARY}; font-size:12px; margin:0;">
                        &copy; ${new Date().getFullYear()} Affi Mall. All rights reserved.
                      </p>
                    </td>
                  </tr>
                </table>

              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;

// OTP Email (REDESIGNED to match image structure)
export const otpTemplate = (firstName, otp) => {
    const content = `
    <!-- Secure Signup Label (Mimicking the image's pill shape) -->
   <table width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:20px;">
    <tr>
        <td align="center">
            <p style="display:inline-block; background-color:#f0f4f8; color:${COLORS.TEXT_SECONDARY}; font-size:14px; padding:7px 14px; border-radius:50px; margin:0;">
                Secure Signup
            </p>
        </td>
    </tr>
</table>
    <h2 style="color:${COLORS.TEXT_DARK}; font-size:22px; margin-top:0; margin-bottom:15px; text-align:center;">Email Verification</h2>
    
    <!-- Inner Rounded OTP Card -->
    <table width="100%" cellspacing="0" cellpadding="0" style="margin:20px 0; border-radius:12px; border:1px solid #f0f4f8; background-color:#fcfcfc;">
        <tr>
            <td align="center" style="padding:30px 25px;">
                <p style="color:${COLORS.TEXT_PRIMARY}; font-size:18px; font-weight:bold; margin:0;">Hello ${firstName},</p>
                <p style="color:${COLORS.TEXT_SECONDARY}; font-size:16px; margin:10px 0;">
                    Use the following One-Time Password (OTP) to verify your account:
                </p>
                
                <!-- OTP Display Box -->
                <table cellspacing="0" cellpadding="0" style="margin:25px 0;">
                    <tr>
                        <td align="center" style="padding:15px 30px; border-radius:8px; background-color:${COLORS.BG_HEADER_ACCENT}; border: 1px solid ${COLORS.HIGHLIGHT}; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                            <p style="color:${COLORS.TEXT_DARK}; font-size:36px; font-weight:bold; margin:0; letter-spacing:5px;">${otp}</p>
                        </td>
                    </tr>
                </table>
        
                <p style="color:${COLORS.TEXT_SECONDARY}; font-size:14px; text-align:center;">
                    This code is confidential. It will expire in 10 minutes.
                </p>
            </td>
        </tr>
    </table>
  `;
    return emailWrapper(content);
};

// Registration Success Email (REDESIGNED to use light mode)
export const registrationSuccessTemplate = (firstName) => {
    const content = `
    <h2 style="color:${COLORS.TEXT_DARK}; font-size:22px; margin-top:0; text-align:center;">Welcome to Affi Mall!</h2>
    <p style="color:${COLORS.TEXT_PRIMARY}; font-size:16px;">Hello ${firstName},</p>
    <p style="color:${COLORS.TEXT_SECONDARY}; font-size:16px;">
        Your registration is complete! You can now login and start exploring the best deals tailored just for you.
    </p>
    
    <!-- CTA Button (Using HIGHLIGHT Gold Color) -->
    <table width="100%" cellspacing="0" cellpadding="0" style="margin:30px 0;">
        <tr>
            <td align="center">
                <a href="" 
                    style="display:inline-block; padding:15px 35px; border-radius:50px; 
                        background-color:${COLORS.HIGHLIGHT}; color:${COLORS.TEXT_DARK}; 
                        font-weight:bold; text-decoration:none; font-size:16px; 
                        box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                    Login Now
                </a>
            </td>
        </tr>
    </table>

    <p style="color:${COLORS.TEXT_SECONDARY}; font-size:14px; text-align:center;">
        Thank you for choosing Affi Mall. Happy Shopping!
    </p>
  `;
    return emailWrapper(content);
};

// Login Notification Email (REDESIGNED to use light mode)
export const loginTemplate = (firstName, lastLoginTime) => {
    const content = `
    <h2 style="color:${COLORS.TEXT_DARK}; font-size:22px; margin-top:0; text-align:center;">Successful Login Notification</h2>
    <p style="color:${COLORS.TEXT_PRIMARY}; font-size:16px;">Hello ${firstName},</p>
    <p style="color:${COLORS.TEXT_SECONDARY}; font-size:16px;">
        We confirm a **successful login** to your Affi Mall account.
        This notification is for your security and awareness.
    </p>

    <!-- Login Details Box -->
    <table width="100%" cellspacing="0" cellpadding="0" style="margin:20px 0; border-radius:8px; background-color:#f0f4f8; padding:20px;">
        <tr>
            <td>
                <p style="color:${COLORS.TEXT_PRIMARY}; font-size:14px; margin:0 0 5px 0; font-weight:bold;">Activity Details</p>
                <p style="color:${COLORS.TEXT_SECONDARY}; font-size:14px; margin:0;">Time: ${lastLoginTime}</p>
            </td>
        </tr>
    </table>
    
    <p style="color:${COLORS.TEXT_DARK}; font-size:16px; font-weight:bold; margin-top:25px; text-align:center;">
        Security Awareness:
    </p>
    <p style="color:${COLORS.TEXT_SECONDARY}; font-size:14px; text-align:center;">
        If you **did not** perform this login, please contact us and immediately secure your account by reset your password.
    </p>
`;
    return emailWrapper(content);
};

export const orderStatusEmailTemplate = (firstName, orderNumber, status) => {
    // Status-specific messages and colors
    const statusConfig = {
        'Processing': {
            message: 'Your order is being processed and will be confirmed shortly.',
            color: '#fbbf24', // yellow
            icon: '⏳'
        },
        'Confirmed': {
            message: 'Great news! Your order has been confirmed and will be prepared for shipping soon.',
            color: '#3b82f6', // blue
            icon: '✓'
        },
        'Shipped': {
            message: 'Your order is on its way! You should receive it within 3-5 business days.',
            color: '#8b5cf6', // purple
            icon: '🚚'
        },
        'Delivered': {
            message: 'Your order has been successfully delivered! We hope you enjoy your purchase.',
            color: '#10b981', // green
            icon: '✓'
        },
        'Cancelled': {
            message: 'Your order has been cancelled. If you have any questions, please contact our support team.',
            color: '#ef4444', // red
            icon: '✕'
        }
    };

    const config = statusConfig[status] || statusConfig['Processing'];

    const content = `
        <h2 style="color:${COLORS.TEXT_DARK}; font-size:22px; margin-top:0; text-align:center;">Order Status Update</h2>
        <p style="color:${COLORS.TEXT_PRIMARY}; font-size:16px;">Hello ${firstName},</p>
        <p style="color:${COLORS.TEXT_SECONDARY}; font-size:16px;">
            We're writing to update you on your order <strong>#${orderNumber}</strong>.
        </p>

        <!-- Status Box with Icon -->
        <table width="100%" cellspacing="0" cellpadding="0" style="margin:25px 0;">
            <tr>
                <td align="center" style="padding:25px; border-radius:12px; background-color:${COLORS.BG_HEADER_ACCENT}; border: 2px solid ${config.color};">
                    <p style="color:${COLORS.TEXT_DARK}; font-size:18px; margin:0;">Current Status:</p>
                    <p style="color:${config.color}; font-size:36px; font-weight:bold; margin:10px 0;">
                        ${config.icon} ${status}
                    </p>
                    <p style="color:${COLORS.TEXT_SECONDARY}; font-size:14px; margin:10px 0 0 0; line-height:1.6;">
                        ${config.message}
                    </p>
                </td>
            </tr>
        </table>

        ${status !== 'Cancelled' ? `
        <p style="color:${COLORS.TEXT_SECONDARY}; font-size:14px; text-align:center; margin-top:30px;">
            You can track your order and view more details in your account dashboard.
        </p>
        ` : `
        <p style="color:${COLORS.TEXT_SECONDARY}; font-size:14px; text-align:center; margin-top:30px;">
            If you have any questions about this cancellation, please don't hesitate to contact our support team.
        </p>
        <table width="100%" cellspacing="0" cellpadding="0" style="margin:20px 0;">
            <tr>
                <td align="center">
                    <a href="" 
                        style="display:inline-block; padding:12px 30px; border-radius:50px; 
                            background-color:${COLORS.TEXT_SECONDARY}; color:white; 
                            font-weight:bold; text-decoration:none; font-size:14px;">
                        Contact Support
                    </a>
                </td>
            </tr>
        </table>
        `}

        <p style="color:${COLORS.TEXT_SECONDARY}; font-size:14px; text-align:center; margin-top:25px;">
            Thank you for shopping with Affi Mall!
        </p>
    `;
    return emailWrapper(content);
};

export const passwordResetTemplate = (firstName, otp) => {
    const content = `
    <h2 style="color:${COLORS.TEXT_DARK}; font-size:22px;">Password Reset Request</h2>
    <p style="color:${COLORS.TEXT_PRIMARY}; font-size:16px;">Hello ${firstName},</p>
    <p style="color:${COLORS.TEXT_SECONDARY}; font-size:16px;">
      Use the following code to reset your password.
    </p>
  
    <table cellspacing="0" cellpadding="0" style="margin:25px auto;">
      <tr>
        <td align="center" style="padding:15px 35px; border-radius:10px;
         background-color:${COLORS.BG_HEADER_ACCENT};
         border:1px solid ${COLORS.HIGHLIGHT};">
          <span style="font-size:32px; font-weight:bold; color:${COLORS.TEXT_DARK}; letter-spacing:6px;">
            ${otp}
          </span>
        </td>
      </tr>
    </table>
  
    <p style="color:${COLORS.TEXT_SECONDARY}; font-size:14px;">
      Code expires in 10 minutes.
    </p>
    `;
    return emailWrapper(content);
};


export const passwordResetSuccessTemplate = (firstName) => {
    const content = `
    <h2 style="color:${COLORS.TEXT_DARK}; font-size:22px;">Password Updated</h2>
    <p style="color:${COLORS.TEXT_PRIMARY}; font-size:16px;">Hello ${firstName},</p>
    <p style="color:${COLORS.TEXT_SECONDARY}; font-size:16px;">
      Your password has been successfully changed.
    </p>
    `;
    return emailWrapper(content);
};


export const passwordChangeAlertTemplate = (firstName) => {
    const content = `
    <h2 style="color:${COLORS.TEXT_DARK}; font-size:22px;">Password Changed</h2>
    <p style="color:${COLORS.TEXT_PRIMARY}; font-size:16px;">Hello ${firstName},</p>
    <p style="color:${COLORS.TEXT_SECONDARY}; font-size:16px;">
      Your password was changed. If this wasn't you, contact support immediately.
    </p>
    `;
    return emailWrapper(content);
};

// Order Confirmation Email
export const orderConfirmationTemplate = (firstName, orderId, orderNumber, items, totalAmount, paymentMethod) => {
    const content = `
    <h2 style="color:${COLORS.TEXT_DARK}; font-size:22px; margin-top:0; text-align:center;">Order Confirmation</h2>
    <p style="color:${COLORS.TEXT_PRIMARY}; font-size:16px;">Hello ${firstName},</p>
    <p style="color:${COLORS.TEXT_SECONDARY}; font-size:16px;">
        Thank you for your order! We've received your order and will process it shortly.
    </p>

    <!-- Order Details Box -->
    <table width="100%" cellspacing="0" cellpadding="0" style="margin:20px 0; border-radius:8px; background-color:#f0f4f8; padding:20px;">
        <tr>
            <td>
                <p style="color:${COLORS.TEXT_PRIMARY}; font-size:14px; margin:0 0 10px 0; font-weight:bold;">Order Details</p>
                <p style="color:${COLORS.TEXT_SECONDARY}; font-size:14px; margin:5px 0;">
                    <strong>Order Number:</strong> #${orderNumber}
                </p>
                <p style="color:${COLORS.TEXT_SECONDARY}; font-size:14px; margin:5px 0;">
                    <strong>Payment Method:</strong> ${paymentMethod === 'cod' ? 'Cash on Delivery' : 'Bank Transfer'}
                </p>
                <p style="color:${COLORS.TEXT_SECONDARY}; font-size:14px; margin:5px 0;">
                    <strong>Total Amount:</strong> PKR ${totalAmount.toFixed(2)}
                </p>
            </td>
        </tr>
    </table>

    <!-- Order Items -->
    <table width="100%" cellspacing="0" cellpadding="0" style="margin:20px 0;">
        <tr>
            <td>
                <p style="color:${COLORS.TEXT_PRIMARY}; font-size:16px; font-weight:bold; margin:0 0 15px 0;">Order Items:</p>
            </td>
        </tr>
        ${items.map(item => `
        <tr>
            <td style="padding:10px 0; border-bottom:1px solid #eeeeee;">
                <table width="100%" cellspacing="0" cellpadding="0">
                    <tr>
                        <td style="width:70%;">
                            <p style="color:${COLORS.TEXT_PRIMARY}; font-size:14px; margin:0; font-weight:bold;">${item.title}</p>
                            ${item.selectedSize ? `<p style="color:${COLORS.TEXT_SECONDARY}; font-size:12px; margin:5px 0 0 0;">Size: ${item.selectedSize}</p>` : ''}
                        </td>
                        <td style="width:15%; text-align:center;">
                            <p style="color:${COLORS.TEXT_SECONDARY}; font-size:14px; margin:0;">x${item.quantity}</p>
                        </td>
                        <td style="width:15%; text-align:right;">
                            <p style="color:${COLORS.TEXT_PRIMARY}; font-size:14px; margin:0; font-weight:bold;">PKR ${(item.price * item.quantity).toFixed(2)}</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
        `).join('')}
    </table>

    <p style="color:${COLORS.TEXT_SECONDARY}; font-size:14px; text-align:center;">
        We'll send you another email once your order ships. Thank you for shopping with Affi Mall!
    </p>
    `;
    return emailWrapper(content);
};