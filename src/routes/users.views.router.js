import { Router } from 'express';
import { isAuthenticated, isNotAuthenticated } from '../middlewares/auth.middleware.js';

const router = Router();

// Rutas accesibles sólo si el Usuario NO está logueado;
// GET /login
router.get('/login', isNotAuthenticated, (req, res) => {
    res.render('users/login');
});

// GET /register
router.get('/register', isNotAuthenticated, (req, res) => {
    res.render('users/register');
});

// Solo accesible si el usuario está logueado;
// GET /profile
router.get('/profile', isAuthenticated, (req, res) => {
    res.render('users/profile', {
        user: req.user,
        isAdmin: req.user.role === 'admin'
    });
});

// Rutas para el proceso de reseteo de contraseña.
// GET /forgot-password
router.get('/forgot-password', (req, res) => {
    res.render('users/forgot-password');
});

// GET /reset-password
router.get('/reset-password/:token', (req, res) => {
    res.render('users/reset-password');
});


export default router;