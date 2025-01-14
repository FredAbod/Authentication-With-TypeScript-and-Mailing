"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const user_Models_1 = require("../models/user.Models");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config/config");
const email_service_1 = require("../services/email.service");
const crypto_1 = __importDefault(require("crypto"));
class UserController {
    // User signup method
    static signup(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { name, email, password } = req.body;
                // Check if user already exists
                const existingUser = yield user_Models_1.User.findOne({ email });
                if (existingUser) {
                    res.status(400).json({
                        status: 'error',
                        message: 'User already exists',
                    });
                    return;
                }
                // Verify SMTP connection
                const isEmailServiceWorking = yield email_service_1.EmailService.verifyConnection();
                if (!isEmailServiceWorking) {
                    res.status(500).json({
                        status: 'error',
                        message: 'Email service is not available. Please try again later.',
                    });
                    return;
                }
                // Generate verification token and hash password
                const verificationToken = crypto_1.default.randomBytes(32).toString('hex');
                const hashedPassword = yield bcryptjs_1.default.hash(password, config_1.config.bcrypt.saltRounds);
                // Create new user
                const user = yield user_Models_1.User.create({
                    name,
                    email,
                    password: hashedPassword,
                    verificationToken,
                    verificationTokenExpires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
                });
                try {
                    // Send verification email
                    yield email_service_1.EmailService.sendVerificationEmail(email, name, verificationToken);
                    res.status(201).json({
                        status: 'success',
                        message: 'Registration successful. Please check your email to verify your account.',
                    });
                }
                catch (emailError) {
                    // If email fails, mark user as requiring email verification retry
                    console.error('Failed to send verification email:', emailError);
                    yield user_Models_1.User.findByIdAndUpdate(user._id, {
                        $set: {
                            emailVerificationFailed: true
                        }
                    });
                    res.status(201).json({
                        status: 'warning',
                        message: 'Account created but verification email could not be sent. Please contact support.',
                        userId: user._id
                    });
                }
            }
            catch (error) {
                console.error('Signup error:', error);
                res.status(500).json({
                    status: 'error',
                    message: 'Internal server error',
                });
            }
        });
    }
    // User login method
    static login(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, password } = req.body;
                // Find user by email
                const user = yield user_Models_1.User.findOne({ email });
                if (!user) {
                    res.status(401).json({
                        status: "error",
                        message: "Invalid credentials",
                    });
                    return;
                }
                // Check if user is verified
                if (user.isVerified != true) {
                    res.status(401).json({
                        status: "error",
                        message: "Verify Email",
                    });
                    return;
                }
                // Validate password
                const isPasswordValid = yield bcryptjs_1.default.compare(password, user.password);
                if (!isPasswordValid) {
                    res.status(401).json({
                        status: "error",
                        message: "Invalid credentials",
                    });
                    return;
                }
                // Generate JWT token
                const token = jsonwebtoken_1.default.sign({ userId: user._id }, config_1.config.jwt.secret, {
                    expiresIn: config_1.config.jwt.expiresIn,
                });
                res.json({
                    status: "success",
                    data: {
                        token,
                        user: {
                            id: user._id,
                            name: user.name,
                            email: user.email,
                        },
                    },
                });
            }
            catch (error) {
                res.status(500).json({
                    status: "error",
                    message: "Internal server error",
                });
            }
        });
    }
    // Email verification method
    static verifyEmail(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { token } = req.params;
                // Find user by verification token
                const user = yield user_Models_1.User.findOne({
                    verificationToken: token,
                    verificationTokenExpires: { $gt: new Date() },
                });
                if (!user) {
                    res.status(400).json({
                        status: "error",
                        message: "Invalid or expired verification token",
                    });
                    return;
                }
                // Mark user as verified
                user.isVerified = true;
                user.verificationToken = undefined;
                user.verificationTokenExpires = undefined;
                yield user.save();
                res.json({
                    status: "success",
                    message: "Email verified successfully",
                });
            }
            catch (error) {
                res.status(500).json({
                    status: "error",
                    message: "Internal server error",
                });
            }
        });
    }
    // Forgot password method
    static forgotPassword(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email } = req.body;
                // Find user by email
                const user = yield user_Models_1.User.findOne({ email });
                if (!user) {
                    res.status(404).json({
                        status: 'error',
                        message: 'No account found with that email',
                    });
                    return;
                }
                // Verify email service before proceeding
                const isEmailServiceWorking = yield email_service_1.EmailService.verifyConnection();
                if (!isEmailServiceWorking) {
                    res.status(500).json({
                        status: 'error',
                        message: 'Email service is not available. Please try again later.',
                    });
                    return;
                }
                // Generate reset token
                const resetToken = crypto_1.default.randomBytes(32).toString('hex');
                user.resetPasswordToken = resetToken;
                user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
                yield user.save();
                try {
                    // Send password reset email
                    yield email_service_1.EmailService.sendPasswordResetEmail(email, user.name, resetToken);
                    res.json({
                        status: 'success',
                        message: 'Password reset instructions sent to your email',
                    });
                }
                catch (emailError) {
                    console.error('Failed to send password reset email:', emailError);
                    // Reset the token since email failed
                    user.resetPasswordToken = undefined;
                    user.resetPasswordExpires = undefined;
                    yield user.save();
                    res.status(500).json({
                        status: 'error',
                        message: 'Failed to send password reset email. Please try again later.',
                    });
                }
            }
            catch (error) {
                console.error('Forgot password error:', error);
                res.status(500).json({
                    status: 'error',
                    message: 'Internal server error',
                });
            }
        });
    }
    // Reset password method
    static resetPassword(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { token } = req.params;
                const { password } = req.body;
                // Find user by reset token
                const user = yield user_Models_1.User.findOne({
                    resetPasswordToken: token,
                    resetPasswordExpires: { $gt: new Date() },
                });
                if (!user) {
                    res.status(400).json({
                        status: "error",
                        message: "Invalid or expired reset token",
                    });
                    return;
                }
                // Hash new password and save
                const hashedPassword = yield bcryptjs_1.default.hash(password, config_1.config.bcrypt.saltRounds);
                user.password = hashedPassword;
                user.resetPasswordToken = undefined;
                user.resetPasswordExpires = undefined;
                yield user.save();
                res.json({
                    status: "success",
                    message: "Password reset successfully",
                });
            }
            catch (error) {
                res.status(500).json({
                    status: "error",
                    message: "Internal server error",
                });
            }
        });
    }
}
exports.UserController = UserController;
