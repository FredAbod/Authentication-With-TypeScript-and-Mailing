import { z } from 'zod';

export const    signupSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  password: z.string().min(8).max(100),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const resetPasswordSchema = z.object({
  password: z.string().min(8).max(100),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});
