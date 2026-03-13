export const initializeSocket = (io) => {
    io.on('connection', (socket) => {
        console.log('Cliente conectado: ', socket.id);

        // Evento: Catálogo de productos actualizado.
        socket.on('updateProducts', (data) => {
            // Broadcast a todos los clientes conectados.
            io.emit('productsUpdated', data);
        });

        // Evento: Producto se agota.
        socket.on('productOutOfStock', (productId) => {
            io.emit('stockUpdate', { productId, available: false });
        });

        // Evento: Nuevo producto añadido.
        socket.on('newProductAdded', (product) => {
            socket.broadcast.emit('catalogUpdated', product);
        });

        // Evento: Carrito actualizado.
        socket.on('updateCart', (cartId) => {
            socket.broadcast.emit('cartUpdated', { cartId });
        });

        // Evento: Desconexión de cliente.
        socket.on('disconnect', () => {
            console.log('Cliente desconectado:', socket.id);
        });
    });
};