import cartModel from '../models/cart.model.js';

class CartDAO {
    async findById(cartId) {
        return await cartModel.findById(cartId).populate('products.product');
    }

    async create() {
        return await cartModel.create({ products: [] });
    }

    async update(cartId, cartData) {
    return await cartModel
        .findByIdAndUpdate(cartId, cartData, { returnDocument: 'after', runValidators: true })
        .populate('products.product');
    }

    async delete(cartId) {
        return await cartModel.findByIdAndDelete(cartId);
    }

    async save(cart) {
        return await cart.save();
    }
}

export default new CartDAO();