export const DashboardView = {
    async render() {
        let stats = {
            total_products: 0,
            total_categories: 0,
            total_collections: 0,
            total_orders: 0,
            low_stock_count: 0
        };

        try {
            const res = await fetch('/api/admin/stats.php');
            const result = await res.json();
            if (result.success) {
                stats = result.data;
            }
        } catch (e) {
            console.error('Failed to load admin stats', e);
        }

        return `
            <div class="space-y-10">
                <!-- Welcome Editorial Banner (Monochromatic Black Banner, Pure White Typography) -->
                <div class="bg-obsidian p-10 text-white border border-stone-900 rounded-none flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                    <div>
                        <span class="text-[11px] uppercase tracking-[0.2em] text-stone-400 font-semibold block">Overview & Analytics</span>
                        <h1 class="text-3xl font-serif font-normal tracking-wide mt-2 text-white">Storefront Dashboard</h1>
                        <p class="text-stone-400 text-xs mt-1 leading-relaxed">Manage catalog items, active collections, stock inventory, and customer orders.</p>
                    </div>
                    <div class="flex gap-4">
                        <a href="#products" class="bg-white hover:bg-stone-200 text-obsidian font-bold text-[11px] uppercase tracking-[0.15em] px-6 py-3.5 rounded-none transition-colors border border-white">
                            + Add Product
                        </a>
                        <a href="#categories" class="bg-transparent hover:bg-stone-800 text-white border border-stone-700 font-semibold text-[11px] uppercase tracking-[0.15em] px-6 py-3.5 rounded-none transition-colors">
                            Manage Categories
                        </a>
                    </div>
                </div>

                <!-- Metrics Grid (Pure White Cards, Fine Hairline Borders, Monochromatic Icons) -->
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <!-- Products Stat -->
                    <div class="bg-white p-6 border border-line rounded-none flex items-center justify-between">
                        <div>
                            <p class="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted">Active Products</p>
                            <h2 class="text-4xl font-serif font-normal text-obsidian mt-2">${stats.total_products}</h2>
                        </div>
                        <div class="w-10 h-10 bg-[#F9F9F9] border border-line text-obsidian flex items-center justify-center rounded-none">
                            <svg class="w-5 h-5 stroke-current" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
                        </div>
                    </div>

                    <!-- Categories Stat -->
                    <div class="bg-white p-6 border border-line rounded-none flex items-center justify-between">
                        <div>
                            <p class="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted">Categories</p>
                            <h2 class="text-4xl font-serif font-normal text-obsidian mt-2">${stats.total_categories}</h2>
                        </div>
                        <div class="w-10 h-10 bg-[#F9F9F9] border border-line text-obsidian flex items-center justify-center rounded-none">
                            <svg class="w-5 h-5 stroke-current" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/></svg>
                        </div>
                    </div>

                    <!-- Collections Stat -->
                    <div class="bg-white p-6 border border-line rounded-none flex items-center justify-between">
                        <div>
                            <p class="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted">Collections</p>
                            <h2 class="text-4xl font-serif font-normal text-obsidian mt-2">${stats.total_collections}</h2>
                        </div>
                        <div class="w-10 h-10 bg-[#F9F9F9] border border-line text-obsidian flex items-center justify-center rounded-none">
                            <svg class="w-5 h-5 stroke-current" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
                        </div>
                    </div>

                    <!-- Orders Stat -->
                    <div class="bg-white p-6 border border-line rounded-none flex items-center justify-between">
                        <div>
                            <p class="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted">Total Orders</p>
                            <h2 class="text-4xl font-serif font-normal text-obsidian mt-2">${stats.total_orders}</h2>
                        </div>
                        <div class="w-10 h-10 bg-[#F9F9F9] border border-line text-obsidian flex items-center justify-center rounded-none">
                            <svg class="w-5 h-5 stroke-current" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
                        </div>
                    </div>
                </div>

                <!-- Stock Warning Alert if low stock (Monochromatic Alert) -->
                ${stats.low_stock_count > 0 ? `
                    <div class="bg-obsidian text-white p-5 border border-stone-800 rounded-none flex items-center justify-between">
                        <div class="flex items-center space-x-4">
                            <svg class="w-5 h-5 text-white stroke-current" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                            <div>
                                <h3 class="text-xs font-bold uppercase tracking-[0.15em] text-white">Inventory Notification</h3>
                                <p class="text-xs text-stone-400 mt-0.5">${stats.low_stock_count} product variant(s) have stock levels at or below 5 units.</p>
                            </div>
                        </div>
                        <a href="#products" class="text-xs font-bold uppercase tracking-[0.15em] text-white underline hover:text-stone-300">Review Stock</a>
                    </div>
                ` : ''}

                <!-- Setup Architecture Guide -->
                <div class="bg-white p-8 border border-line rounded-none">
                    <h3 class="text-xl font-serif font-normal text-obsidian mb-6">Architecture Setup Overview</h3>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div class="p-6 bg-[#F9F9F9] border border-line rounded-none">
                            <span class="text-[10px] font-bold uppercase tracking-[0.15em] text-muted block">Phase 3 & 4</span>
                            <h4 class="font-bold text-obsidian mt-2 text-sm">Categories & Collections</h4>
                            <p class="text-xs text-muted mt-2 leading-relaxed">Manage product grouping and seasonal catalog banners.</p>
                        </div>
                        <div class="p-6 bg-[#F9F9F9] border border-line rounded-none">
                            <span class="text-[10px] font-bold uppercase tracking-[0.15em] text-muted block">Phase 5 & 6</span>
                            <h4 class="font-bold text-obsidian mt-2 text-sm">Products & Variant Matrix</h4>
                            <p class="text-xs text-muted mt-2 leading-relaxed">Configure prices, colors, sizes, inventory stock, and image assets.</p>
                        </div>
                        <div class="p-6 bg-[#F9F9F9] border border-line rounded-none">
                            <span class="text-[10px] font-bold uppercase tracking-[0.15em] text-muted block">Phase 12</span>
                            <h4 class="font-bold text-obsidian mt-2 text-sm">Order Fulfillment</h4>
                            <p class="text-xs text-muted mt-2 leading-relaxed">Review incoming customer orders and track delivery statuses.</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
};
