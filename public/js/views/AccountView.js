import { AuthState } from '../components/AuthModal.js';

export const AccountView = {
    state: {
        user: null,
        orders: [],
        activeTab: 'orders', // 'orders', 'profile', 'address'
        loading: true,
        error: null,
        profileSuccess: null,
        profileError: null
    },

    async render() {
        this.state.loading = true;
        this.state.error = null;

        try {
            const res = await fetch('/api/storefront/account.php');
            const result = await res.json();

            if (result.success && result.data) {
                this.state.user = result.data.user;
                this.state.orders = result.data.orders || [];
            } else {
                this.state.error = result.message || 'Please sign in to view your account.';
            }
        } catch (e) {
            console.error('Failed to load account data', e);
            this.state.error = 'Failed to load account information.';
        } finally {
            this.state.loading = false;
        }

        setTimeout(() => this.attachEvents(), 0);

        if (this.state.loading) {
            return `
                <div class="max-w-6xl mx-auto px-6 py-20 flex justify-center items-center">
                    <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-[#2C2926]"></div>
                </div>
            `;
        }

        if (this.state.error || !this.state.user) {
            return `
                <div class="max-w-4xl mx-auto px-6 py-20 text-center space-y-4 font-sans">
                    <div class="w-16 h-16 rounded-full bg-[#F9F8F6] border border-[#E5E2DC] flex items-center justify-center mx-auto text-[#7A7672]">
                        <svg class="w-8 h-8 stroke-current" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.4" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                        </svg>
                    </div>
                    <h2 class="text-3xl font-serif text-[#2C2926]">Sign In Required</h2>
                    <p class="text-xs text-[#7A7672] max-w-sm mx-auto">
                        Please sign in or create an account to view your past orders and profile details.
                    </p>
                    <div class="pt-4">
                        <button data-open-auth class="inline-block bg-[#2C2926] text-white text-xs font-semibold uppercase tracking-widest px-8 py-3.5 hover:bg-black transition-colors">
                            Sign In / Register
                        </button>
                    </div>
                </div>
            `;
        }

        const u = this.state.user;
        const isAdmin = u.role === 'admin';

        return `
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 font-sans">
                
                <!-- Account Header Card -->
                <div class="bg-[#F9F8F6] border border-[#E5E2DC] p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div class="flex items-center space-x-4">
                        <!-- User Avatar Badge -->
                        <div class="w-14 h-14 bg-[#2C2926] text-white font-serif font-bold text-xl flex items-center justify-center rounded-none border border-black shrink-0">
                            ${this.escapeHtml(u.first_name.charAt(0))}${this.escapeHtml(u.last_name.charAt(0))}
                        </div>
                        <div class="space-y-1">
                            <div class="flex items-center gap-2">
                                <h1 class="text-2xl font-serif text-[#2C2926] font-normal">
                                    Welcome, ${this.escapeHtml(u.first_name)} ${this.escapeHtml(u.last_name)}
                                </h1>
                                ${isAdmin ? `
                                    <span class="bg-[#2C2926] text-white text-[9px] uppercase font-bold tracking-widest px-2 py-0.5">
                                        ADMIN
                                    </span>
                                ` : ''}
                            </div>
                            <p class="text-xs text-[#7A7672]">
                                ${this.escapeHtml(u.email)} ${u.phone ? `• ${this.escapeHtml(u.phone)}` : ''}
                            </p>
                        </div>
                    </div>

                    <!-- Action Buttons: Sign Out & Admin Portal -->
                    <div class="flex items-center gap-3 w-full md:w-auto">
                        ${isAdmin ? `
                            <a href="/public/admin/index.html" class="flex-1 md:flex-none border border-[#2C2926] text-[#2C2926] text-xs font-semibold uppercase tracking-wider px-5 py-3 text-center hover:bg-[#2C2926] hover:text-white transition-colors">
                                Admin Dashboard
                            </a>
                        ` : ''}
                        
                        <button 
                            id="btn-account-signout" 
                            class="flex-1 md:flex-none bg-[#2C2926] text-white text-xs font-semibold uppercase tracking-wider px-6 py-3 hover:bg-black transition-colors"
                        >
                            Sign Out
                        </button>
                    </div>
                </div>

                <!-- Main Section Tabs -->
                <div class="space-y-6">
                    <div class="flex border-b border-[#E5E2DC] text-xs font-semibold uppercase tracking-wider">
                        <button 
                            id="tab-orders" 
                            class="py-3 px-6 border-b-2 transition-colors ${this.state.activeTab === 'orders' ? 'border-[#2C2926] text-[#2C2926]' : 'border-transparent text-[#7A7672] hover:text-[#2C2926]'}"
                        >
                            Order History (${this.state.orders.length})
                        </button>
                        <button 
                            id="tab-profile" 
                            class="py-3 px-6 border-b-2 transition-colors ${this.state.activeTab === 'profile' ? 'border-[#2C2926] text-[#2C2926]' : 'border-transparent text-[#7A7672] hover:text-[#2C2926]'}"
                        >
                            Profile Settings
                        </button>
                    </div>

                    <!-- Dynamic Tab Content -->
                    <div id="account-tab-content">
                        ${this.state.activeTab === 'orders' ? this.renderOrdersTab() : this.renderProfileTab()}
                    </div>
                </div>

            </div>
        `;
    },

    renderOrdersTab() {
        const orders = this.state.orders || [];

        if (orders.length === 0) {
            return `
                <div class="text-center py-16 bg-[#F9F8F6] border border-[#E5E2DC] space-y-4">
                    <svg class="w-12 h-12 text-[#7A7672] mx-auto stroke-current" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
                    </svg>
                    <h3 class="font-serif text-lg text-[#2C2926]">No Orders Placed Yet</h3>
                    <p class="text-xs text-[#7A7672] max-w-sm mx-auto">
                        When you make purchases via Cash on Delivery, your orders will appear here.
                    </p>
                    <div>
                        <a href="#shop" class="inline-block bg-[#2C2926] text-white text-xs font-semibold uppercase tracking-widest px-6 py-2.5 hover:bg-black transition-colors">
                            Explore Catalog
                        </a>
                    </div>
                </div>
            `;
        }

        return `
            <div class="space-y-6">
                ${orders.map(o => {
                    const statusColors = {
                        pending: 'bg-amber-100 text-amber-900 border-amber-300',
                        processing: 'bg-blue-100 text-blue-900 border-blue-300',
                        in_transit: 'bg-purple-100 text-purple-900 border-purple-300',
                        delivered: 'bg-emerald-100 text-emerald-900 border-emerald-300',
                        cancelled: 'bg-rose-100 text-rose-900 border-rose-300'
                    };

                    const statusClass = statusColors[o.status] || 'bg-stone-100 text-stone-800 border-stone-300';
                    const items = o.items || [];

                    return `
                        <div class="bg-white border border-[#E5E2DC] p-6 space-y-4">
                            <!-- Order Top Header -->
                            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5E2DC] pb-4">
                                <div class="space-y-1">
                                    <div class="flex items-center gap-3">
                                        <span class="font-serif font-bold text-base text-[#2C2926]">${this.escapeHtml(o.order_number)}</span>
                                        <span class="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 border ${statusClass}">
                                            ${this.escapeHtml(o.status.replace('_', ' '))}
                                        </span>
                                    </div>
                                    <span class="text-xs text-[#7A7672]">
                                        Placed on ${new Date(o.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                                    </span>
                                </div>

                                <div class="text-left sm:text-right">
                                    <span class="text-[11px] text-[#7A7672] uppercase tracking-wider block">Total Amount</span>
                                    <span class="font-serif text-lg font-semibold text-[#2C2926]">$${parseFloat(o.total_amount).toFixed(2)}</span>
                                </div>
                            </div>

                            <!-- Order Items Cards -->
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                ${items.map(item => `
                                    <div class="flex items-center gap-3 bg-[#F9F8F6] p-3 border border-[#E5E2DC]">
                                        <div class="w-12 h-14 bg-[#EFECE6] border border-[#E5E2DC] overflow-hidden shrink-0">
                                            <img src="${item.main_image ? (item.main_image.startsWith('prod_') ? `/public/uploads/products/${item.main_image}` : `/assets/products/${item.main_image}`) : 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=400&q=80'}" alt="" class="w-full h-full object-cover" />
                                        </div>
                                        <div class="min-w-0 flex-1 text-xs">
                                            <h5 class="font-serif text-[#2C2926] truncate">${this.escapeHtml(item.product_name)}</h5>
                                            <span class="text-[11px] text-[#7A7672] block">Qty: ${item.quantity} ${item.color !== 'Default' ? '| ' + item.color : ''} ${item.size ? '| Size: ' + item.size : ''}</span>
                                            <span class="font-semibold text-[#2C2926] block mt-0.5">$${parseFloat(item.price).toFixed(2)}</span>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>

                            <!-- Shipping Details Footer -->
                            <div class="pt-2 text-xs text-[#7A7672] flex flex-wrap justify-between items-center border-t border-[#E5E2DC]/60 gap-2">
                                <div>
                                    🚚 <strong>Delivery Address:</strong> ${this.escapeHtml(o.shipping_name)}, ${this.escapeHtml(o.shipping_address_line1)}, ${this.escapeHtml(o.shipping_city)} (${this.escapeHtml(o.shipping_phone)})
                                </div>
                                <span class="text-[11px] font-semibold text-[#2C2926]">Payment: Cash on Delivery</span>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    },

    renderProfileTab() {
        const u = this.state.user;

        return `
            <div class="max-w-xl bg-white border border-[#E5E2DC] p-6 sm:p-8 space-y-6">
                <h3 class="font-serif text-lg text-[#2C2926] border-b border-[#E5E2DC] pb-3 font-normal">
                    Edit Profile Details
                </h3>

                ${this.state.profileSuccess ? `
                    <div class="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">${this.escapeHtml(this.state.profileSuccess)}</div>
                ` : ''}

                ${this.state.profileError ? `
                    <div class="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs">${this.escapeHtml(this.state.profileError)}</div>
                ` : ''}

                <form id="profile-form" class="space-y-4">
                    <div class="grid grid-cols-2 gap-4">
                        <div class="space-y-1">
                            <label class="text-xs font-medium text-[#2C2926]">First Name</label>
                            <input 
                                type="text" 
                                name="first_name" 
                                value="${this.escapeHtml(u.first_name)}" 
                                required 
                                class="w-full bg-white border border-[#E5E2DC] p-2.5 text-xs text-[#2C2926] focus:outline-none focus:border-[#2C2926] rounded-none"
                            />
                        </div>
                        <div class="space-y-1">
                            <label class="text-xs font-medium text-[#2C2926]">Last Name</label>
                            <input 
                                type="text" 
                                name="last_name" 
                                value="${this.escapeHtml(u.last_name)}" 
                                required 
                                class="w-full bg-white border border-[#E5E2DC] p-2.5 text-xs text-[#2C2926] focus:outline-none focus:border-[#2C2926] rounded-none"
                            />
                        </div>
                    </div>

                    <div class="space-y-1">
                        <label class="text-xs font-medium text-[#2C2926]">Email Address (Read-only)</label>
                        <input 
                            type="email" 
                            value="${this.escapeHtml(u.email)}" 
                            disabled 
                            class="w-full bg-[#F9F8F6] border border-[#E5E2DC] p-2.5 text-xs text-[#7A7672] cursor-not-allowed rounded-none"
                        />
                    </div>

                    <div class="space-y-1">
                        <label class="text-xs font-medium text-[#2C2926]">Moroccan Phone Number</label>
                        <input 
                            type="tel" 
                            name="phone" 
                            value="${this.escapeHtml(u.phone || '')}" 
                            placeholder="06XXXXXXXX" 
                            class="w-full bg-white border border-[#E5E2DC] p-2.5 text-xs text-[#2C2926] focus:outline-none focus:border-[#2C2926] rounded-none"
                        />
                    </div>

                    <div class="pt-2">
                        <button type="submit" id="btn-save-profile" class="bg-[#2C2926] text-white text-xs font-semibold uppercase tracking-wider px-8 py-3 hover:bg-black transition-colors">
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        `;
    },

    attachEvents() {
        // Sign out button event
        const btnSignout = document.getElementById('btn-account-signout');
        if (btnSignout) {
            btnSignout.onclick = async () => {
                await AuthState.logout();
                window.location.hash = '#home';
            };
        }

        // Tab switching
        const tabOrders = document.getElementById('tab-orders');
        const tabProfile = document.getElementById('tab-profile');

        if (tabOrders) {
            tabOrders.onclick = () => {
                this.state.activeTab = 'orders';
                this.reRender();
            };
        }

        if (tabProfile) {
            tabProfile.onclick = () => {
                this.state.activeTab = 'profile';
                this.reRender();
            };
        }

        // Profile form submission
        const profileForm = document.getElementById('profile-form');
        if (profileForm) {
            profileForm.onsubmit = async (e) => {
                e.preventDefault();
                this.state.profileSuccess = null;
                this.state.profileError = null;

                const formData = new FormData(profileForm);
                const payload = {
                    first_name: formData.get('first_name'),
                    last_name:  formData.get('last_name'),
                    phone:      formData.get('phone')
                };

                try {
                    const res = await fetch('/api/storefront/account.php?action=update_profile', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });

                    const result = await res.json();
                    if (result.success) {
                        this.state.user = result.data;
                        this.state.profileSuccess = 'Profile updated successfully.';
                        AuthState.currentUser = result.data;
                        window.dispatchEvent(new CustomEvent('user-auth-changed', { detail: { user: result.data } }));
                    } else {
                        this.state.profileError = result.message || 'Failed to update profile.';
                    }
                } catch (err) {
                    console.error('Failed to update profile', err);
                    this.state.profileError = 'A network error occurred. Please try again.';
                }

                this.reRender();
            };
        }
    },

    async reRender() {
        const app = document.getElementById('app');
        if (app) {
            app.innerHTML = await this.render();
        }
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

window.AccountView = AccountView;
