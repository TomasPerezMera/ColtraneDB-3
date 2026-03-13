import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const userCollection = 'users';

const userSchema = new mongoose.Schema({
    id: {
        type: Number,
        unique: true,
        required: false
    },
    githubId: {
        type: String,
        unique: true,
        // Permite múltiples nulls.
        sparse: true
    },
    first_name: {
        type: String,
        required: [true, 'El nombre es obligatorio!'],
        trim: true
    },
    last_name: {
        type: String,
        // Campos condicionales ya que acceso vía Github no retorna estos datos, pero sí el Register Form.
        required: function() {
            return this.password !== '';
        },
        trim: true,
        default: ''
    },
    email: {
        type: String,
        required: [true, 'El email es obligatorio!'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Error - email con caracteres inválidos!'],
    },
    age: {
        type: Number,
        required: function() {
        return this.password !== '';
        },
        default: 0,
        trim: true
    },
    password: {
        type: String,
        // Password requerido SÓLO si no hay githubId.
        required: function() {
            return !this.githubId;
        },
        default: '',
        validate: {
            validator: function(value) {
            // Solo validamos longitud si hay password (no GitHub login).
            if (!value || value === '') return true;
            return value.length >= 6;
            },
            message: 'La contraseña debe tener al menos 6 caracteres!'
        },
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    cart: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'carts'
    }
}, {
    timestamps: true,
    versionKey: false
});

// Implementamos Paginate.
userSchema.plugin(mongoosePaginate);

// Middleware para auto-incrementar id al crear un Usuario.
userSchema.pre('save', async function() {
    if (this.isNew && !this.id) {
        const lastUser = await this.constructor.findOne().sort({ id: -1 });
        this.id = lastUser ? lastUser.id + 1 : 1;
    }
});

const userModel = mongoose.model(userCollection, userSchema);
export default userModel;