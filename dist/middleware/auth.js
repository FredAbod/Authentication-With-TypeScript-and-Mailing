"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config/config");
/**
 * Middleware to authenticate a JWT token from the request headers.
 *
 * @param req - The request object, extended to include `userId` if authentication is successful.
 * @param res - The response object.
 * @param next - The next middleware function in the stack.
 *
 * @returns A response with status 401 if no token is provided, or status 403 if the token is invalid or expired.
 *
 * @remarks
 * This middleware expects the JWT token to be provided in the `Authorization` header in the format `Bearer <token>`.
 * If the token is valid, the `userId` from the token payload is attached to the request object.
 */
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader === null || authHeader === void 0 ? void 0 : authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Authentication token required' });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, config_1.config.jwt.secret);
        req.userId = decoded.userId;
        next();
    }
    catch (error) {
        return res.status(403).json({ message: 'Invalid or expired token' });
    }
};
exports.authenticateToken = authenticateToken;
