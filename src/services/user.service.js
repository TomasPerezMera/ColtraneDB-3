import UserRepository from '../repositories/user.repository.js';

class UserService {

    async getAll(options = {}) {
        try {
            const { page = 1, limit = 10 } = options;
            return await UserRepository.getAllUsersPaginated({}, { page, limit })
        } catch (error) {
            throw new Error(`Error al obtener usuarios: ${error.message}`);
        }
    }

    async getById(userId) {
        try {
            // Validamos que ID sea numérico.
            if (!Number.isInteger(Number(userId))) {
                throw new Error('ID de usuario inválido');
            }
            const user = await UserRepository.getUserById({ id: userId });
            if (!user) throw new Error('Usuario no encontrado');
            return user;
        } catch (error) {
            throw new Error(`Error obteniendo usuario: ${error.message}`);
        }
    }

    async create(userData) {
        try {
            const newUser = await UserRepository.createUser(userData);
            return newUser;
        } catch (error) {
            throw new Error(`Error creando usuario: ${error.message}`);
        }
    }

    async update(userId, updateData) {
        try {
            if (!Number.isInteger(Number(userId))) {
                throw new Error('ID de usuario inválido');
            }
            const updatedUser = await UserRepository.updateUser({ id: userId }, updateData);
            if (!updatedUser) throw new Error('Usuario no encontrado');
            return updatedUser;
        } catch (error) {
            throw new Error(`Error actualizando usuario: ${error.message}`);
        }
    }

    async delete(userId) {
        try {
            if (!Number.isInteger(Number(userId))) {
                throw new Error('ID de usuario inválido');
            }
            const deletedUser = await UserRepository.deleteUser({ id: userId });
            if (deletedUser.deletedCount === 0) {
                throw new Error('Usuario no encontrado');
            }
            return deletedUser;
        } catch (error) {
            throw new Error(`Error eliminando usuario: ${error.message}`);
        }
    }
}

export default new UserService();