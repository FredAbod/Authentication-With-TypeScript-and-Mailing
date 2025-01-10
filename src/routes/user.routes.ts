import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { validateRequest } from '../middleware/validate';
import { signupSchema, loginSchema, resetPasswordSchema, forgotPasswordSchema } from '../validators/user.validators';

const router = Router();

router.post('/signup', validateRequest(signupSchema), UserController.signup);
router.post('/login', validateRequest(loginSchema), UserController.login);
router.get('/verify-email/:token', UserController.verifyEmail);
router.post('/forgot-password', validateRequest(forgotPasswordSchema), UserController.forgotPassword);
router.post('/reset-password/:token', validateRequest(resetPasswordSchema), UserController.resetPassword);

export default router;