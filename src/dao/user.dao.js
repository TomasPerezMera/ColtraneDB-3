import userModel from '../models/user.model.js';

class UserDAO {
    async findById(id) {
        return await userModel.findOne({ id });
    }

    async findByEmail(email) {
        return await userModel.findOne({ email });
    }

    async findByGithubId(githubId) {
        return await userModel.findOne({ githubId });
    }

    async create(userData) {
        const user = new userModel(userData);
        return await user.save();
    }

    async update(id, userData) {
        return await userModel.findOneAndUpdate(
            { id },
            userData,
            { returnDocument: 'after', runValidators: true }
        );
    }

    async delete(id) {
        return await userModel.findOneAndDelete({ id });
    }

    async getAll() {
        return await userModel.find();
    }

    async getAllPaginated(filter, options) {
    return await userModel.paginate(filter, options);
    }
}

export default new UserDAO();