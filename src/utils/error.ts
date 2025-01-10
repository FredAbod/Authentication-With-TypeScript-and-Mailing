// src/utils/error.ts
import { Response } from 'express';

export class CustomError extends Error {
  public statusCode: number;
  
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    // Set the prototype explicitly to fix instanceof checks
    Object.setPrototypeOf(this, CustomError.prototype);
  }
}

export const createCustomError = (message: string, statusCode: number): CustomError => {
  return new CustomError(message, statusCode);
};

export const handleControllerError = (error: unknown, res: Response): Response => {
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