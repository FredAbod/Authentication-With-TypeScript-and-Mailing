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
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequest = void 0;
/**
 * Middleware to validate the request body against a given Zod schema.
 *
 * @param schema - The Zod schema to validate the request body against.
 * @returns An Express middleware function that validates the request body.
 *
 * @throws Will respond with a 400 status code and a JSON error message if validation fails.
 */
const validateRequest = (schema) => {
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield schema.parseAsync(req.body);
            next();
        }
        catch (error) {
            if (error instanceof Error) {
                res.status(400).json({
                    status: 'error',
                    message: 'Validation failed',
                    errors: 'errors' in error ? error.errors : [error.message],
                });
                return;
            }
            next(error);
        }
    });
};
exports.validateRequest = validateRequest;
