import express from "express";
import { confirmPassword, forgetPassword, verifyOtpForgetPassword,login,resetPassword, logout, registerController,verifyOtpController, authCheck, changePassword } from "../../controllers/auth/authController.js";
import { confirmPasswordValidation, loginValidation, registerValidator, verifyValidator } from "../../validators/registerValidator.js";
import { proxy } from "../../middlewares/proxy.js";

const router = express.Router();

router.post("/register", registerValidator,registerController);
router.post("/verify-otp",verifyValidator ,verifyOtpController );
router.post("/confirm-password",confirmPasswordValidation ,confirmPassword );
router.post("/login", loginValidation,login)
router.post("/logout" ,logout )

router.post("/forget-password",registerValidator,forgetPassword)
router.post("/verify",verifyValidator,verifyOtpForgetPassword) 
router.post("/reset-password",confirmPasswordValidation,resetPassword)

router.get("/auth-check",proxy,authCheck)
router.post("/change-password",proxy,changePassword)


export default router;