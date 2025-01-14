"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.forgotPasswordSchema = exports.resetPasswordSchema = exports.loginSchema = exports.signupSchema = void 0;
const zod_1 = require("zod");
/**
 * Schema for validating user signup data.
 *
 * This schema ensures that the user provides:
 * - A name that is a string with a minimum length of 2 and a maximum length of 50.
 * - An email that is a valid email address.
 * - A password that is a string with a minimum length of 8 and a maximum length of 100.
 */
exports.signupSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).max(50),
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(8).max(100),
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string(),
});
exports.resetPasswordSchema = zod_1.z.object({
    password: zod_1.z.string().min(8).max(100),
});
exports.forgotPasswordSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
});
