/**
 * ByInes Storefront — Client Cart State Manager
 * Persists in localStorage and emits 'cart-updated' events.
 */
export const CartState = {
    STORAGE_KEY: 'byines_cart_items',

    getItems() {
        try {
            const raw = localStorage.getItem(this.STORAGE_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch (e) {
            console.error('Failed to parse cart state', e);
            return [];
        }
    },

    saveItems(items) {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(items));
            window.dispatchEvent(new CustomEvent('cart-updated', { detail: { items } }));
        } catch (e) {
            console.error('Failed to save cart state', e);
        }
    },

    addItem(product, variant = null, quantity = 1) {
        const items = this.getItems();
        const variantId = variant ? variant.id : (product.id + '_default');
        const color = variant ? variant.color : 'Default';
        const size = variant ? variant.size : 'M';
        const price = parseFloat(product.price) + (variant ? parseFloat(variant.price_modifier || 0) : 0);
        const image = product.main_image 
            ? (product.main_image.startsWith('prod_') ? `/public/uploads/products/${product.main_image}` : `/assets/products/${product.main_image}`)
            : (product.image_url ? `/public/uploads/categories/${product.image_url}` : '');

        const existingIndex = items.findIndex(item => String(item.variantId) === String(variantId));

        if (existingIndex > -1) {
            items[existingIndex].quantity += quantity;
        } else {
            items.push({
                productId: product.id,
                variantId: variantId,
                name: product.name,
                sku: product.sku || '',
                color: color,
                size: size,
                price: price,
                image: image,
                quantity: quantity
            });
        }

        this.saveItems(items);
        window.dispatchEvent(new CustomEvent('cart-item-added', { detail: { product, variant, quantity } }));
    },

    updateQuantity(variantId, quantity) {
        let items = this.getItems();
        if (quantity <= 0) {
            items = items.filter(item => String(item.variantId) !== String(variantId));
        } else {
            const target = items.find(item => String(item.variantId) === String(variantId));
            if (target) {
                target.quantity = quantity;
            }
        }
        this.saveItems(items);
    },

    removeItem(variantId) {
        const items = this.getItems().filter(item => String(item.variantId) !== String(variantId));
        this.saveItems(items);
    },

    clearCart() {
        this.saveItems([]);
    },

    getTotalCount() {
        return this.getItems().reduce((sum, item) => sum + item.quantity, 0);
    },

    getSubtotal() {
        return this.getItems().reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }
};
