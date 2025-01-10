"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
// src/config/config.ts
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// Load environment variables from .env file
dotenv_1.default.config({ path: path_1.default.join(__dirname, '../../.env') });
exports.config = {
    port: process.env.PORT || 3000,
    mongodb: {
        uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/mydatabase',
    },
    jwt: {
        secret: process.env.JWT_SECRET || 'default-secret-key',
        expiresIn: process.env.JWT_EXPIRES_IN || '1h',
    },
    bcrypt: {
        saltRounds: parseInt(process.env.SALT_ROUNDS || '10', 10),
    },
    email: {
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT || '587', 10),
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    frontend: {
        url: process.env.FRONTEND_URL,
    },
};
