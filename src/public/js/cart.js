// Obtención del carrito.
function getCartId() {
    return localStorage.getItem("cartId");
}

function setCartId(id) {
    localStorage.setItem("cartId", id);
}

// Inicialización del carrito.
async function initCart() {
    let cartId = localStorage.getItem("cartId");
    if (!cartId) {
        const res = await fetch("/api/carts", { method: "POST" });
        const data = await res.json();
        cartId = data.payload._id;
        localStorage.setItem("cartId", cartId);
    }
    return cartId;
}

// Añadir un producto al carrito.
async function addToCart(productId, quantity = 1) {
    let cartId = getCartId();
    if (!cartId) {
        cartId = await initCart();
    }
    const res = await fetch(`/api/carts/${cartId}/products/${productId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity })
    });
    if (!res.ok) {
        const err = await res.json();
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: err.message || 'No se pudo añadir al carrito',
            toast: true,
            position: 'top-end',
            timer: 3000,
            showConfirmButton: false
        });
        return;
    }
    Swal.fire({
        icon: 'success',
        title: '¡Añadido!',
        text: `${quantity} producto(s) añadido(s) al carrito`,
        toast: true,
        position: 'top-end',
        timer: 2000,
        showConfirmButton: false
    });
    updateCartCounter();
    animateCartIcon();
}



// Eliminar un producto del carrito.
async function removeFromCart(productId) {
    const cartId = getCartId();
    await fetch(`/api/carts/${cartId}/products/${productId}`, {
        method: "DELETE"
    });
    location.reload();
}

// Vaciar el carrito.
async function clearCart() {
    const cartId = getCartId();
    await fetch(`/api/carts/${cartId}`, {
        method: "DELETE"
    });
    location.reload();
}

// Helper Functions.
function animateCartIcon() {
    const cartIcon = document.querySelector(".cart-icon");
    if (!cartIcon) return;
    cartIcon.classList.add("cart-bump");
    setTimeout(() => {
        cartIcon.classList.remove("cart-bump");
    }, 300);
}


// Actualizar el contador del carrito en la interfaz.
async function updateCartCounter() {
    const cartId = localStorage.getItem("cartId");
    const counter = document.querySelector(".cart-count");
    if (!counter) return;
    if (!cartId) {
        const guestCart = JSON.parse(localStorage.getItem("guestCart") || "[]");
        const count = guestCart.reduce((sum, item) => sum + item.quantity, 0);
        counter.textContent = count;
        return;
    }
    try {
        const res = await fetch(`/api/carts/${cartId}`);
        if (!res.ok){
            counter.textContent = 0;
            return;
        }
        const data = await res.json();
        const count = data.payload.products.reduce((sum, p) => sum + p.quantity, 0);
        counter.textContent = count;
    } catch (error) {
        counter.textContent = 0;
    }
}

// Actualizar cantidad de un producto específico.
async function updateProductQuantity(productId, newQuantity) {
    const cartId = getCartId();
    try {
        const res = await fetch(`/api/carts/${cartId}/products/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: newQuantity })
            });
        const data = await res.json();
        if (!res.ok) {
            const err = await res.json();
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: err.message,
                toast: true,
                position: 'top-end',
                timer: 3000
                });
            return { success: false };
            }
        return { success: true, cart: data.payload };
    } catch(error) {
        Swal.fire({
            icon: 'error',
            text: 'Error al actualizar cantidad!'
        });
        return { success: false };
    }
}


// Gestión de proceso de compra.
async function handlePurchase() {
    // 1. Validamos si el usuario está logueado.
    let isLoggedIn = false;
    try {
        const authCheck = await fetch('/api/sessions/current');
        isLoggedIn = authCheck.ok;
    } catch (error) {
        isLoggedIn = false;
    }
    if (!isLoggedIn) {
        await Swal.fire({
            icon: 'warning',
            title: 'Iniciá sesión',
            text: 'Tenés que iniciar sesión para realizar la compra!',
            confirmButtonText: 'Ir a Login',
            confirmButtonColor: '#6366f1'
        });
        window.location.href = '/login';
        return;
    }
    // 2. Procesamos compra llamando al endpoint /purchase.
    try {
        const cartId = getCartId();
        const res = await fetch(`/api/carts/${cartId}/purchase`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        const data = await res.json();
        // Stock Check: si hay algún producto sin stock, cancelamos la venta.
        if (data.productosNoComprados && data.productosNoComprados.length > 0) {
            await Swal.fire({
                icon: 'error',
                title: 'Stock insuficiente',
                text: 'Algunos productos no tienen stock disponible. Por favor, actualiza tu carrito.',
                confirmButtonText: 'Entendido',
                confirmButtonColor: '#6366f1'
            });
            return;
        }
        if (!res.ok) {
            throw new Error(data.message || 'Error al procesar la compra');
        }
        // Compra completa exitosa
        await Swal.fire({
            icon: 'success',
            title: '¡Gracias por tu compra!',
            text: `Tu pedido ha sido procesado. Ticket: ${data.ticket.code}`,
            confirmButtonText: 'Volver al catálogo',
            confirmButtonColor: '#6366f1'
        });
        window.location.href = '/products';
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message || 'No se pudo procesar la compra',
            confirmButtonColor: '#6366f1'
        });
    }
}



// Event Listeners y funciones para inicializar botones.
function initAddToCartButtons() {
    document.body.addEventListener("click", async (e) => {
        const btn = e.target.closest(".add-to-cart");
        if (!btn) return;
        const productId = btn.dataset.productId;
        const qtyElement = document.querySelector('.qty-value');
        const quantity = qtyElement ? parseInt(qtyElement.textContent) : 1;
        await addToCart(productId, quantity);
    });
}

