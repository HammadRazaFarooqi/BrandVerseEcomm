import User from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { sendMail } from "../src/utils/mailer.js";
import { otpTemplate, registrationSuccessTemplate, loginTemplate, passwordResetTemplate, passwordResetSuccessTemplate, passwordChangeAlertTemplate } from "../src/utils/emailTemplates.js";

const generateToken = (userId) => jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "24h" });

// Generate 6-digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Helper to generate unique username
const generateUsername = (firstName, lastName) => {
    return `${firstName}${lastName}${Date.now()}`;
};

// --- Step 1: Register and send OTP (FIXED) ---
export const registerOTP = async (req, res) => {
    try {
        const { firstName, lastName, email, password } = req.body;

        // ✅ Find user by email
        const existingUser = await User.findOne({ email });

        // ✅ CRITICAL FIX: Block registration if user exists AND is verified
        if (existingUser && existingUser.isEmailVerified === true) {
            return res.status(400).json({ 
                error: "Email already exists" 
            });
        }

        // If we reach here, either:
        // 1. User doesn't exist (new registration)
        // 2. User exists but is NOT verified (allow re-registration)

        const otpCode = generateOTP();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

        let user;

        if (existingUser && !existingUser.isEmailVerified) {
            existingUser.firstName = firstName;
            existingUser.lastName = lastName;
            existingUser.password = password; // Will be hashed by pre-save hook
            existingUser.otp = { 
                code: otpCode, 
                expiresAt: otpExpires 
            };
            user = await existingUser.save();
        } else {
            const username = generateUsername(firstName, lastName);
            user = new User({
                username,
                firstName,
                lastName,
                email,
                password, // Will be hashed by pre-save hook
                isEmailVerified: false,
                otp: { 
                    code: otpCode, 
                    expiresAt: otpExpires 
                }
            });
            await user.save();
        }

        // Send OTP email
        await sendMail({
            to: email,
            subject: "Your Affi Mall OTP Code",
            html: otpTemplate(firstName, otpCode)
        });
        return res.status(201).json({ 
            message: "OTP sent to email", 
            email 
        });

    } catch (error) {
        console.error("❌ Register OTP Error:", error);
        
        // Handle duplicate key error specifically
        if (error.code === 11000) {
            return res.status(400).json({ 
                error: "Email already exists"
            });
        }
        
        return res.status(400).json({ 
            error: error.message || "Registration failed"
        });
    }
};
// --- Step 2: Verify OTP ---
export const verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ error: "User not found" });
        if (!user.otp || !user.otp.code) return res.status(400).json({ error: "OTP not sent" });

        if (user.otp.expiresAt < new Date()) return res.status(400).json({ error: "OTP expired" });
        if (user.otp.code !== otp) return res.status(400).json({ error: "OTP mismatch" });

        user.isEmailVerified = true;
        user.otp = undefined;
        await user.save();

        // Send registration confirmation email
        await sendMail({ to: email, subject: "Registration Successful", html: registrationSuccessTemplate(user.firstName) });

        res.json({ message: "OTP verified, registration complete" });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// --- Step 3: Resend OTP ---
export const resendOTP = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ error: "User not found" });

        const otpCode = generateOTP();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

        user.otp = { code: otpCode, expiresAt: otpExpires };
        await user.save();

        // ✅ Fixed: Pass both firstName and otpCode
        await sendMail({
            to: email,
            subject: "Your Affi Mall OTP Code",
            html: otpTemplate(user.firstName, otpCode)
        });
        res.json({ message: "OTP resent successfully" });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Helper function to parse user agent
const parseUserAgent = (userAgent) => {
    if (!userAgent) return { device: 'Unknown Device', browser: 'Unknown Browser' };
    
    // Detect device
    let device = 'Desktop';
    if (/mobile/i.test(userAgent)) device = 'Mobile';
    else if (/tablet|ipad/i.test(userAgent)) device = 'Tablet';
    
    // Detect browser
    let browser = 'Unknown Browser';
    if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) browser = 'Chrome';
    else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) browser = 'Safari';
    else if (userAgent.includes('Firefox')) browser = 'Firefox';
    else if (userAgent.includes('Edg')) browser = 'Edge';
    else if (userAgent.includes('Opera') || userAgent.includes('OPR')) browser = 'Opera';
    
    return { device, browser };
};

