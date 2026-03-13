import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const productCollection = 'products';

const productSchema = new mongoose.Schema({
    id: {
        type: Number,
        unique: true,
        required: true
    },
    name: {
        type: String,
        required: [true, 'El nombre es obligatorio!'],
        trim: true
    },
    artist: {
        type: String,
        required: [true, 'El artista es obligatorio!'],
        default: 'John Coltrane',
        trim: true,
        // Índice para facilitar búsquedas por artista.
        index: true
    },
    description: {
        type: String,
        required: [true, 'La descripción es obligatoria'],
        trim: true
    },
    coverImageSource: {
        type: String,
        required: true,
        default: '/src/public/static/coltrane404.jpg'
    },
    currentPrice: {
        type: Number,
        required: [true, 'El precio es obligatorio!'],
        min: [0, 'El precio no puede ser negativo!']
    },
    discount: {
        type: Number,
        default: 0,
        min: [0, 'El descuento no puede ser negativo!'],
        max: [100, 'El descuento no puede ser mayor a 100%']
    },
    stock: {
        type: Number,
        required: [true, 'El stock es obligatorio!'],
        min: [0, 'El stock no puede ser negativo!'],
        default: 0
    },
    category: {
        type: String,
        required: [true, 'La categoría es obligatoria!'],
        enum: ['Jazz', 'Blues', 'Otros'],
        index: true
    },
    isAvailable: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,
    versionKey: false
});

// Implementamos Paginate.
productSchema.plugin(mongoosePaginate);

// Método para calcular el precio final en caso de aplicar descuento.
productSchema.virtual('finalPrice').get(function() {
    if (this.discount > 0) {
        return this.currentPrice * (1 - this.discount / 100);
    }
    return this.currentPrice;
});

// Declaraciones para incluir campo virtual finalPrice en JSON/Object.
productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

// Middleware para auto-incrementar id al crear un producto.
productSchema.pre('save', async function(next) {
    if (this.isNew) {
        const lastProduct = await this.constructor.findOne().sort({ id: -1 });
        this.id = lastProduct ? lastProduct.id + 1 : 1;
    }
    next();
});

const productModel = mongoose.model(productCollection, productSchema);
export default productModel;