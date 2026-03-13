import { Router } from 'express';
import CartService from '../services/cart.service.js';
import TicketService from '../services/ticket.service.js';
import ProductService from '../services/product.service.js';
import { isAuthenticated, isUser } from '../middlewares/auth.middleware.js' ;


const router = Router();

// Middleware para agregar 'io' a req
router.use((req, res, next) => {
    req.io = req.app.get('io');
    next();
});

// POST - Crear carrito.
router.post('/', async (req, res) => {
    try {
        const newCart = await CartService.create();
        res.status(201).json({ status: 'success', payload: newCart });
    } catch (error) {
        res.status(400).json({ status: 'error', message: error.message });
    }
});

// GET - Obtener carrito por ID.
router.get('/:cid', async (req, res) => {
    try {
        const cart = await CartService.getById(req.params.cid);
        res.status(200).json({ status: 'success', payload: cart });
    } catch (error) {
        res.status(404).json({ status: 'error', message: error.message });
    }
});

// POST - Agregar producto al carrito.
router.post('/:cid/products/:pid', async (req, res) => {
    try {
        const { quantity = 1 } = req.body;
        const cart = await CartService.addProduct(
            req.params.cid,
            req.params.pid,
            quantity
        );
        req.io.emit('cartUpdated', { cartId: req.params.cid });
        res.status(200).json({ status: 'success', payload: cart });
    } catch (error) {
        res.status(400).json({ status: 'error', message: error.message });
    }
});

// PUT - Actualizar cantidad de un producto.
router.put('/:cid/products/:pid', async (req, res) => {
    try {
        const { quantity } = req.body;
        if (quantity === undefined) {
            return res.status(400).json({
                status: 'error',
                message: 'Se requiere el campo quantity'
            });
        }
        const cart = await CartService.updateProductQuantity(
            req.params.cid,
            req.params.pid,
            quantity
        );
        req.io.emit('cartUpdated', { cartId: req.params.cid });
        res.status(200).json({ status: 'success', payload: cart });
    } catch (error) {
        res.status(400).json({ status: 'error', message: error.message });
    }
});

// PUT - Actualizar el carrito completo, reemplazando productos.
router.put('/:cid', async (req, res) => {
    try {
        const { products } = req.body;
        if (!products) {
            return res.status(400).json({
                status: 'error',
                message: 'Se requiere el campo products (array)'
            });
        }
        const cart = await CartService.updateCart(req.params.cid, products);
        req.io.emit('cartUpdated', { cartId: req.params.cid });
        res.status(200).json({ status: 'success', payload: cart });
    } catch (error) {
        res.status(400).json({ status: 'error', message: error.message });
    }
});

// DELETE - Eliminar producto del carrito.
router.delete('/:cid/products/:pid', async (req, res) => {
    try {
        const cart = await CartService.removeProduct(
            req.params.cid,
            req.params.pid
        );
        req.io.emit('cartUpdated', { cartId: req.params.cid });
        res.status(200).json({ status: 'success', payload: cart });
    } catch (error) {
        res.status(404).json({ status: 'error', message: error.message });
    }
});

// DELETE - Vaciar carrito.
router.delete('/:cid', async (req, res) => {
    try {
        const cart = await CartService.clearCart(req.params.cid);
        req.io.emit('cartUpdated', { cartId: req.params.cid });
        res.status(200).json({ status: 'success', payload: cart });
    } catch (error) {
        res.status(404).json({ status: 'error', message: error.message });
    }
});


// POST /:cid/purchase - Confirmación de Compra.
router.post('/:cid/purchase', isAuthenticated, isUser, async (req, res) => {
    try {
        const cart = await CartService.getById(req.params.cid);
        if (!cart || cart.products.length === 0) {
            return res.status(400).json({
                status: 'error',
                message: 'Carrito vacío'
            });
        }
        // Stock-check para manejar falta de stock en algún producto.
        const productosNoComprados = [];
        for (const item of cart.products) {
            const product = await ProductService.getById(item.product.id);
            if (product.stock < item.quantity) {
                productosNoComprados.push(item.product.id);
            }
        }
        // Si algún producto no tiene stock, no se realiza la venta.
        if (productosNoComprados.length > 0) {
            return res.status(400).json({
                status: 'error',
                message: 'Stock insuficiente',
                productosNoComprados
            });
        }
        // Luego de Stock-check, procesamos la venta;
        let totalAmount = 0;
        for (const item of cart.products) {
            const product = await ProductService.getById(item.product.id);
            totalAmount += product.currentPrice * item.quantity;
            // Descontamos stock de productos.
            await ProductService.update(product.id, {
                stock: product.stock - item.quantity
            });
        }
        // Generamos el ticket de venta;
        const ticket = await TicketService.create(req.user.email, totalAmount);
        // Vaciamos carrito luego de la venta.
        cart.products = [];
        await cart.save();
        res.status(200).json({
            status: 'success',
            ticket
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});



export default router;