// --- Login ---
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(401).json({ error: "Invalid credentials" });

        const isMatch = await user.comparePassword(password);
        if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

        const token = generateToken(user._id);

        user.lastLogin = new Date();
        await user.save();

        // Extract login details
        const userAgent = req.headers['user-agent'] || '';
        const { device, browser } = parseUserAgent(userAgent);
        const ipAddress = getClientIp(req);
        
        // Format login time
        const loginTime = new Date().toLocaleString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZoneName: 'short'
        });

        // Prepare login details object
        const loginDetails = {
            loginTime,
            ipAddress,
            userAgent,
            device,
            browser,
            // location: 'Lahore, Pakistan' // Optional: Add if you have IP geolocation service
        };

        // Send email with login details
        await sendMail({
            to: email,
            subject: "Login Alert - Affi Mall",
            html: loginTemplate(user.firstName, loginDetails)
        });

        res.json({ token, user });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ success: false, message: "Email is required" });

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        const otp = generateOTP();

        // ✅ Use the correct passwordReset fields
        user.passwordReset = {
            token: otp,
            expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 mins
        };

        await user.save();
        await sendMail({
            to: email,
            subject: "Password Reset Code",
            html: passwordResetTemplate(user.firstName ?? "User", otp),
        });

        res.status(200).json({
            success: true,
            message: "Reset code sent to your email",
            // Remove in production:
            debug: { otp }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

export const verifyResetOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: "Email and OTP are required"
            });
        }

        const otpString = String(otp).trim();
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        // ✅ Check passwordReset fields
        if (!user.passwordReset?.token || !user.passwordReset?.expiresAt) {
            return res.status(400).json({
                success: false,
                message: "No reset request found. Please request a new OTP."
            });
        }

        if (user.passwordReset.expiresAt < Date.now()) {
            return res.status(400).json({
                success: false,
                message: "OTP has expired. Please request a new one."
            });
        }

        const storedOtp = String(user.passwordReset.token).trim();

        if (storedOtp !== otpString) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP. Please check and try again."
            });
        }

        return res.json({
            success: true,
            message: "OTP verified successfully"
        });

    } catch (error) {
        console.error("OTP verification error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error during OTP verification"
        });
    }
};
export const resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        if (!email || !otp || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        const otpString = String(otp).trim();
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // ✅ Verify OTP
        if (!user.passwordReset?.token || !user.passwordReset?.expiresAt) {
            return res.status(400).json({
                success: false,
                message: "No reset request found"
            });
        }

        if (user.passwordReset.expiresAt < Date.now()) {
            return res.status(400).json({
                success: false,
                message: "OTP has expired"
            });
        }

        if (String(user.passwordReset.token).trim() !== otpString) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP"
            });
        }

        // Update password
        user.password = newPassword;

        // Clear reset data
        user.passwordReset = {
            token: undefined,
            expiresAt: undefined
        };

        await user.save();

        // ✅ Send success email AFTER password is reset
        await sendMail({
            to: email,
            subject: "Password Reset Successful",
            html: passwordResetSuccessTemplate(user.firstName ?? "User")
        });
        return res.json({
            success: true,
            message: "Password reset successfully"
        });

    } catch (error) {
        console.error("Reset password error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to reset password"
        });
    }
};

export const changePassword = async (req, res) => {
    try {
        const { email, oldPassword, newPassword } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ error: "Account not found" });

        const isMatch = await user.comparePassword(oldPassword);
        if (!isMatch) return res.status(400).json({ error: "Incorrect current password" });

        const hashed = await bcrypt.hash(newPassword, 10);
        user.password = hashed;
        await user.save();

        await sendMail({
            to: email,
            subject: "Password Changed",
            html: passwordChangeAlertTemplate(user.firstName)
        });

        res.json({ message: "Password changed" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

