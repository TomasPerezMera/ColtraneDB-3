import CartDAO from '../dao/cart.dao.js';

class CartRepository {
    async getCartById(cartId) {
        return await CartDAO.findById(cartId);
    }

    async createCart() {
        return await CartDAO.create();
    }

    async updateCart(cartId, cartData) {
        return await CartDAO.update(cartId, cartData);
    }

    async deleteCart(cartId) {
        return await CartDAO.delete(cartId);
    }

    async saveCart(cart) {
        return await CartDAO.save(cart);
    }
}

export default new CartRepository();