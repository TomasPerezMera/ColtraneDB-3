import productModel from '../models/product.model.js';

class ProductDAO {
    async findById(id) {
        return await productModel.findOne(id);
    }

    async findAll(filters = {}) {
        return await productModel.find(filters);
    }

    async findAllPaginated(filter, options) {
    return await productModel.paginate(filter, options);
    }

    async create(productData) {
        return await productModel.create(productData);
    }

    async update(id, productData) {
        return await productModel.findOneAndUpdate(
            { id },
            productData,
            { returnDocument: 'after', runValidators: true }
        );
    }

    async delete(id) {
        return await productModel.findOneAndDelete({ id });
    }
}

export default new ProductDAO();