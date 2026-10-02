export const OrdersView = {

    state: {
        orders: [],
        loading: true,
        error: null,
        filterStatus: 'all',
        searchQuery: '',
        selectedOrder: null,
        updating: false,
    },

    statusConfig: {
        pending:    { label: 'Pending',    bg: 'bg-amber-50',    text: 'text-amber-700',  border: 'border-amber-200' },
        confirmed:  { label: 'Confirmed',  bg: 'bg-blue-50',     text: 'text-blue-700',   border: 'border-blue-200'  },
        processing: { label: 'Processing', bg: 'bg-indigo-50',   text: 'text-indigo-700', border: 'border-indigo-200'},
        shipped:    { label: 'Shipped',    bg: 'bg-purple-50',   text: 'text-purple-700', border: 'border-purple-200'},
        delivered:  { label: 'Delivered',  bg: 'bg-emerald-50',  text: 'text-emerald-700',border: 'border-emerald-200'},
        cancelled:  { label: 'Cancelled',  bg: 'bg-rose-50',     text: 'text-rose-700',   border: 'border-rose-200'  },
    },

    async render() {
        this.state.loading = true;
        this.state.error   = null;

        try {
            const res    = await fetch('/api/admin/orders.php');
            const result = await res.json();

            if (result.success) {
                this.state.orders = result.data || [];
            } else {
                this.state.error = result.message || 'Failed to load orders.';
            }
        } catch (e) {
            console.error('Failed to fetch orders', e);
            this.state.error = 'Network error. Please check your connection.';
        } finally {
            this.state.loading = false;
        }

        setTimeout(() => this.attachEvents(), 0);
        return this.renderLayout();
    },

    renderLayout() {
        if (this.state.loading) {
            return `
                <div class="flex items-center justify-center min-h-[400px]">
                    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-900"></div>
                </div>
            `;
        }

        if (this.state.error) {
            return `
                <div class="bg-rose-50 border border-rose-200 text-rose-700 p-6 rounded-none text-sm">
                    ${this.state.error}
                </div>
            `;
        }

        const stats = this.computeStats();

        return `
            <div class="space-y-8 font-sans" id="orders-view-root">

                <!-- Page Title -->
                <div class="flex items-end justify-between border-b border-line pb-5">
                    <div>
                        <span class="text-[10px] uppercase tracking-[0.2em] text-muted font-semibold block mb-1">Store Management</span>
                        <h1 class="text-2xl font-serif font-normal text-obsidian">Customer Orders</h1>
                    </div>
                    <div class="text-[11px] text-muted font-medium">
                        ${stats.total} orders total &mdash; ${new Date().toLocaleDateString('en-GB', { day:'numeric', month:'long', year:'numeric'})}
                    </div>
                </div>

                <!-- KPI Stats Row -->
                <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    ${this.renderStatCard('All Orders', stats.total, '', 'all')}
                    ${this.renderStatCard('Pending', stats.pending, 'text-amber-600', 'pending')}
                    ${this.renderStatCard('Confirmed', stats.confirmed, 'text-blue-600', 'confirmed')}
                    ${this.renderStatCard('Shipped', stats.shipped, 'text-purple-600', 'shipped')}
                    ${this.renderStatCard('Delivered', stats.delivered, 'text-emerald-600', 'delivered')}
                    ${this.renderStatCard('Cancelled', stats.cancelled, 'text-rose-600', 'cancelled')}
                </div>

                <!-- Revenue Banner -->
                <div class="bg-obsidian text-white p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <span class="text-[10px] uppercase tracking-[0.2em] text-stone-400 font-semibold block">Total Revenue (All Delivered)</span>
                        <span class="text-3xl font-serif font-normal mt-1 block">${this.formatCurrency(stats.revenue)} MAD</span>
                    </div>
                    <div class="text-right">
                        <span class="text-[10px] uppercase tracking-[0.2em] text-stone-400 font-semibold block">Avg. Order Value</span>
                        <span class="text-xl font-serif font-normal mt-1 block">${this.formatCurrency(stats.avgOrder)} MAD</span>
                    </div>
                </div>

                <!-- Search & Filter Bar -->
                <div class="bg-white border border-line p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <div class="relative flex-1">
                        <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted stroke-current" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                        </svg>
                        <input 
                            id="order-search-input"
                            type="text" 
                            placeholder="Search by order number, customer name, or phone..." 
                            value="${this.escapeHtml(this.state.searchQuery)}"
                            class="w-full pl-9 pr-4 py-2.5 bg-[#F9F9F9] border border-line text-xs text-obsidian focus:outline-none focus:border-obsidian rounded-none"
                        />
                    </div>
                    <select 
                        id="order-status-filter"
                        class="bg-[#F9F9F9] border border-line text-xs text-obsidian px-4 py-2.5 focus:outline-none focus:border-obsidian rounded-none min-w-[160px]"
                    >
                        <option value="all" ${this.state.filterStatus === 'all' ? 'selected' : ''}>All Statuses</option>
                        <option value="pending" ${this.state.filterStatus === 'pending' ? 'selected' : ''}>Pending</option>
                        <option value="confirmed" ${this.state.filterStatus === 'confirmed' ? 'selected' : ''}>Confirmed</option>
                        <option value="processing" ${this.state.filterStatus === 'processing' ? 'selected' : ''}>Processing</option>
                        <option value="shipped" ${this.state.filterStatus === 'shipped' ? 'selected' : ''}>Shipped</option>
                        <option value="delivered" ${this.state.filterStatus === 'delivered' ? 'selected' : ''}>Delivered</option>
                        <option value="cancelled" ${this.state.filterStatus === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                    </select>
                </div>

                <!-- Orders Table -->
                <div class="bg-white border border-line overflow-hidden">
                    ${this.renderOrdersTable()}
                </div>

                <!-- Order Detail Modal -->
                <div id="order-detail-modal" class="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm opacity-0 pointer-events-none transition-opacity duration-300 flex items-center justify-center p-4">
                    <div id="order-detail-panel" class="w-full max-w-2xl bg-white border border-line shadow-2xl max-h-[90vh] overflow-y-auto transform scale-95 transition-transform duration-300"></div>
                </div>

            </div>
        `;
    },

    renderStatCard(label, count, colorClass, filterKey) {
        const isActive = this.state.filterStatus === filterKey;
        return `
            <button 
                data-filter-status="${filterKey}"
                class="bg-white border ${isActive ? 'border-obsidian bg-obsidian text-white' : 'border-line text-obsidian hover:border-stone-400'} p-4 text-left transition-colors rounded-none"
            >
                <div class="text-2xl font-serif font-normal ${isActive ? 'text-white' : (colorClass || 'text-obsidian')}">${count}</div>
                <div class="text-[10px] uppercase tracking-[0.12em] font-semibold mt-1 ${isActive ? 'text-stone-300' : 'text-muted'}">${label}</div>
            </button>
        `;
    },

    renderOrdersTable() {
        const filtered = this.getFilteredOrders();

        if (filtered.length === 0) {
            return `
                <div class="py-20 text-center space-y-3">
                    <svg class="w-12 h-12 text-muted mx-auto stroke-current" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                    </svg>
                    <p class="text-sm font-serif text-obsidian">No orders found</p>
                    <p class="text-xs text-muted">Try adjusting your search or filter criteria.</p>
                </div>
            `;
        }

        return `
            <div class="overflow-x-auto">
                <table class="w-full text-xs">
                    <thead class="bg-[#F9F9F9] border-b border-line">
                        <tr class="text-[10px] uppercase tracking-[0.12em] text-muted font-semibold">
                            <th class="text-left px-5 py-3.5">Order #</th>
                            <th class="text-left px-5 py-3.5">Customer</th>
                            <th class="text-left px-5 py-3.5">City</th>
                            <th class="text-left px-5 py-3.5">Items</th>
                            <th class="text-left px-5 py-3.5">Total</th>
                            <th class="text-left px-5 py-3.5">Status</th>
                            <th class="text-left px-5 py-3.5">Date</th>
                            <th class="text-left px-5 py-3.5">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-line">
                        ${filtered.map(order => this.renderOrderRow(order)).join('')}
                    </tbody>
                </table>
            </div>
            <div class="px-5 py-3 border-t border-line bg-[#F9F9F9] text-[11px] text-muted">
                Showing ${filtered.length} of ${this.state.orders.length} orders
            </div>
        `;
    },

    renderOrderRow(order) {
        const cfg = this.statusConfig[order.status] || this.statusConfig['pending'];
        const date = order.created_at ? new Date(order.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

        return `
            <tr class="hover:bg-[#FAFAFA] transition-colors group">
                <td class="px-5 py-3.5 font-mono font-semibold text-obsidian text-[11px]">${this.escapeHtml(order.order_number)}</td>
                <td class="px-5 py-3.5">
                    <div class="font-medium text-obsidian">${this.escapeHtml(order.shipping_name)}</div>
                    <div class="text-muted text-[10px]">${this.escapeHtml(order.shipping_phone || '')}</div>
                </td>
                <td class="px-5 py-3.5 text-obsidian">${this.escapeHtml(order.shipping_city || '—')}</td>
                <td class="px-5 py-3.5 text-center text-obsidian font-medium">${order.total_items || 0}</td>
                <td class="px-5 py-3.5 font-semibold text-obsidian">${this.formatCurrency(order.total_amount)} <span class="font-normal text-muted">MAD</span></td>
                <td class="px-5 py-3.5">
                    <span class="inline-flex items-center px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider border ${cfg.bg} ${cfg.text} ${cfg.border}">
                        ${cfg.label}
                    </span>
                </td>
                <td class="px-5 py-3.5 text-muted">${date}</td>
                <td class="px-5 py-3.5">
                    <button 
                        data-view-order="${order.id}" 
                        class="text-[10px] font-semibold uppercase tracking-wider text-obsidian border border-obsidian px-3 py-1.5 hover:bg-obsidian hover:text-white transition-colors"
                    >
                        Manage
                    </button>
                </td>
            </tr>
        `;
    },

    renderOrderDetailPanel(order) {
        const cfg = this.statusConfig[order.status] || this.statusConfig['pending'];
        const date = order.created_at ? new Date(order.created_at).toLocaleString('en-GB', { dateStyle: 'long', timeStyle: 'short' }) : '—';

        const statusOptions = Object.entries(this.statusConfig).map(([key, val]) =>
            `<option value="${key}" ${order.status === key ? 'selected' : ''}>${val.label}</option>`
        ).join('');

        const items = order.items || [];

        return `
            <div class="p-6 space-y-6 font-sans">

                <!-- Modal Header -->
                <div class="flex items-start justify-between border-b border-line pb-5">
                    <div>
                        <span class="text-[10px] uppercase tracking-[0.2em] text-muted font-semibold block">Order Details</span>
                        <h2 class="text-xl font-serif font-normal text-obsidian mt-1">${this.escapeHtml(order.order_number)}</h2>
                        <p class="text-[11px] text-muted mt-1">${date}</p>
                    </div>
                    <div class="flex items-center gap-3">
                        <span class="inline-flex items-center px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider border ${cfg.bg} ${cfg.text} ${cfg.border}">
                            ${cfg.label}
                        </span>
                        <button id="close-order-modal" class="text-muted hover:text-obsidian transition-colors p-1">
                            <svg class="w-5 h-5 stroke-current" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M6 18L18 6M6 6l12 12"/>
                            </svg>
                        </button>
                    </div>
                </div>

                <!-- Customer & Shipping Info -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div class="bg-[#F9F9F9] border border-line p-4 space-y-3">
                        <h3 class="text-[10px] uppercase tracking-[0.18em] font-bold text-obsidian">Customer & Contact</h3>
                        <div class="space-y-1 text-xs text-obsidian">
                            <div class="font-semibold">${this.escapeHtml(order.shipping_name)}</div>
                            <div class="text-muted">${this.escapeHtml(order.shipping_phone || '—')}</div>
                        </div>
                    </div>
                    <div class="bg-[#F9F9F9] border border-line p-4 space-y-3">
                        <h3 class="text-[10px] uppercase tracking-[0.18em] font-bold text-obsidian">Delivery Address</h3>
                        <div class="space-y-1 text-xs text-obsidian">
                            <div>${this.escapeHtml(order.shipping_address_line1)}</div>
                            ${order.shipping_address_line2 ? `<div class="text-muted">${this.escapeHtml(order.shipping_address_line2)}</div>` : ''}
                            <div class="font-semibold">${this.escapeHtml(order.shipping_city)} ${order.shipping_region ? '— ' + this.escapeHtml(order.shipping_region) : ''}</div>
                            <div class="text-muted">${this.escapeHtml(order.shipping_country || 'Morocco')}</div>
                        </div>
                    </div>
                </div>

                <!-- Order Items -->
                <div class="space-y-3">
                    <h3 class="text-[10px] uppercase tracking-[0.18em] font-bold text-obsidian">Order Items (${items.length})</h3>
                    <div class="border border-line divide-y divide-line">
                        ${items.length === 0 ? `<div class="py-6 text-center text-xs text-muted">No items found for this order.</div>` : 
                            items.map(item => `
                                <div class="flex items-center gap-4 p-4">
                                    <div class="w-12 h-12 bg-[#F0EDE7] border border-line flex items-center justify-center flex-shrink-0 overflow-hidden">
                                        ${item.main_image ? 
                                            `<img src="/public/uploads/products/${this.escapeHtml(item.main_image)}" alt="${this.escapeHtml(item.product_name)}" class="w-full h-full object-cover">` :
                                            `<svg class="w-6 h-6 stroke-current text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.4" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>`
                                        }
                                    </div>
                                    <div class="flex-1 min-w-0">
                                        <div class="font-semibold text-obsidian text-xs">${this.escapeHtml(item.product_name || '—')}</div>
                                        <div class="text-[10px] text-muted mt-0.5">
                                            ${item.color ? `Color: ${this.escapeHtml(item.color)}` : ''} 
                                            ${item.color && item.size ? ' · ' : ''} 
                                            ${item.size ? `Size: ${this.escapeHtml(item.size)}` : ''}
                                        </div>
                                        <div class="text-[10px] text-muted">Qty: ${item.quantity}</div>
                                    </div>
                                    <div class="text-right text-xs font-semibold text-obsidian">${this.formatCurrency(item.price * item.quantity)} MAD</div>
                                </div>
                            `).join('')
                        }
                    </div>
                </div>

                <!-- Order Totals -->
                <div class="bg-[#F9F9F9] border border-line p-4 space-y-2 text-xs">
                    <div class="flex justify-between text-muted">
                        <span>Subtotal</span>
                        <span>${this.formatCurrency(order.subtotal)} MAD</span>
                    </div>
                    <div class="flex justify-between text-muted">
                        <span>Shipping</span>
                        <span>${parseFloat(order.shipping_cost) === 0 ? 'FREE' : this.formatCurrency(order.shipping_cost) + ' MAD'}</span>
                    </div>
                    <div class="flex justify-between font-bold text-obsidian border-t border-line pt-2">
                        <span>Total (COD)</span>
                        <span>${this.formatCurrency(order.total_amount)} MAD</span>
                    </div>
                </div>

                <!-- Status Update -->
                <div class="border border-line p-4 space-y-3">
                    <h3 class="text-[10px] uppercase tracking-[0.18em] font-bold text-obsidian">Update Order Status</h3>
                    <div id="status-update-msg" class="hidden text-xs p-2 border"></div>
                    <div class="flex items-center gap-3">
                        <select 
                            id="order-status-select" 
                            data-order-id="${order.id}"
                            class="flex-1 bg-white border border-line text-xs text-obsidian px-3 py-2.5 focus:outline-none focus:border-obsidian rounded-none"
                        >
                            ${statusOptions}
                        </select>
                        <button 
                            id="btn-update-status"
                            data-order-id="${order.id}"
                            class="bg-obsidian text-white text-[11px] font-semibold uppercase tracking-[0.12em] px-5 py-2.5 hover:bg-black transition-colors flex items-center gap-2"
                        >
                            <span>Update Status</span>
                        </button>
                    </div>
                </div>

            </div>
        `;
    },

    getFilteredOrders() {
        let orders = this.state.orders;

        if (this.state.filterStatus !== 'all') {
            orders = orders.filter(o => o.status === this.state.filterStatus);
        }

        if (this.state.searchQuery.trim()) {
            const q = this.state.searchQuery.toLowerCase().trim();
            orders = orders.filter(o =>
                (o.order_number || '').toLowerCase().includes(q) ||
                (o.shipping_name || '').toLowerCase().includes(q) ||
                (o.shipping_phone || '').toLowerCase().includes(q) ||
                (o.shipping_city || '').toLowerCase().includes(q)
            );
        }

        return orders;
    },

    computeStats() {
        const orders = this.state.orders;
        const deliveredOrders = orders.filter(o => o.status === 'delivered');
        const revenue = deliveredOrders.reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0);
        const avgOrder = orders.length > 0 ? orders.reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0) / orders.length : 0;

        return {
            total:      orders.length,
            pending:    orders.filter(o => o.status === 'pending').length,
            confirmed:  orders.filter(o => o.status === 'confirmed').length,
            processing: orders.filter(o => o.status === 'processing').length,
            shipped:    orders.filter(o => o.status === 'shipped').length,
            delivered:  deliveredOrders.length,
            cancelled:  orders.filter(o => o.status === 'cancelled').length,
            revenue,
            avgOrder
        };
    },

    attachEvents() {
        // Stat card filter buttons
        document.querySelectorAll('[data-filter-status]').forEach(btn => {
            btn.onclick = () => {
                this.state.filterStatus = btn.getAttribute('data-filter-status');
                this.refreshTable();
            };
        });

        // Search input
        const searchInput = document.getElementById('order-search-input');
        if (searchInput) {
            let debounceTimer;
            searchInput.oninput = (e) => {
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(() => {
                    this.state.searchQuery = e.target.value;
                    this.refreshTable();
                }, 250);
            };
        }

        // Status filter dropdown
        const statusFilter = document.getElementById('order-status-filter');
        if (statusFilter) {
            statusFilter.onchange = (e) => {
                this.state.filterStatus = e.target.value;
                this.refreshTable();
            };
        }

        // View order detail buttons
        document.querySelectorAll('[data-view-order]').forEach(btn => {
            btn.onclick = () => {
                const orderId = parseInt(btn.getAttribute('data-view-order'), 10);
                this.openOrderDetail(orderId);
            };
        });

        // Modal backdrop click to close
        const modal = document.getElementById('order-detail-modal');
        if (modal) {
            modal.onclick = (e) => {
                if (e.target === modal) this.closeOrderDetail();
            };
        }
    },

    refreshTable() {
        const tableContainer = document.querySelector('#orders-view-root .bg-white.border.border-line.overflow-hidden');
        if (tableContainer) {
            tableContainer.innerHTML = this.renderOrdersTable();
        }

        // Re-attach row events
        document.querySelectorAll('[data-filter-status]').forEach(btn => {
            btn.onclick = () => {
                this.state.filterStatus = btn.getAttribute('data-filter-status');
                this.refreshTable();
            };
        });

        document.querySelectorAll('[data-view-order]').forEach(btn => {
            btn.onclick = () => {
                const orderId = parseInt(btn.getAttribute('data-view-order'), 10);
                this.openOrderDetail(orderId);
            };
        });
    },

    openOrderDetail(orderId) {
        const order = this.state.orders.find(o => parseInt(o.id) === orderId);
        if (!order) return;

        this.state.selectedOrder = order;

        const modal = document.getElementById('order-detail-modal');
        const panel = document.getElementById('order-detail-panel');

        if (modal && panel) {
            panel.innerHTML = this.renderOrderDetailPanel(order);
            modal.classList.remove('opacity-0', 'pointer-events-none');
            modal.classList.add('opacity-100');
            panel.classList.remove('scale-95');
            panel.classList.add('scale-100');

            // Attach close button
            const closeBtn = document.getElementById('close-order-modal');
            if (closeBtn) closeBtn.onclick = () => this.closeOrderDetail();

            // Attach status update button
            const updateBtn = document.getElementById('btn-update-status');
            if (updateBtn) {
                updateBtn.onclick = () => this.updateOrderStatus(orderId);
            }
        }
    },

    closeOrderDetail() {
        const modal = document.getElementById('order-detail-modal');
        const panel = document.getElementById('order-detail-panel');
        if (modal && panel) {
            modal.classList.add('opacity-0', 'pointer-events-none');
            modal.classList.remove('opacity-100');
            panel.classList.add('scale-95');
            panel.classList.remove('scale-100');
        }
        this.state.selectedOrder = null;
    },

    async updateOrderStatus(orderId) {
        const select = document.getElementById('order-status-select');
        const btn    = document.getElementById('btn-update-status');
        const msgEl  = document.getElementById('status-update-msg');

        if (!select || !btn) return;

        const newStatus = select.value;

        btn.disabled = true;
        btn.innerHTML = `<div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> <span>Updating...</span>`;
        msgEl.classList.add('hidden');

        try {
            const res = await fetch(`/api/admin/orders.php?id=${orderId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            const result = await res.json();

            if (result.success) {
                // Update local state
                const order = this.state.orders.find(o => parseInt(o.id) === orderId);
                if (order) {
                    order.status = newStatus;
                    this.state.selectedOrder = order;
                }

                msgEl.textContent = result.message;
                msgEl.className = 'text-xs p-2 border bg-emerald-50 border-emerald-200 text-emerald-700';
                msgEl.classList.remove('hidden');

                // Refresh the orders table in background
                this.refreshTable();

                // Update status badge in the modal header
                const cfg = this.statusConfig[newStatus] || this.statusConfig['pending'];
                const headerBadge = document.querySelector('#order-detail-panel .inline-flex.items-center.px-3');
                if (headerBadge) {
                    headerBadge.className = `inline-flex items-center px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider border ${cfg.bg} ${cfg.text} ${cfg.border}`;
                    headerBadge.textContent = cfg.label;
                }
            } else {
                msgEl.textContent = result.message || 'Failed to update status.';
                msgEl.className = 'text-xs p-2 border bg-rose-50 border-rose-200 text-rose-700';
                msgEl.classList.remove('hidden');
            }
        } catch (e) {
            console.error('Status update failed', e);
            msgEl.textContent = 'Network error. Please try again.';
            msgEl.className = 'text-xs p-2 border bg-rose-50 border-rose-200 text-rose-700';
            msgEl.classList.remove('hidden');
        } finally {
            btn.disabled = false;
            btn.innerHTML = `<span>Update Status</span>`;
        }
    },

    formatCurrency(val) {
        const n = parseFloat(val) || 0;
        return n.toLocaleString('en-MA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    },

    escapeHtml(str) {
        if (!str) return '';
        return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }
};
