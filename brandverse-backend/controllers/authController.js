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

// --- Step 1: Register and send OTP ---
export const registerOTP = async (req, res) => {
    try {
        const { firstName, lastName, email, password } = req.body;

        let user = await User.findOne({ email });

        if (user && user.isEmailVerified) {
            return res.status(400).json({ error: "Email already exists" });
        }

        const otpCode = generateOTP();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

        // If user exists but not verified, update OTP & password
        if (user && !user.isEmailVerified) {
            user.firstName = firstName;
            user.lastName = lastName;
            user.password = password;
            user.otp = { code: otpCode, expiresAt: otpExpires };
            await user.save();
        } else {
            const username = generateUsername(firstName, lastName);
            user = new User({
                username,
                firstName,
                lastName,
                email,
                password,
                isEmailVerified: false,
                otp: { code: otpCode, expiresAt: otpExpires }
            });
            await user.save();
        }

        // Send OTP email
        await sendMail({
            to: email,
            subject: "Your Affi Mall OTP Code",
            html: otpTemplate(firstName, otpCode)
        });

        res.status(201).json({ message: "OTP sent to email", email });
    } catch (error) {
        res.status(400).json({ error: error.message });
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

        // ✅ Fixed: Pass both firstName and lastLoginTime
        await sendMail({
            to: email,
            subject: "Login Alert",
            html: loginTemplate(user.firstName, user.lastLogin.toLocaleString())
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

        console.log("OTP generated for forgot password:", {
            email,
            otp,
            expiresAt: user.passwordReset.expiresAt
        });

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

        console.log("Verification attempt:", {
            email,
            receivedOtp: otpString,
            timestamp: new Date()
        });

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        console.log("Stored data:", {
            storedOtp: user.passwordReset?.token,
            expiresAt: user.passwordReset?.expiresAt,
            isExpired: user.passwordReset?.expiresAt < Date.now()
        });

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
            console.log("OTP mismatch:", { storedOtp, receivedOtp: otpString });
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

        console.log("Password reset successful for:", email);

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

