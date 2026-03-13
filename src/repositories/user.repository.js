import UserDAO from '../dao/user.dao.js';
import UserDTO from '../dto/user.dto.js';

class UserRepository {
    async getUserById(id) {
        const user = await UserDAO.findById(id);
        return user ? new UserDTO(user) : null;
    }

    async getUserByEmail(email) {
        return await UserDAO.findByEmail(email);
    }

    async createUser(userData) {
        return await UserDAO.create(userData);
    }

    async updateUser(id, userData) {
        return await UserDAO.update(id, userData);
    }

    async deleteUser(id) {
        return await UserDAO.delete(id);
    }

    async getAllUsers() {
        const users = await UserDAO.getAll();
        return users.map(user => new UserDTO(user));
    }

    async getAllUsersPaginated(filter = {}, options) {
        const result = await UserDAO.getAllPaginated(filter, options);
        result.docs = result.docs.map(user => new UserDTO(user));
        return result;
    }
}

export default new UserRepository();