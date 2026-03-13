import mongoose from 'mongoose';

const cartCollection = 'carts';

const cartSchema = new mongoose.Schema({
    products: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'products',
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: [1, 'La cantidad mínima es 1'],
            default: 1
        }
    }]
}, {
    timestamps: true,
    versionKey: false
});

// Método para calcular el total del carrito
cartSchema.virtual('totalPrice').get(function() {
    let total = 0;

    for (let item of this.products) {
        const price = item.product.currentPrice || 0;
        total += price * item.quantity;
    }
    return total;
});

// Incluir virtuals en JSON - PERO excluímos id auto-generado (bug recurrente!).
cartSchema.set('toJSON', { virtuals: true });
cartSchema.set('toObject', { virtuals: true });

const cartModel = mongoose.model(cartCollection, cartSchema);
export default cartModel;