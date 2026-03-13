import cartModel from '../models/cart.model.js';
import mongoose from 'mongoose';
import CartRepository from '../repositories/cart.repository.js';
import ProductService from './product.service.js';

class CartService {

    async create() {
        try {
            const newCart = await CartRepository.createCart();
            return newCart;
        } catch (error) {
            throw new Error(`Error creando carrito: ${error.message}`);
        }
    }

    async getById(cartId) {
        try {
            if (!mongoose.Types.ObjectId.isValid(cartId)) {
                throw new Error('ID de carrito inválido GET');
            }
            const cart = await CartRepository.getCartById(cartId);
            if (!cart) {
                throw new Error('Carrito no encontrado!');
            }
            return cart;
        } catch (error) {
            throw new Error(`Error obteniendo carrito: ${error.message}`);
        }
    }

    async addProduct(cartId, productId, quantity = 1) {
        try {
            if (!mongoose.Types.ObjectId.isValid(cartId)) {
                throw new Error('ID de carrito inválido ADDPROD');
            }
            if (isNaN(productId)) {
                throw new Error('ID de producto inválido!');
            }
            const cart = await CartRepository.getCartById(cartId);
            if (!cart) {
                throw new Error('Carrito no encontrado');
            }
            // Buscamos el producto por ID numérico.
            const product = await ProductService.getById(productId);
            if (!product) {
                throw new Error('Producto no encontrado.');
            }
            const currentTotalItems = cart.products.reduce(
                (sum, item) => sum + item.quantity, 0);
            // Validación Especial: este E-Commerce sólo permite la venta de 3 ítems por compra.
            if (currentTotalItems + quantity > 3) {
            throw new Error('Lo sentimos! Se permite un máximo 3 ítems por compra.');
            }
            // Indexamos cada producto del carrito para sumar cantidad ó crear nuevo registro.
            const existingProductIndex = cart.products.findIndex(
                item => item.product._id.equals(product._id)
            );
            if (existingProductIndex !== -1) {
                cart.products[existingProductIndex].quantity += quantity;
            } else {
                cart.products.push({ product: product._id, quantity: quantity });
            }
            // Guardamos el carrito actualizado y lo retornamos con los datos del producto poblados.
            const updatedCart = await CartRepository.updateCart(cartId, { products: cart.products });
            return updatedCart;
        } catch (error) {
            throw new Error(`Error agregando producto: ${error.message}`);
        }
    }

    async updateProductQuantity(cartId, productId, newQuantity) {
        try {
            if (!mongoose.Types.ObjectId.isValid(cartId)) {
                throw new Error('ID de carrito inválido UPDATEPRODQ');
            }
            if (!mongoose.Types.ObjectId.isValid(productId)) {
                throw new Error('ID de producto inválido');
            }
            const cart = await CartRepository.getCartById(cartId);
            if (!cart) throw new Error('Carrito no encontrado');
            // Buscamos el producto en el carrito;
            const productIndex = cart.products.findIndex(
                item => item.product._id.toString() === productId
            );
            if (productIndex === -1) {
                throw new Error('Producto no encontrado en el carrito FINDINDEX');
            }
            // Si la nueva cantidad es <= 0, eliminamos el producto.
            if (newQuantity <= 0) {
                cart.products.splice(productIndex, 1);
            } else {
                // Validamos límite de 3 ítems, restando la cantidad actual del producto.
                const otherProductsQty = cart.products.reduce(
                    (sum, item, idx) => idx === productIndex ? sum : sum + item.quantity, 0 );
                if (otherProductsQty + newQuantity > 3) {
                    throw new Error('Máximo 3 ítems por compra!');
                }
                cart.products[productIndex].quantity = newQuantity;
            }
            const updatedCart = await CartRepository.updateCart(cartId, { products: cart.products });
            return updatedCart;
        } catch (error) {
            throw new Error(`Error actualizando cantidad: ${error.message}`);
        }
    }

    async removeProduct(cartId, productId) {
        try {
            if (!mongoose.Types.ObjectId.isValid(cartId)) {
                throw new Error('ID de carrito inválido REMOVE');
            }
            if (!mongoose.Types.ObjectId.isValid(productId)) {
                throw new Error('ID de producto inválido');
            }
            const cart = await cartModel.findById(cartId);
            if (!cart) throw new Error('Carrito no encontrado');

            // Filtramos el producto a eliminar y guardamos el carrito actualizado.
            cart.products = cart.products.filter(
                item => item.product.toString() !== productId
            );
            const updatedCart = await CartRepository.updateCart(cartId, { products: cart.products });
            return updatedCart;
        } catch (error) {
            throw new Error(`Error eliminando producto: ${error.message}`);
        }
    }

    async updateCart(cartId, productsArray) {
        try {
            if (!mongoose.Types.ObjectId.isValid(cartId)) {
                throw new Error('ID de carrito inválido UPDATE');
            }
            if (!Array.isArray(productsArray)) {
                throw new Error('Se esperaba un array de productos');
            }
            // Validamos formato y cantidad de cada producto.
            for (const item of productsArray) {
                if (!item.product || !mongoose.Types.ObjectId.isValid(item.product)) {
                    throw new Error('Formato de producto inválido');
                }
                if (!item.quantity || item.quantity < 1) {
                    throw new Error('Quantity debe ser mayor a 0');
                }
            }

            // Validamos límite total de 3 ítems.
            const totalItems = productsArray.reduce((sum, item) => sum + item.quantity, 0);
            if (totalItems > 3) {
                throw new Error('Error: máximo de 3 ítems por compra!');
            }
            const cart = await CartRepository.updateCart(cartId, { products: productsArray });
            if (!cart) throw new Error('Carrito no encontrado');
            return cart;
        } catch (error) {
            throw new Error(`Error actualizando carrito: ${error.message}`);
        }
    }

    async clearCart(cartId) {
        try {
            if (!mongoose.Types.ObjectId.isValid(cartId)) {
                throw new Error('ID de carrito inválido CLEAR');
            }
            const cart = await CartRepository.updateCart(cartId, { products: [] });
            if (!cart) {
                throw new Error('Carrito no encontrado!');
            }
            return cart;
        } catch (error) {
            throw new Error(`Error vaciando carrito: ${error.message}`);
        }
    }
}

export default new CartService();