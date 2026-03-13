import ProductDAO from '../dao/product.dao.js';

class ProductRepository {
    async getProductById(id) {
        return await ProductDAO.findById(id);
    }

    async getAllProducts(filters, paginateOptions) {
        return await ProductDAO.findAllPaginated(filters, paginateOptions);
    }

    async createProduct(productData) {
        return await ProductDAO.create(productData);
    }

    async updateProduct(id, productData) {
        //Si stock llega a 0, marcar como no disponible.
        if (productData.stock === 0) {
            productData.isAvailable = false;
        }
        return await ProductDAO.update(id, productData);
    }

    async deleteProduct(id) {
        return await ProductDAO.delete(id);
    }
}

export default new ProductRepository();