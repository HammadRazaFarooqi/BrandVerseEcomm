// routes.js
import express from "express";
import { registerOTP, verifyOTP, resendOTP, loginUser, changePassword, forgotPassword, resetPassword, verifyResetOtp } from "../controllers/authController.js";
const router = express.Router();

router.post("/register-otp", registerOTP);
router.post("/verify-otp", verifyOTP);
router.post("/resend-otp", resendOTP);
router.post("/login", loginUser);
router.post("/change-password", changePassword);
router.post("/forgot-password", forgotPassword); // ✅ This sends OTP
router.post("/reset-password/check-otp", verifyResetOtp); // ✅ This verifies OTP
router.post("/reset-password", resetPassword); // ✅ This resets password

export default router;
