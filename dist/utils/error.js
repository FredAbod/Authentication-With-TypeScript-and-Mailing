"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleControllerError = exports.createCustomError = exports.CustomError = void 0;
class CustomError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        // Set the prototype explicitly to fix instanceof checks
        Object.setPrototypeOf(this, CustomError.prototype);
    }
}
exports.CustomError = CustomError;
const createCustomError = (message, statusCode) => {
    return new CustomError(message, statusCode);
};
exports.createCustomError = createCustomError;
const handleControllerError = (error, res) => {
    if (error instanceof CustomError) {
        return res.status(error.statusCode).json({
            status: 'error',
            message: error.message,
        });
    }
    console.error('Unexpected error:', error);
    return res.status(500).json({
        status: 'error',
        message: 'Internal server error',
    });
};
exports.handleControllerError = handleControllerError;
