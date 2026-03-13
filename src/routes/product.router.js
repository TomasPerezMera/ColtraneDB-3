import { Router } from 'express';
import ProductService from '../services/product.service.js';
import { isAuthenticated } from '../middlewares/auth.middleware.js';
import { isAdmin } from '../middlewares/auth.middleware.js';

const router = Router();

// Middleware para agregar 'io' a req.
router.use((req, res, next) => {
    req.io = req.app.get('io');
    next();
});

// GET - Mostrar todos los productos, y producto por ID.
router.get('/', async (req, res) => {
    try {
        const products = await ProductService.getAll(req.query);
        res.status(200).json({
            status: 'success',
            payload: products.docs,
            totalPages: products.totalPages,
            prevPage: products.prevPage,
            nextPage: products.nextPage,
            page: products.page,
            hasPrevPage: products.hasPrevPage,
            hasNextPage: products.hasNextPage,
            prevLink: products.prevLink,
            nextLink: products.nextLink
        });
    }
    catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

router.get('/:id', async (req, res) => {
    // Validación para prevenir bug recurrente - carga de "source maps" bajo productId.
    if (isNaN(req.params.id)) {
        return res.status(400).json({
            status: 'error',
            message: 'ID de producto inválido!'
        });
    }
    try {
        const product = await ProductService.getById(req.params.id);
        if (!product) throw new Error('Producto no encontrado');
        res.status(200).json({ status: 'success', payload: product });
    }
    catch (error) {
        res.status(404).json({ status: 'error', message: error.message });
    }
});



// POST - Crear un producto.
router.post('/', isAuthenticated, isAdmin, async (req, res) => {
    try {
    const { name, artist, description, coverImageSource, currentPrice,
        discount, stock, category, isAvailable } = req.body;
    const newProduct = await ProductService.create({
        name, artist, description, coverImageSource, currentPrice,
        discount, stock, category, isAvailable });
        req.io.emit('newProductAdded', newProduct);
        res.status(201).json({ status: 'success', payload: newProduct });
    } catch (error) {
        res.status(400).json({ status: 'error', message: error.message });
    }
});

// PUT - Actualizar un producto.
router.put('/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const updated = await ProductService.update(req.params.id, req.body);
        req.io.emit('productUpdated', updated);
        if (updated.stock === 0) {
            req.io.emit('productOutOfStock', updated.id);
        }
        res.status(200).json({ status: 'success', payload: updated });
    } catch (error) {
        res.status(400).json({ status: 'error', message: error.message });
    }
});

// PUT - Descontar stock al confirmar compra.
router.put('/:id/purchase', async (req, res) => {
    try {
        const { quantity } = req.body;
        const product = await ProductService.getById(req.params.id);
        if (product.stock < quantity) {
            return res.status(400).json({
                status: 'error',
                message: 'Stock insuficiente'
            });
        }
        const updated = await ProductService.update(req.params.id, {
            stock: product.stock - quantity
        });
        res.status(200).json({ status: 'success', payload: updated });
    } catch (error) {
        res.status(400).json({ status: 'error', message: error.message });
    }
});

// DELETE - Eliminar un producto.
router.delete('/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const deleted = await ProductService.delete(req.params.id);
        req.io.emit('productDeleted', deleted);
        res.status(200).json({ status: 'success', payload: deleted });
    } catch (error) {
        res.status(404).json({ status: 'error', message: error.message });
    }
});

export default router;