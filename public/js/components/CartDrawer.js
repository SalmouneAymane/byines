import { CartState } from '../cart.js';
import { i18n } from '../i18n.js';
import { currencyStore } from '../currencyStore.js';

export const CartDrawer = {
    isOpen: false,
    FREE_SHIPPING_THRESHOLD: 100.00, // $100 for free shipping

    init() {
        this.injectDrawerContainer();
        this.attachGlobalListeners();
        this.renderContent();
    },

    injectDrawerContainer() {
        if (document.getElementById('cart-drawer-root')) return;

        const drawerHtml = `
            <div id="cart-drawer-root" class="relative z-50">
                <!-- Backdrop Overlay -->
                <div 
                    id="cart-drawer-backdrop" 
                    class="fixed inset-0 bg-black/50 backdrop-blur-sm opacity-0 pointer-events-none transition-opacity duration-300"
                ></div>

                <!-- Slide-Over Side Panel -->
                <aside 
                    id="cart-drawer-panel" 
                    class="fixed top-0 right-0 bottom-0 w-full max-w-md bg-white shadow-2xl transform translate-x-full transition-transform duration-300 ease-out flex flex-col justify-between overflow-hidden border-l border-[#E5E2DC]"
                >
                    <!-- Content rendered dynamically -->
                    <div id="cart-drawer-inner" class="flex flex-col h-full justify-between"></div>
                </aside>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', drawerHtml);
    },

    attachGlobalListeners() {
        // Toggle cart open from header button
        document.addEventListener('click', (e) => {
            const btn = e.target.closest('#btn-open-cart');
            if (btn) {
                e.preventDefault();
                this.open();
            }
        });

        // Backdrop click closes drawer
        const backdrop = document.getElementById('cart-drawer-backdrop');
        if (backdrop) {
            backdrop.onclick = () => this.close();
        }

        // Listen for CartState updates
        window.addEventListener('cart-updated', () => {
            this.renderContent();
        });

        // Automatically open drawer when an item is added
        window.addEventListener('cart-item-added', () => {
            this.open();
        });
    },

    open() {
        this.isOpen = true;
        const backdrop = document.getElementById('cart-drawer-backdrop');
        const panel = document.getElementById('cart-drawer-panel');

        if (backdrop && panel) {
            backdrop.classList.remove('opacity-0', 'pointer-events-none');
            backdrop.classList.add('opacity-100');
            panel.classList.remove('translate-x-full');
            panel.classList.add('translate-x-0');
        }
    },

    close() {
        this.isOpen = false;
        const backdrop = document.getElementById('cart-drawer-backdrop');
        const panel = document.getElementById('cart-drawer-panel');

        if (backdrop && panel) {
            backdrop.classList.remove('opacity-100');
            backdrop.classList.add('opacity-0', 'pointer-events-none');
            panel.classList.remove('translate-x-0');
            panel.classList.add('translate-x-full');
        }
    },

    renderContent() {
        const container = document.getElementById('cart-drawer-inner');
        if (!container) return;

        const items = CartState.getItems();
        const totalCount = CartState.getTotalCount();
        const subtotal = CartState.getSubtotal();
        const amountAway = Math.max(0, this.FREE_SHIPPING_THRESHOLD - subtotal);
        const progressPct = Math.min(100, (subtotal / this.FREE_SHIPPING_THRESHOLD) * 100);

        container.innerHTML = `
            <!-- 1. Drawer Header -->
            <div class="p-6 border-b border-[#E5E2DC] space-y-4 bg-white">
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-3">
                        <h2 class="font-serif text-xl font-normal text-[#2C2926]">${i18n.t('cart.title')}</h2>
                        <span class="bg-[#EFECE6] text-[#2C2926] text-[10px] font-bold px-2 py-0.5 border border-[#E5E2DC]">
                            ${i18n.t('cart.items_count', { count: totalCount })}
                        </span>
                    </div>
                    <button id="close-cart-drawer" aria-label="Close cart" class="text-[#7A7672] hover:text-[#2C2926] p-1">
                        <svg class="w-6 h-6 stroke-current" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                    </button>
                </div>

                <!-- Moroccan Free Shipping Progress Bar -->
                <div class="space-y-1.5 pt-1">
                    <div class="text-[11px] font-sans text-[#7A7672] flex justify-between">
                        ${amountAway > 0 
                            ? `<span>${i18n.t('cart.free_shipping_needed', { amount: currencyStore.formatPrice(amountAway) })}</span>` 
                            : `<span class="text-emerald-700 font-semibold">${i18n.t('cart.free_shipping_unlocked')}</span>`
                        }
                        <span>${currencyStore.formatPrice(subtotal)} / ${currencyStore.formatPrice(this.FREE_SHIPPING_THRESHOLD)}</span>
                    </div>
                    <div class="w-full bg-[#EFECE6] h-1.5 overflow-hidden">
                        <div class="bg-[#2C2926] h-full transition-all duration-500 ease-out" style="width: ${progressPct}%"></div>
                    </div>
                </div>
            </div>

            <!-- 2. Scrollable Items List or Empty State -->
            <div class="flex-1 overflow-y-auto p-6 space-y-6">
                ${items.length === 0 ? `
                    <div class="text-center py-16 space-y-4">
                        <div class="w-16 h-16 rounded-full bg-[#F9F8F6] border border-[#E5E2DC] flex items-center justify-center mx-auto text-[#7A7672]">
                            <svg class="w-8 h-8 stroke-current" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.4" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
                            </svg>
                        </div>
                        <h3 class="font-serif text-lg text-[#2C2926]">${i18n.t('cart.empty_title')}</h3>
                        <p class="text-xs text-[#7A7672] max-w-xs mx-auto">
                            ${i18n.t('cart.empty_desc')}
                        </p>
                        <div class="pt-2">
                            <button id="cart-start-shopping" class="bg-[#2C2926] text-white text-xs font-semibold uppercase tracking-widest px-8 py-3.5 hover:bg-black transition-colors">
                                ${i18n.t('cart.explore_catalog')}
                            </button>
                        </div>
                    </div>
                ` : `
                    <div class="space-y-6">
                        ${items.map(item => `
                            <div class="flex items-start gap-4 pb-6 border-b border-[#E5E2DC] last:border-b-0">
                                <!-- Image -->
                                <div class="w-20 h-24 bg-[#EFECE6] border border-[#E5E2DC] overflow-hidden shrink-0">
                                    <img 
                                        src="${item.image}" 
                                        onerror="this.src='https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=400&q=80';" 
                                        alt="${this.escapeHtml(item.name)}" 
                                        class="w-full h-full object-cover" 
                                    />
                                </div>

                                <!-- Item Details -->
                                <div class="flex-1 space-y-1">
                                    <div class="flex items-start justify-between gap-2">
                                        <h4 class="font-serif text-sm text-[#2C2926] leading-snug font-normal">${this.escapeHtml(item.name)}</h4>
                                        <button 
                                            data-cart-remove="${item.variantId}" 
                                            aria-label="Remove item" 
                                            class="text-[#7A7672] hover:text-rose-600 transition-colors p-0.5"
                                        >
                                            <svg class="w-4 h-4 stroke-current" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.6" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                                        </button>
                                    </div>

                                    <!-- Attributes -->
                                    <div class="text-[11px] text-[#7A7672] flex items-center gap-2">
                                        ${item.color !== 'Default' ? `<span>Color: ${this.escapeHtml(item.color)}</span>` : ''}
                                        ${item.size ? `<span>Size: ${this.escapeHtml(item.size)}</span>` : ''}
                                    </div>

                                    <!-- Price & Quantity Control -->
                                    <div class="flex items-center justify-between pt-2">
                                        <div class="flex items-center border border-[#E5E2DC] bg-white h-7">
                                            <button 
                                                data-cart-qty-minus="${item.variantId}" 
                                                class="w-7 h-full flex items-center justify-center text-xs text-[#7A7672] hover:bg-stone-100 font-bold"
                                            >-</button>
                                            <span class="w-8 text-center text-xs font-semibold text-[#2C2926]">${item.quantity}</span>
                                            <button 
                                                data-cart-qty-plus="${item.variantId}" 
                                                class="w-7 h-full flex items-center justify-center text-xs text-[#7A7672] hover:bg-stone-100 font-bold"
                                            >+</button>
                                        </div>
                                        <span class="text-xs font-semibold text-[#2C2926] font-sans">
                                            ${currencyStore.formatPrice(item.price * item.quantity)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `}
            </div>

            <!-- 3. Drawer Footer Summary -->
            ${items.length > 0 ? `
                <div class="p-6 border-t border-[#E5E2DC] bg-white space-y-4">
                    <div class="space-y-1">
                        <div class="flex items-center justify-between text-sm">
                            <span class="font-serif text-[#2C2926]">${i18n.t('cart.subtotal')}</span>
                            <span class="font-serif font-medium text-lg text-[#2C2926]">${currencyStore.formatPrice(subtotal)}</span>
                        </div>
                        <p class="text-[11px] text-[#7A7672]">
                            ${i18n.t('cart.tax_shipping_note')}
                        </p>
                    </div>

                    <a 
                        href="#checkout" 
                        id="btn-cart-checkout" 
                        class="w-full h-12 bg-[#2C2926] text-white text-xs font-semibold uppercase tracking-[0.18em] flex items-center justify-center hover:bg-black transition-colors shadow-sm"
                    >
                        ${i18n.t('cart.proceed_checkout')}
                    </a>

                    <button id="cart-continue-shopping" class="w-full text-center text-xs text-[#7A7672] hover:text-[#2C2926] underline font-sans">
                        ${i18n.t('cart.continue_shopping')}
                    </button>
                </div>
            ` : ''}
        `;

        this.attachContentEvents();
    },

    attachContentEvents() {
        // Close drawer button
        const closeBtn = document.getElementById('close-cart-drawer');
        if (closeBtn) closeBtn.onclick = () => this.close();

        const continueBtn = document.getElementById('cart-continue-shopping');
        if (continueBtn) continueBtn.onclick = () => this.close();

        const startShoppingBtn = document.getElementById('cart-start-shopping');
        if (startShoppingBtn) {
            startShoppingBtn.onclick = () => {
                this.close();
                window.location.hash = '#shop';
            };
        }

        const checkoutBtn = document.getElementById('btn-cart-checkout');
        if (checkoutBtn) {
            checkoutBtn.onclick = () => this.close();
        }

        // Quantity minus
        document.querySelectorAll('[data-cart-qty-minus]').forEach(btn => {
            btn.onclick = () => {
                const variantId = btn.getAttribute('data-cart-qty-minus');
                const items = CartState.getItems();
                const target = items.find(i => String(i.variantId) === String(variantId));
                if (target) {
                    CartState.updateQuantity(variantId, target.quantity - 1);
                }
            };
        });

        // Quantity plus
        document.querySelectorAll('[data-cart-qty-plus]').forEach(btn => {
            btn.onclick = () => {
                const variantId = btn.getAttribute('data-cart-qty-plus');
                const items = CartState.getItems();
                const target = items.find(i => String(i.variantId) === String(variantId));
                if (target) {
                    CartState.updateQuantity(variantId, target.quantity + 1);
                }
            };
        });

        // Remove item
        document.querySelectorAll('[data-cart-remove]').forEach(btn => {
            btn.onclick = () => {
                const variantId = btn.getAttribute('data-cart-remove');
                CartState.removeItem(variantId);
            };
        });
    },

    escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
};
