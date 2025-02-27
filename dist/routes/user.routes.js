"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("../controllers/user.controller");
const validate_1 = require("../middleware/validate");
const user_validators_1 = require("../validators/user.validators");
/**
 * Initializes a new Router instance.
 * This router will be used to define user-related routes.
 */
const router = (0, express_1.Router)();
router.post('/signup', (0, validate_1.validateRequest)(user_validators_1.signupSchema), user_controller_1.UserController.signup);
router.post('/login', (0, validate_1.validateRequest)(user_validators_1.loginSchema), user_controller_1.UserController.login);
router.get('/verify-email/:token', user_controller_1.UserController.verifyEmail);
router.post('/forgot-password', (0, validate_1.validateRequest)(user_validators_1.forgotPasswordSchema), user_controller_1.UserController.forgotPassword);
router.post('/reset-password/:token', (0, validate_1.validateRequest)(user_validators_1.resetPasswordSchema), user_controller_1.UserController.resetPassword);
exports.default = router;
