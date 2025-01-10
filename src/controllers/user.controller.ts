import { Request, Response } from "express";
import { User } from "../models/user.Models";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { config } from "../config/config";
import { IUserInput } from "../types/user.types";
import { createCustomError } from "../utils/error";
import { EmailService } from "../services/email.service";
import crypto from "crypto";

export class UserController {
    static async signup(req: Request, res: Response): Promise<void> {
        try {
          const { name, email, password }: IUserInput = req.body;
      
          const existingUser = await User.findOne({ email });
          if (existingUser) {
            res.status(400).json({
              status: 'error',
              message: 'User already exists',
            });
            return;
          }
      
          // First verify SMTP connection
          const isEmailServiceWorking = await EmailService.verifyConnection();
          if (!isEmailServiceWorking) {
            res.status(500).json({
              status: 'error',
              message: 'Email service is not available. Please try again later.',
            });
            return;
          }
      
          const verificationToken = crypto.randomBytes(32).toString('hex');
          const hashedPassword = await bcrypt.hash(password, config.bcrypt.saltRounds);
      
          const user = await User.create({
            name,
            email,
            password: hashedPassword,
            verificationToken,
            verificationTokenExpires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
          });
      
          try {
            await EmailService.sendVerificationEmail(email, name, verificationToken);
            
            res.status(201).json({
              status: 'success',
              message: 'Registration successful. Please check your email to verify your account.',
            });
          } catch (emailError) {
            // If email fails, we should delete the user or mark them as requiring email verification retry
            console.error('Failed to send verification email:', emailError);
            await User.findByIdAndUpdate(user._id, {
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
        } catch (error) {
          console.error('Signup error:', error);
          res.status(500).json({
            status: 'error',
            message: 'Internal server error',
          });
        }
      }
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email });
      if (!user) {
        res.status(401).json({
          status: "error",
          message: "Invalid credentials",
        });
        return;
      }
      if (user.isVerified != true) {
        res.status(401).json({
          status: "error",
          message: "Verify Email",
        });
        return;
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        res.status(401).json({
          status: "error",
          message: "Invalid credentials",
        });
        return;
      }

      const token = jwt.sign({ userId: user._id }, config.jwt.secret, {
        expiresIn: config.jwt.expiresIn,
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
    } catch (error) {
      res.status(500).json({
        status: "error",
        message: "Internal server error",
      });
    }
  }

  static async verifyEmail(req: Request, res: Response): Promise<void> {
    try {
      const { token } = req.params;

      const user = await User.findOne({
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

      user.isVerified = true;
      user.verificationToken = undefined;
      user.verificationTokenExpires = undefined;
      await user.save();

      res.json({
        status: "success",
        message: "Email verified successfully",
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        message: "Internal server error",
      });
    }
  }

  static async forgotPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;
  
      const user = await User.findOne({ email });
      if (!user) {
        res.status(404).json({
          status: 'error',
          message: 'No account found with that email',
        });
        return;
      }
  
      // Verify email service before proceeding
      const isEmailServiceWorking = await EmailService.verifyConnection();
      if (!isEmailServiceWorking) {
        res.status(500).json({
          status: 'error',
          message: 'Email service is not available. Please try again later.',
        });
        return;
      }
  
      const resetToken = crypto.randomBytes(32).toString('hex');
      user.resetPasswordToken = resetToken;
      user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
      await user.save();
  
      try {
        await EmailService.sendPasswordResetEmail(email, user.name, resetToken);
        
        res.json({
          status: 'success',
          message: 'Password reset instructions sent to your email',
        });
      } catch (emailError) {
        console.error('Failed to send password reset email:', emailError);
        
        // Reset the token since email failed
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();
  
        res.status(500).json({
          status: 'error',
          message: 'Failed to send password reset email. Please try again later.',
        });
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Internal server error',
      });
    }
  }

  static async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const { token } = req.params;
      const { password } = req.body;

      const user = await User.findOne({
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

      const hashedPassword = await bcrypt.hash(
        password,
        config.bcrypt.saltRounds
      );
      user.password = hashedPassword;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();

      res.json({
        status: "success",
        message: "Password reset successfully",
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        message: "Internal server error",
      });
    }
  }
}
