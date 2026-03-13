import { Router } from 'express';
import passport from 'passport';
import { generateToken } from '../utils/jwt.utils.js';
import UserRepository from '../repositories/user.repository.js';
import { sendPasswordResetEmail } from '../config/nodemailer.config.js';
import jwt from 'jsonwebtoken';
import { createHash, isValidPassword } from '../utils/utils.js';
import userModel from '../models/user.model.js';


const router = Router();

// Inicio de autenticación con GitHub.
router.get('/github', passport.authenticate('github', { scope: ['user:email'], session: false  }));

// Callback de GitHub.
router.get('/github/callback',
    passport.authenticate('github', { session: false, failureRedirect: '/login' }),
    (req, res) => {
        const token = generateToken(req.user);
        res.cookie('currentUser', token, {
            maxAge: 24 * 60 * 60 * 1000,
            httpOnly: true,
            signed: true
        });
    res.redirect('/products');
    }
);


// POST /api/sessions/register
router.post('/register',
    passport.authenticate('register', { session: false, failureRedirect: '/register' }),
    (req, res) => {
    const token = generateToken(req.user);
    res.cookie('currentUser', token, {
        maxAge: 24 * 60 * 60 * 1000,
        httpOnly: true,
        signed: true
    });
    res.redirect('/products');
    }
);


// POST /api/sessions/login
router.post('/login', (req, res, next) => {
    passport.authenticate('login', { session: false }, (err, user, info) => {
        if (err) {
            console.error('Login error:', err);
            return res.redirect('/login?error=server');
        }
        if (!user) {
            console.log('Login failed:', info?.message || 'Unknown reason');
            return res.redirect('/login?error=credentials');
        }
        const token = generateToken(user);
        res.cookie('currentUser', token, {
            maxAge: 24 * 60 * 60 * 1000,
            httpOnly: true,
            signed: true
        });
        res.redirect('/products');
    })(req, res, next);
});


// GET /api/sessions/github
router.get('/github',
    passport.authenticate('github', { scope: ['user:email'], session: false })
);


// GET /api/sessions/github/callback
router.get('/github/callback',
    passport.authenticate('github', { session: false, failureRedirect: '/login' }),
    (req, res) => {
    const token = generateToken(req.user);
    res.cookie('currentUser', token, {
        maxAge: 24 * 60 * 60 * 1000,
        httpOnly: true,
        signed: true
    });
    res.redirect('/products');
    }
);


// GET /api/sessions/current
router.get('/current',
    passport.authenticate('current', { session: false }),
    async (req, res) => {
        try {
            const userDTO = await UserRepository.getUserById(req.user.id);
            res.json({
                status: 'success',
                user: userDTO
            });
        } catch (error) {
            res.status(500).json({
                status: 'error',
                message: error.message
            });
        }
    }
);

// POST /api/sessions/logout
router.post('/logout', (req, res) => {
    res.clearCookie('currentUser');
    res.redirect('/products');
});


// Endpoints para NodeMail y recuperación de contraseñas:

// POST /api/sessions/forgot-password
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.json({
                status: 'success',
                message: 'Si el correo existe, recibirás un enlace de recuperación.'
            });
        }
        // Generamos un token temporal de 1hr.
        const resetToken = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );
        // Enviamos el correo;
        await sendPasswordResetEmail(email, resetToken);
        res.json({
            status: 'success',
            message: 'Correo de recuperación enviado!'
        });
    } catch (error) {
        console.error('Error en forgot-password:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error al procesar la solicitud!'
        });
    }
});

// POST /api/sessions/reset-password/:token
router.post('/reset-password/:token', async (req, res) => {
    try {
        const { token } = req.params;
        const { newPassword } = req.body;
        // Verificamos el token recibido.
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (error) {
            return res.status(400).json({
                status: 'error',
                message: 'El enlace ha expirado, o es inválido.',
                expired: true
            });
        }
        // Si el token es válido, buscamos al usuario;
        const user = await userModel.findOne({ id: decoded.userId }).select('+password');
        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'Usuario no encontrado.'
            });
        }
        // Y luego validamos que la nueva contraseña sea diferente a la anterior.
        if (isValidPassword(user, newPassword)) {
            return res.status(400).json({
                status: 'error',
                message: 'La nueva contraseña no puede ser igual a la anterior!'
            });
        }
        // Guardamos contraseña.
        user.password = createHash(newPassword);
        await user.save();
        res.json({
            status: 'success',
            message: 'Contraseña actualizada correctamente!'
        });
    } catch (error) {
        console.error('Error en reset-password:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error al restablecer contraseña'
        });
    }
});


export default router;