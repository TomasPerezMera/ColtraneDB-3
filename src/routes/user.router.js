import { Router } from 'express';
import UserService from '../services/user.service.js';

const router = Router();

// Middleware para agregar 'io' a req.
router.use((req, res, next) => {
    req.io = req.app.get('io');
    next();
});

// GET
router.get('/', async (req, res) => {
    try {
        const users = await UserService.getAll(req.query);
        res.status(200).json({ status: 'success', payload: users });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const user = await UserService.getById(req.params.id);
        if (!user) throw new Error('Usuario no encontrado');
        res.status(200).json({ status: 'success', payload: user });
    } catch (error) {
        res.status(404).json({ status: 'error', message: error.message });
    }
});

// POST
router.post('/', async (req, res) => {
    try {
        const { first_name, last_name, email, age, password, role } = req.body;
        const user = await UserService.create({ first_name, last_name, email, age, password, role });
        res.status(201).json({ status: 'success', payload: user._id });
    } catch (error) {
        res.status(400).json({ status: 'error', message: error.message });
    }
});

// PUT
router.put('/:id', async (req, res) => {
    try {
        const updateUser = req.body;
        const userResult = await UserService.update(req.params.id, updateUser);
        res.status(200).json({ status: 'success', payload: userResult });
    } catch (error) {
        res.status(400).json({ status: 'error', message: error.message });
    }
});

// DELETE
router.delete('/:id', async (req, res) => {
    try {
        const userResult = await UserService.delete(req.params.id);
        res.status(200).json({ status: 'success', payload: userResult });
    } catch (error) {
        res.status(404).json({ status: 'error', message: error.message });
    }
});

export default router;