function initCartPageButtons() {
    document.body.addEventListener("click", async (e) => {
        const removeBtn = e.target.closest(".remove-from-cart");
        if (removeBtn) {
            const productId = removeBtn.dataset.productId;
            await removeFromCart(productId);
        }
        const clearBtn = e.target.closest(".clear-cart");
        if (clearBtn) {
            await clearCart();
        }
    });
}


// Función Helper para actualizar displays tras cambio de cantidad de ítems.
function handleCartQuantityUpdate(result, productId, controls) {
    if (!result.success) return;
    const totalItems = result.cart.products.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = result.cart.products.reduce((sum, item) => {
        return sum + (item.product.currentPrice * item.quantity);
    }, 0);
    // Actualizamos totales globales;
    const totalItemsDisplay = document.querySelector('.display-total-items');
    if (totalItemsDisplay) totalItemsDisplay.textContent = totalItems;
    const totalPriceDisplay = document.querySelector('.display-total-price');
    if (totalPriceDisplay) totalPriceDisplay.textContent = totalPrice;
    // Actualizamos item específico;
    const itemProduct = result.cart.products.find(p => p.product._id.toString() === productId);
    if (itemProduct) {
        const itemQuantityDisplay = document.querySelector(`.item-quantity[data-product-id="${productId}"] span`);
        if (itemQuantityDisplay) itemQuantityDisplay.textContent = itemProduct.quantity;
        const itemTotalPrice = itemProduct.product.currentPrice * itemProduct.quantity;
        const itemTotalPriceDisplay = document.querySelector(`.item-total-price[data-product-id="${productId}"] span`);
        if (itemTotalPriceDisplay) itemTotalPriceDisplay.textContent = itemTotalPrice;
    }
    // Actualizamos botones globales;
    document.querySelectorAll('.cart-btn-plus').forEach(btn => {
        btn.disabled = (totalItems >= 3);
    });
    // Por último, actualizamos contador del navbar.
    updateCartCounter();
    animateCartIcon();
}

// Inicializamos listeners de botones de cantidad.
function initCartQuantityControls() {
    document.querySelectorAll('.quantity-controls').forEach(controls => {
        const plusBtn = controls.querySelector('.cart-btn-plus');
        const minusBtn = controls.querySelector('.cart-btn-minus');
        const qtyDisplay = controls.querySelector('.cart-qty-display');
        const productId = plusBtn?.dataset.productId || minusBtn?.dataset.productId;
        const initialTotal = parseInt(document.querySelector('.display-total-items')?.textContent || '0');
        if (plusBtn) plusBtn.disabled = (initialTotal >= 3);
        // Listenes de Botones;
        if (plusBtn) {
            plusBtn.addEventListener('click', async () => {
                const currentQty = parseInt(qtyDisplay.textContent);
                const result = await updateProductQuantity(productId, currentQty + 1);
                if (result.success) {
                    qtyDisplay.textContent = currentQty + 1;
                    handleCartQuantityUpdate(result, productId, controls);
                }
            });
        }
        if (minusBtn) {
            minusBtn.addEventListener('click', async () => {
                const currentQty = parseInt(qtyDisplay.textContent);
                if (currentQty > 1) {
                    const result = await updateProductQuantity(productId, currentQty - 1);
                    if (result.success) {
                        qtyDisplay.textContent = currentQty - 1;
                        handleCartQuantityUpdate(result, productId, controls);
                    }
                } else {
                    await removeFromCart(productId);
                    updateCartCounter();
                    animateCartIcon();
                }
            });
        }
    });
}

// Función inicializadora de cálculo de precio de cart-items.
function initCartPriceCalculations() {
    document.querySelectorAll('.item-total-price').forEach(priceEl => {
        const unitPrice = parseFloat(priceEl.dataset.unitPrice);
        const productId = priceEl.dataset.productId;
        const quantityEl = document.querySelector(`.item-quantity[data-product-id="${productId}"] span`);
        if (quantityEl) {
            const quantity = parseInt(quantityEl.textContent);
            const totalPriceSpan = priceEl.querySelector('span');
            if (totalPriceSpan) totalPriceSpan.textContent = unitPrice * quantity;
        }
    });
}


// Botones de ProductDetail.
function initProductDetailQuantity() {
    document.body.addEventListener("click", (e) => {
        const btn = e.target.closest(".qty-btn-detail");
        if (!btn) return;
        const qtyValue = document.querySelector(".qty-value");
        const plusBtn = document.querySelector('.qty-btn-detail[data-action="increase"]');
        const minusBtn = document.querySelector('.qty-btn-detail[data-action="decrease"]');
        let qty = parseInt(qtyValue.textContent);
        if (btn.dataset.action === "increase" && qty < 3) qty++;
        if (btn.dataset.action === "decrease" && qty > 1) qty--;
        qtyValue.textContent = qty;
        if (plusBtn) plusBtn.disabled = (qty >= 3);
        if (minusBtn) minusBtn.disabled = (qty <= 1);
    });
}

function initPurchaseButton() {
    document.body.addEventListener("click", async (e) => {
        const btn = e.target.closest(".make-purchase");
        if (!btn) return;
        await handlePurchase();
    });
}


// Event Listeners en la carga de página.
document.addEventListener("DOMContentLoaded", async () => {
    await initCart();
    if (document.querySelector('.cart-total')) {
        initCartPriceCalculations();
        initCartQuantityControls();
        initCartPageButtons()
        initPurchaseButton();
    }
    initAddToCartButtons();
    initProductDetailQuantity();
    updateCartCounter();
});