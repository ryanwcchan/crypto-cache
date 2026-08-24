import { Router } from 'express';
import { signup, login } from '../controllers/auth.controllers';

const router = Router();

// Signup route
router.post('/signup', signup);

// Login route
router.post('/login', login);

// CRUD operations for users


export default router;