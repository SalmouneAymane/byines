import { CartState } from '../cart.js';
import { i18n } from '../i18n.js';
import { currencyStore } from '../currencyStore.js';
import { secureFetch } from '../security.js';

export const CheckoutView = {
    state: {
        loading: false,
        submittedOrder: null,
        error: null
    },

    MOROCCAN_CITIES: [
        'Casablanca',
        'Rabat',
        'Marrakech',
        'Tangier',
        'Agadir',
        'Fes',
        'Meknes',
        'Oujda',
        'Tetouan',
        'Kenitra',
        'El Jadida',
        'Nador',
        'Safi',
        'Mohammedia',
        'Laayoune',
        'Other (Morocco)'
    ],

    async render() {
        this.state.submittedOrder = null;
        this.state.error = null;
        this.state.loading = false;

        const items = CartState.getItems();
        const subtotal = CartState.getSubtotal();

        setTimeout(() => this.attachEvents(), 0);

        if (items.length === 0) {
            return `
                <div class="max-w-4xl mx-auto px-6 py-20 text-center space-y-4 font-sans">
                    <div class="w-16 h-16 rounded-full bg-[#F9F8F6] border border-[#E5E2DC] flex items-center justify-center mx-auto text-[#7A7672]">
                        <svg class="w-8 h-8 stroke-current" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.4" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
                        </svg>
                    </div>
                    <h2 class="text-3xl font-serif text-[#2C2926]">Your Bag is Empty</h2>
                    <p class="text-xs text-[#7A7672] max-w-md mx-auto">
                        Please add products to your shopping bag before proceeding to Cash on Delivery checkout.
                    </p>
                    <div class="pt-4">
                        <a href="#shop" class="inline-block bg-[#2C2926] text-white text-xs font-semibold uppercase tracking-widest px-8 py-3.5 hover:bg-black transition-colors">
                            Explore Catalog
                        </a>
                    </div>
                </div>
            `;
        }

        const shippingCost = subtotal >= 100.00 ? 0.00 : 5.00;
        const total = subtotal + shippingCost;

        return `
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 font-sans">
                
                <!-- Header Title -->
                <div class="text-center space-y-2 border-b border-[#E5E2DC] pb-8">
                    <span class="text-[10px] uppercase tracking-[0.25em] text-[#7A7672] font-semibold block">Express Shipping</span>
                    <h1 class="text-3xl sm:text-4xl font-serif text-[#2C2926]">Moroccan Cash on Delivery</h1>
                    <p class="text-xs text-[#7A7672] max-w-xl mx-auto leading-relaxed">
                        Pay upon arrival at your doorstep. Fast 24-48h delivery across all Moroccan cities.
                    </p>
                </div>

                <!-- Main Layout (Left: Form, Right: Summary) -->
                <div class="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
                    
                    <!-- Left Form Column (Lg 7 cols) -->
                    <div class="lg:col-span-7 space-y-8">
                        
                        <!-- Form Container -->
                        <form id="checkout-form" class="space-y-6">
                            
                            <div class="space-y-4">
                                <h3 class="text-xs font-semibold uppercase tracking-wider text-[#2C2926] border-b border-[#E5E2DC] pb-2">
                                    1. Moroccan Shipping Information
                                </h3>

                                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <!-- Full Name -->
                                    <div class="space-y-1 sm:col-span-2">
                                        <label for="shipping_name" class="text-xs font-medium text-[#2C2926]">Full Name <span class="text-rose-600">*</span></label>
                                        <input 
                                            type="text" 
                                            id="shipping_name" 
                                            name="shipping_name" 
                                            required 
                                            placeholder="e.g. Aymane Salmoune" 
                                            class="w-full bg-white border border-[#E5E2DC] p-3 text-xs text-[#2C2926] focus:outline-none focus:border-[#2C2926] rounded-none"
                                        />
                                    </div>

                                    <!-- Phone Number -->
                                    <div class="space-y-1 sm:col-span-2">
                                        <label for="shipping_phone" class="text-xs font-medium text-[#2C2926]">Moroccan Phone Number <span class="text-rose-600">*</span></label>
                                        <input 
                                            type="tel" 
                                            id="shipping_phone" 
                                            name="shipping_phone" 
                                            required 
                                            placeholder="e.g. 0612345678 or 0712345678" 
                                            class="w-full bg-white border border-[#E5E2DC] p-3 text-xs text-[#2C2926] focus:outline-none focus:border-[#2C2926] rounded-none"
                                        />
                                        <p class="text-[10px] text-[#7A7672]">Our customer service team will call this number to confirm delivery before shipping.</p>
                                    </div>

                                    <!-- City Dropdown -->
                                    <div class="space-y-1">
                                        <label for="shipping_city" class="text-xs font-medium text-[#2C2926]">City (Ville) <span class="text-rose-600">*</span></label>
                                        <select 
                                            id="shipping_city" 
                                            name="shipping_city" 
                                            required 
                                            class="w-full bg-white border border-[#E5E2DC] p-3 text-xs text-[#2C2926] focus:outline-none focus:border-[#2C2926] rounded-none cursor-pointer"
                                        >
                                            <option value="" disabled selected>Select Moroccan City</option>
                                            ${this.MOROCCAN_CITIES.map(c => `<option value="${c}">${c}</option>`).join('')}
                                        </select>
                                    </div>

                                    <!-- Region/Province (Optional) -->
                                    <div class="space-y-1">
                                        <label for="shipping_region" class="text-xs font-medium text-[#2C2926]">Region / Province</label>
                                        <input 
                                            type="text" 
                                            id="shipping_region" 
                                            name="shipping_region" 
                                            placeholder="e.g. Casablanca-Settat" 
                                            class="w-full bg-white border border-[#E5E2DC] p-3 text-xs text-[#2C2926] focus:outline-none focus:border-[#2C2926] rounded-none"
                                        />
                                    </div>

                                    <!-- Address Line 1 -->
                                    <div class="space-y-1 sm:col-span-2">
                                        <label for="shipping_address_line1" class="text-xs font-medium text-[#2C2926]">Delivery Address / Quartier <span class="text-rose-600">*</span></label>
                                        <input 
                                            type="text" 
                                            id="shipping_address_line1" 
                                            name="shipping_address_line1" 
                                            required 
                                            placeholder="e.g. Bd Mohamed V, Quartier Maarif, N° 45" 
                                            class="w-full bg-white border border-[#E5E2DC] p-3 text-xs text-[#2C2926] focus:outline-none focus:border-[#2C2926] rounded-none"
                                        />
                                    </div>

                                    <!-- Address Line 2 / Instructions -->
                                    <div class="space-y-1 sm:col-span-2">
                                        <label for="shipping_address_line2" class="text-xs font-medium text-[#2C2926]">Apartment, Suite, or Delivery Note (Optional)</label>
                                        <input 
                                            type="text" 
                                            id="shipping_address_line2" 
                                            name="shipping_address_line2" 
                                            placeholder="e.g. Appt 4, Building B / Call before arrival" 
                                            class="w-full bg-white border border-[#E5E2DC] p-3 text-xs text-[#2C2926] focus:outline-none focus:border-[#2C2926] rounded-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            <!-- Payment Method Section -->
                            <div class="space-y-4 pt-4 border-t border-[#E5E2DC]">
                                <h3 class="text-xs font-semibold uppercase tracking-wider text-[#2C2926] border-b border-[#E5E2DC] pb-2">
                                    2. Payment Method
                                </h3>

                                <div class="p-4 bg-[#F9F8F6] border border-[#2C2926] flex items-center justify-between">
                                    <div class="flex items-center space-x-3">
                                        <input type="radio" checked readonly class="text-[#2C2926] focus:ring-0 cursor-default" />
                                        <div>
                                            <span class="text-xs font-semibold text-[#2C2926] block">Cash on Delivery (Paiement à la livraison)</span>
                                            <span class="text-[11px] text-[#7A7672]">Pay in cash to the delivery courier when your order arrives.</span>
                                        </div>
                                    </div>
                                    <span class="text-[10px] uppercase font-bold tracking-widest bg-[#2C2926] text-white px-2.5 py-1">
                                        COD
                                    </span>
                                </div>
                            </div>

                            <!-- Error Message Box -->
                            <div id="checkout-error-msg" class="hidden p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-sans"></div>

                            <!-- Submit Button -->
                            <div>
                                <button 
                                    type="submit" 
                                    id="btn-place-order"
                                    class="w-full h-14 bg-[#2C2926] text-white text-xs font-semibold uppercase tracking-[0.2em] hover:bg-black transition-colors shadow-sm flex items-center justify-center space-x-2"
                                >
                                    <span>CONFIRM CASH ON DELIVERY ORDER &rarr;</span>
                                </button>
                            </div>

                        </form>

                    </div>

                    <!-- Right Column: Order Summary (Lg 5 cols) -->
                    <div class="lg:col-span-5 space-y-6">
                        <div class="bg-[#F9F8F6] p-6 border border-[#E5E2DC] space-y-6 sticky top-24">
                            <h3 class="font-serif text-lg text-[#2C2926] border-b border-[#E5E2DC] pb-4">
                                Order Summary (${items.length} item${items.length === 1 ? '' : 's'})
                            </h3>

                            <!-- Items List -->
                            <div class="space-y-4 max-h-72 overflow-y-auto pr-1">
                                ${items.map(item => `
                                    <div class="flex items-center gap-3">
                                        <div class="w-14 h-16 bg-[#EFECE6] border border-[#E5E2DC] overflow-hidden shrink-0">
                                            <img src="${item.image}" onerror="this.src='https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=400&q=80';" alt="" class="w-full h-full object-cover" />
                                        </div>
                                        <div class="flex-1 min-w-0 text-xs">
                                            <h4 class="font-serif text-[#2C2926] truncate">${this.escapeHtml(item.name)}</h4>
                                            <span class="text-[11px] text-[#7A7672] block">Qty: ${item.quantity} ${item.color !== 'Default' ? '| ' + item.color : ''} ${item.size ? '| Size: ' + item.size : ''}</span>
                                            <span class="text-xs font-semibold text-[#2C2926] block">${currencyStore.formatPrice(item.price * item.quantity)}</span>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>

                            <!-- Cost Breakdown -->
                            <div class="space-y-2 text-xs border-t border-[#E5E2DC] pt-4 font-sans">
                                <div class="flex justify-between text-[#7A7672]">
                                    <span>Subtotal</span>
                                    <span class="font-medium text-[#2C2926]">${currencyStore.formatPrice(subtotal)}</span>
                                </div>
                                <div class="flex justify-between text-[#7A7672]">
                                    <span>Moroccan Shipping</span>
                                    <span class="font-medium text-[#2C2926]">${shippingCost === 0 ? '<strong class="text-emerald-700 font-semibold">FREE</strong>' : currencyStore.formatPrice(shippingCost)}</span>
                                </div>
                                <div class="flex justify-between text-base font-serif text-[#2C2926] border-t border-[#E5E2DC] pt-3 font-normal">
                                    <span>Total Amount</span>
                                    <span class="font-semibold">${currencyStore.formatPrice(total)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

            </div>
        `;
    },

    attachEvents() {
        const form = document.getElementById('checkout-form');
        const errorBox = document.getElementById('checkout-error-msg');
        const btnSubmit = document.getElementById('btn-place-order');

        if (form) {
            form.onsubmit = async (e) => {
                e.preventDefault();
                errorBox.classList.add('hidden');
                errorBox.textContent = '';

                const items = CartState.getItems();
                if (items.length === 0) {
                    errorBox.textContent = 'Your shopping bag is empty.';
                    errorBox.classList.remove('hidden');
                    return;
                }

                const formData = new FormData(form);
                const payload = {
                    shipping_name: formData.get('shipping_name'),
                    shipping_phone: formData.get('shipping_phone'),
                    shipping_address_line1: formData.get('shipping_address_line1'),
                    shipping_address_line2: formData.get('shipping_address_line2'),
                    shipping_city: formData.get('shipping_city'),
                    shipping_region: formData.get('shipping_region'),
                    items: items
                };

                btnSubmit.disabled = true;
                btnSubmit.innerHTML = `
                    <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Processing Order...</span>
                `;

                try {
                    const res = await secureFetch('/api/storefront/checkout.php', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });

                    const result = await res.json();

                    if (result.success) {
                        CartState.clearCart();
                        this.renderSuccessConfirmation(result.data);
                    } else {
                        errorBox.textContent = result.message || 'Failed to place order. Please try again.';
                        errorBox.classList.remove('hidden');
                    }
                } catch (err) {
                    console.error('Checkout failed', err);
                    errorBox.textContent = 'A network error occurred. Please check your connection and try again.';
                    errorBox.classList.remove('hidden');
                } finally {
                    btnSubmit.disabled = false;
                    btnSubmit.innerHTML = `<span>CONFIRM CASH ON DELIVERY ORDER &rarr;</span>`;
                }
            };
        }
    },

    renderSuccessConfirmation(orderData) {
        const app = document.getElementById('app');
        if (!app) return;

        window.scrollTo({ top: 0, behavior: 'smooth' });

        app.innerHTML = `
            <div class="max-w-3xl mx-auto px-6 py-20 text-center space-y-8 font-sans">
                <!-- Success Badge -->
                <div class="w-20 h-20 rounded-full bg-emerald-50 border-2 border-emerald-600 flex items-center justify-center mx-auto text-emerald-600 shadow-sm">
                    <svg class="w-10 h-10 stroke-current" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                    </svg>
                </div>

                <div class="space-y-3">
                    <span class="text-[10px] uppercase tracking-[0.25em] text-emerald-700 font-bold block">Order Confirmed</span>
                    <h1 class="text-3xl sm:text-4xl font-serif text-[#2C2926]">Thank You for Your Order!</h1>
                    <p class="text-sm text-[#7A7672] max-w-md mx-auto leading-relaxed">
                        Your Cash on Delivery order has been successfully registered in our system.
                    </p>
                </div>

                <!-- Order Details Card -->
                <div class="bg-[#F9F8F6] p-8 border border-[#E5E2DC] max-w-lg mx-auto text-left space-y-4">
                    <div class="flex justify-between items-center border-b border-[#E5E2DC] pb-4">
                        <span class="text-xs text-[#7A7672] font-medium uppercase tracking-wider">Order Number</span>
                        <span class="font-serif font-bold text-base text-[#2C2926]">${this.escapeHtml(orderData.order_number)}</span>
                    </div>

                    <div class="flex justify-between items-center border-b border-[#E5E2DC] pb-4">
                        <span class="text-xs text-[#7A7672] font-medium uppercase tracking-wider">Payment Method</span>
                        <span class="text-xs font-semibold text-[#2C2926]">Cash on Delivery (COD)</span>
                    </div>

                    <div class="flex justify-between items-center">
                        <span class="text-xs text-[#7A7672] font-medium uppercase tracking-wider">Total Payable Amount</span>
                        <span class="font-serif font-bold text-lg text-[#2C2926]">${currencyStore.formatPrice(orderData.total_amount)}</span>
                    </div>
                </div>

                <!-- Notice -->
                <div class="p-4 bg-amber-50 border border-amber-200 text-amber-900 text-xs max-w-lg mx-auto text-center leading-relaxed">
                    📞 <strong>Next Step:</strong> Our customer support representative will call your phone number shortly to verify delivery details before shipping. Delivery takes 24 to 48 hours.
                </div>

                <div class="pt-4">
                    <a href="#shop" class="inline-block bg-[#2C2926] text-white text-xs font-semibold uppercase tracking-[0.18em] px-10 py-4 hover:bg-black transition-colors">
                        Continue Shopping
                    </a>
                </div>
            </div>
        `;
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

window.CheckoutView = CheckoutView;
