import { CartState } from '../cart.js';
import { i18n } from '../i18n.js';
import { currencyStore } from '../currencyStore.js';

export const ShopView = {
    state: {
        products: [],
        filterOptions: null,
        loading: true,
        filters: {
            category_id: '',
            collection_id: '',
            min_price: '',
            max_price: '',
            search: '',
            colors: [],
            sizes: [],
            sort: 'newest'
        },
        mobileFilterOpen: false
    },

    parseHashParams() {
        const hash = window.location.hash;
        const queryIndex = hash.indexOf('?');
        const params = new URLSearchParams(queryIndex === -1 ? '' : hash.substring(queryIndex + 1));

        this.state.filters.category_id = params.get('category') || '';
        if (params.has('collection')) this.state.filters.collection_id = params.get('collection');
        if (params.has('search')) this.state.filters.search = params.get('search');
        if (params.has('sort')) this.state.filters.sort = params.get('sort');
        if (params.has('min_price')) this.state.filters.min_price = params.get('min_price');
        if (params.has('max_price')) this.state.filters.max_price = params.get('max_price');
    },

    async resolveCategoryRoute() {
        const path = window.location.hash.split('?')[0].split('/');
        const categorySlug = path[0] === '#shop' && path[1]
            ? new URLSearchParams(`category=${path[1]}`).get('category')
            : '';

        if (!categorySlug && !this.state.filters.category_id) return;

        const response = await fetch('/api/storefront/products.php?action=filter_options');
        if (!response.ok) throw new Error(`Failed to load categories (${response.status})`);

        const result = await response.json();
        if (!result.success || !Array.isArray(result.data?.categories)) {
            throw new Error(result.message || 'Failed to load categories');
        }

        const categories = result.data.categories;
        this.state.filterOptions = result.data;
        const normalizeSlug = value => String(value || '')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');
        const category = categorySlug
            ? categories.find(item => normalizeSlug(item.slug) === normalizeSlug(categorySlug)
                || normalizeSlug(item.name) === normalizeSlug(categorySlug))
            : categories.find(item => String(item.id) === String(this.state.filters.category_id));

        this.state.filters.category_id = category ? String(category.id) : '';
        this.updateHashUrl();
    },

    updateHashUrl() {
        const params = new URLSearchParams();
        if (this.state.filters.category_id) params.set('category', this.state.filters.category_id);
        if (this.state.filters.collection_id) params.set('collection', this.state.filters.collection_id);
        if (this.state.filters.search) params.set('search', this.state.filters.search);
        if (this.state.filters.sort !== 'newest') params.set('sort', this.state.filters.sort);
        if (this.state.filters.min_price) params.set('min_price', this.state.filters.min_price);
        if (this.state.filters.max_price) params.set('max_price', this.state.filters.max_price);

        const paramStr = params.toString();
        const newHash = paramStr ? `#shop?${paramStr}` : '#shop';
        if (window.location.hash !== newHash) {
            history.replaceState(null, '', newHash);
        }
    },

    async fetchProducts() {
        this.state.loading = true;
        this.renderProductsGrid();

        const queryParams = new URLSearchParams();
        if (this.state.filters.category_id) queryParams.set('category_id', this.state.filters.category_id);
        if (this.state.filters.collection_id) queryParams.set('collection_id', this.state.filters.collection_id);
        if (this.state.filters.search) queryParams.set('search', this.state.filters.search);
        if (this.state.filters.sort) queryParams.set('sort', this.state.filters.sort);
        if (this.state.filters.min_price) queryParams.set('min_price', this.state.filters.min_price);
        if (this.state.filters.max_price) queryParams.set('max_price', this.state.filters.max_price);

        if (this.state.filters.colors.length > 0) {
            queryParams.set('colors', this.state.filters.colors.join(','));
        }
        if (this.state.filters.sizes.length > 0) {
            queryParams.set('sizes', this.state.filters.sizes.join(','));
        }

        try {
            const res = await fetch(`/api/storefront/products.php?${queryParams.toString()}`);
            const result = await res.json();
            if (result.success) {
                this.state.products = result.data.products || [];
                if (!this.state.filterOptions) {
                    this.state.filterOptions = result.data.filter_options || null;
                }
            }
        } catch (e) {
            console.error('Failed to load shop catalog', e);
            this.state.products = [];
        } finally {
            this.state.loading = false;
            this.renderProductsGrid();
            this.updateResultCount();
            this.updateActiveFilterBadges();
        }
    },

    async render() {
        this.parseHashParams();
        await this.resolveCategoryRoute();

        // Initial background fetch
        this.fetchProducts();

        setTimeout(() => this.attachEvents(), 0);

        return `
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">

                <!-- 1. Storefront Header Banner -->
                <div class="text-center space-y-3 border-b border-[#E5E2DC] pb-8">
                    <span class="text-[10px] uppercase tracking-[0.25em] text-[#7A7672] font-semibold block">ByInes Catalog</span>
                    <h1 class="text-3xl sm:text-5xl font-serif font-normal text-[#2C2926]">${i18n.t('shop.title')}</h1>
                    <p class="text-xs sm:text-sm text-[#7A7672] max-w-xl mx-auto font-sans leading-relaxed">
                        ${i18n.t('shop.subtitle')}
                    </p>
                </div>

                <!-- 2. Top Filter Utility Bar -->
                <div class="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-[#F9F8F6] p-4 border border-[#E5E2DC]">
                    
                    <!-- Search Input Box -->
                    <div class="relative flex-1 max-w-md">
                        <input 
                            type="text" 
                            id="shop-search"
                            value="${this.escapeHtml(this.state.filters.search)}"
                            placeholder="${i18n.t('shop.search_placeholder')}" 
                            class="w-full bg-white border border-[#E5E2DC] pl-10 pr-4 py-2 text-xs font-sans text-[#2C2926] placeholder-[#9A9690] focus:outline-none focus:border-[#2C2926] rounded-none transition-colors"
                        />
                        <svg class="w-4 h-4 text-[#7A7672] absolute left-3 top-1/2 -translate-y-1/2 stroke-current" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                        </svg>
                    </div>

                    <!-- Right Controls (Mobile Drawer Toggle, Sort, Results Count) -->
                    <div class="flex items-center justify-between md:justify-end gap-3 flex-wrap">
                        
                        <!-- Mobile Filter Button -->
                        <button id="toggle-mobile-filters" class="md:hidden flex items-center gap-2 bg-white border border-[#E5E2DC] px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[#2C2926] hover:bg-[#2C2926] hover:text-white transition-colors">
                            <svg class="w-4 h-4 stroke-current" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/></svg>
                            <span>${i18n.t('shop.filters')}</span>
                        </button>

                        <!-- Product Counter -->
                        <span id="shop-result-count" class="text-xs text-[#7A7672] font-sans">
                            Showing products...
                        </span>

                        <!-- Sorting Dropdown -->
                        <div class="flex items-center gap-2">
                            <label for="shop-sort" class="text-[11px] text-[#7A7672] uppercase tracking-wider font-semibold hidden sm:inline-block">${i18n.t('shop.sort_by')}</label>
                            <select id="shop-sort" class="bg-white border border-[#E5E2DC] text-xs font-sans text-[#2C2926] px-3 py-2 focus:outline-none focus:border-[#2C2926] rounded-none cursor-pointer">
                                <option value="newest" ${this.state.filters.sort === 'newest' ? 'selected' : ''}>${i18n.t('shop.newest')}</option>
                                <option value="price_asc" ${this.state.filters.sort === 'price_asc' ? 'selected' : ''}>${i18n.t('shop.price_low_high')}</option>
                                <option value="price_desc" ${this.state.filters.sort === 'price_desc' ? 'selected' : ''}>${i18n.t('shop.price_high_low')}</option>
                                <option value="name_asc" ${this.state.filters.sort === 'name_asc' ? 'selected' : ''}>${i18n.t('shop.name_asc')}</option>
                            </select>
                        </div>
                    </div>
                </div>

                <!-- Active Filter Badges Container -->
                <div id="active-filter-badges" class="hidden flex-wrap items-center gap-2 pt-1">
                    <!-- Dynamic badges rendered here -->
                </div>

                <!-- 3. Catalog Main Layout (Sidebar + Products Grid) -->
                <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
                    
                    <!-- Desktop Filter Sidebar -->
                    <aside class="hidden md:block md:col-span-1 space-y-8 bg-[#F9F8F6] p-6 border border-[#E5E2DC] h-fit">
                        ${this.renderFilterSidebarContent()}
                    </aside>

                    <!-- Mobile Filter Drawer Modal -->
                    <div id="mobile-filter-drawer" class="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm hidden flex justify-end">
                        <div class="w-4/5 max-w-sm bg-white h-full p-6 overflow-y-auto space-y-6 shadow-2xl flex flex-col justify-between">
                            <div class="space-y-6">
                                <div class="flex items-center justify-between border-b border-[#E5E2DC] pb-4">
                                    <h3 class="font-serif text-lg text-[#2C2926]">Filter Catalog</h3>
                                    <button id="close-mobile-filters" class="text-[#7A7672] hover:text-[#2C2926]">
                                        <svg class="w-6 h-6 stroke-current" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M6 18L18 6M6 6l12 12"/></svg>
                                    </button>
                                </div>
                                <div>
                                    ${this.renderFilterSidebarContent('mobile')}
                                </div>
                            </div>
                            <div class="pt-4 border-t border-[#E5E2DC]">
                                <button id="apply-mobile-filters" class="w-full bg-[#2C2926] text-white text-xs font-semibold uppercase tracking-widest py-3 hover:bg-black transition-colors">
                                    Apply Filters
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Products Grid Container -->
                    <main id="shop-products-container" class="md:col-span-3 min-h-[400px]">
                        <!-- Rendered dynamically -->
                    </main>

                </div>
            </div>
        `;
    },

    renderFilterSidebarContent(prefix = 'desktop') {
        const opts = this.state.filterOptions || { categories: [], collections: [], colors: [], sizes: [], min_price: 0, max_price: 100 };

        return `
            <div class="space-y-6 font-sans">
                
                <!-- Reset All Button -->
                <div class="flex items-center justify-between border-b border-[#E5E2DC] pb-3">
                    <span class="text-xs font-semibold text-[#2C2926] uppercase tracking-wider">Filter By</span>
                    <button class="reset-all-filters text-[11px] text-[#7A7672] hover:text-[#2C2926] hover:underline font-sans">
                        Reset All
                    </button>
                </div>

                <!-- Categories Accordion/List -->
                <div class="space-y-3">
                    <h4 class="text-xs font-semibold uppercase tracking-wider text-[#2C2926]">Category</h4>
                    <div class="space-y-1.5 text-xs text-[#5D5F5F]">
                        <label class="flex items-center space-x-2.5 cursor-pointer hover:text-[#2C2926]">
                            <input type="radio" name="${prefix}_category" value="" ${!this.state.filters.category_id ? 'checked' : ''} class="filter-category-radio text-obsidian focus:ring-0 cursor-pointer" />
                            <span>All Categories</span>
                        </label>
                        ${(opts.categories || []).map(cat => `
                            <label class="flex items-center space-x-2.5 cursor-pointer hover:text-[#2C2926]">
                                <input type="radio" name="${prefix}_category" value="${cat.id}" ${String(this.state.filters.category_id) === String(cat.id) ? 'checked' : ''} class="filter-category-radio text-obsidian focus:ring-0 cursor-pointer" />
                                <span>${cat.name}</span>
                            </label>
                        `).join('')}
                    </div>
                </div>

                <!-- Collections List -->
                <div class="space-y-3 border-t border-[#E5E2DC] pt-4">
                    <h4 class="text-xs font-semibold uppercase tracking-wider text-[#2C2926]">Collection</h4>
                    <div class="space-y-1.5 text-xs text-[#5D5F5F]">
                        <label class="flex items-center space-x-2.5 cursor-pointer hover:text-[#2C2926]">
                            <input type="radio" name="${prefix}_collection" value="" ${!this.state.filters.collection_id ? 'checked' : ''} class="filter-collection-radio text-obsidian focus:ring-0 cursor-pointer" />
                            <span>All Collections</span>
                        </label>
                        ${(opts.collections || []).map(col => `
                            <label class="flex items-center space-x-2.5 cursor-pointer hover:text-[#2C2926]">
                                <input type="radio" name="${prefix}_collection" value="${col.id}" ${String(this.state.filters.collection_id) === String(col.id) ? 'checked' : ''} class="filter-collection-radio text-obsidian focus:ring-0 cursor-pointer" />
                                <span>${col.title}</span>
                            </label>
                        `).join('')}
                    </div>
                </div>

                <!-- Price Range Filter -->
                <div class="space-y-3 border-t border-[#E5E2DC] pt-4">
                    <h4 class="text-xs font-semibold uppercase tracking-wider text-[#2C2926]">Price ($)</h4>
                    <div class="flex items-center gap-2">
                        <input 
                            type="number" 
                            placeholder="Min" 
                            value="${this.state.filters.min_price}"
                            class="filter-min-price w-full bg-white border border-[#E5E2DC] p-2 text-xs text-[#2C2926] focus:outline-none focus:border-[#2C2926] rounded-none"
                        />
                        <span class="text-stone-400 text-xs">-</span>
                        <input 
                            type="number" 
                            placeholder="Max" 
                            value="${this.state.filters.max_price}"
                            class="filter-max-price w-full bg-white border border-[#E5E2DC] p-2 text-xs text-[#2C2926] focus:outline-none focus:border-[#2C2926] rounded-none"
                        />
                    </div>
                </div>

                <!-- Colors Filter Swatches -->
                ${(opts.colors && opts.colors.length > 0) ? `
                    <div class="space-y-3 border-t border-[#E5E2DC] pt-4">
                        <h4 class="text-xs font-semibold uppercase tracking-wider text-[#2C2926]">Color Swatches</h4>
                        <div id="color-options-${prefix}" class="flex flex-wrap gap-2">
                            ${opts.colors.map((color, index) => {
                                const active = this.state.filters.colors.includes(color);
                                const collapsed = index >= 5 && !active;
                                return `
                                    <button 
                                        type="button" 
                                        data-color="${color}" 
                                        ${collapsed ? 'data-color-extra' : ''}
                                        title="${color}"
                                        class="filter-color-btn text-[11px] px-3 py-1 border transition-all cursor-pointer ${collapsed ? 'hidden' : ''} ${active ? 'bg-[#2C2926] text-white border-[#2C2926]' : 'bg-white text-[#5D5F5F] border-[#E5E2DC] hover:border-[#2C2926]'}"
                                    >
                                        ${color}
                                    </button>
                                `;
                            }).join('')}
                        </div>
                        ${opts.colors.length > 5 ? `
                            <button
                                type="button"
                                data-toggle-colors
                                aria-controls="color-options-${prefix}"
                                aria-expanded="false"
                                class="text-[11px] text-[#7A7672] hover:text-[#2C2926] hover:underline"
                            >Show more</button>
                        ` : ''}
                    </div>
                ` : ''}

                <!-- Sizes Filter -->
                ${(opts.sizes && opts.sizes.length > 0) ? `
                    <div class="space-y-3 border-t border-[#E5E2DC] pt-4">
                        <h4 class="text-xs font-semibold uppercase tracking-wider text-[#2C2926]">Sizes</h4>
                        <div class="flex flex-wrap gap-2">
                            ${opts.sizes.map(size => {
                                const active = this.state.filters.sizes.includes(size);
                                return `
                                    <button 
                                        type="button" 
                                        data-size="${size}" 
                                        class="filter-size-btn text-xs w-8 h-8 flex items-center justify-center border font-mono transition-all cursor-pointer ${active ? 'bg-[#2C2926] text-white border-[#2C2926]' : 'bg-white text-[#5D5F5F] border-[#E5E2DC] hover:border-[#2C2926]'}"
                                    >
                                        ${size}
                                    </button>
                                `;
                            }).join('')}
                        </div>
                    </div>
                ` : ''}

            </div>
        `;
    },

    renderProductsGrid() {
        const container = document.getElementById('shop-products-container');
        if (!container) return;

        if (this.state.loading) {
            container.innerHTML = `
                <div class="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    ${[1, 2, 6].map(() => `
                        <div class="space-y-4 animate-pulse">
                            <div class="bg-[#EFECE6] aspect-[3/4] rounded-none"></div>
                            <div class="h-4 bg-[#EFECE6] w-3/4"></div>
                            <div class="h-3 bg-[#EFECE6] w-1/4"></div>
                        </div>
                    `).join('')}
                </div>
            `;
            return;
        }

        if (this.state.products.length === 0) {
            container.innerHTML = `
                <div class="text-center py-20 bg-[#F9F8F6] border border-[#E5E2DC] space-y-4 px-6">
                    <svg class="w-12 h-12 text-[#7A7672] mx-auto stroke-current" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>
                    </svg>
                    <h3 class="text-xl font-serif text-[#2C2926]">No Products Found</h3>
                    <p class="text-xs text-[#7A7672] max-w-sm mx-auto">
                        We couldn't find any items matching your selected criteria. Try adjusting your filters or search keywords.
                    </p>
                    <div>
                        <button class="reset-all-filters inline-block bg-[#2C2926] text-white text-xs font-semibold uppercase tracking-wider px-6 py-2.5 hover:bg-black transition-colors">
                            Reset Filters
                        </button>
                    </div>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div class="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                ${this.state.products.map(prod => {
                    const mainImg = prod.main_image 
                        ? (prod.main_image.startsWith('prod_') ? `/public/uploads/products/${prod.main_image}` : `/assets/products/${prod.main_image}`)
                        : 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80';

                    return `
                        <div class="group space-y-3 flex flex-col justify-between">
                            <div class="space-y-3">
                                <!-- Image Card Frame -->
                                <div class="relative aspect-[3/4] bg-[#EFECE6] overflow-hidden border border-[#E5E2DC]/60 group-hover:border-[#2C2926]/40 transition-colors">
                                    <a href="#product/${prod.id}" class="block w-full h-full">
                                        <img 
                                            src="${mainImg}" 
                                            onerror="this.src='https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80';" 
                                            alt="${this.escapeHtml(prod.name)}" 
                                            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                                        />
                                    </a>

                                    <!-- Category Pill Tag -->
                                    <span class="absolute top-3 left-3 bg-white/90 backdrop-blur text-[10px] uppercase tracking-wider text-[#2C2926] px-2.5 py-1 font-semibold border border-[#E5E2DC]">
                                        ${this.escapeHtml(prod.category_name || 'Collection')}
                                    </span>

                                    <!-- Quick Add Bag Button -->
                                    <button 
                                        data-quick-add="${prod.id}" 
                                        aria-label="Add to Bag" 
                                        class="absolute top-3 right-3 w-9 h-9 bg-white/95 backdrop-blur border border-[#E5E2DC] shadow-sm flex items-center justify-center text-[#2C2926] hover:bg-[#2C2926] hover:text-white transition-all cursor-pointer"
                                    >
                                        <svg class="w-4 h-4 stroke-current" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.6" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
                                        </svg>
                                    </button>
                                </div>

                                <!-- Product Info -->
                                <div class="space-y-1">
                                    <a href="#product/${prod.id}" class="font-serif text-base text-[#2C2926] hover:underline block leading-snug truncate">
                                        ${this.escapeHtml(prod.name)}
                                    </a>
                                    <div class="flex items-center space-x-2 text-xs font-sans">
                                        <span class="text-[#2C2926] font-medium">${currencyStore.formatPrice(prod.price)}</span>
                                        ${prod.old_price ? `
                                            <span class="text-[#7A7672] line-through">${currencyStore.formatPrice(prod.old_price)}</span>
                                        ` : ''}
                                    </div>
                                </div>
                            </div>

                            <!-- Footer Action Link -->
                            <a href="#product/${prod.id}" class="inline-block text-[11px] uppercase tracking-widest font-semibold text-[#7A7672] hover:text-[#2C2926] transition-colors pt-2">
                                View Details &rarr;
                            </a>
                        </div>
                    `;
                }).join('')}
            </div>
        `;

        this.attachQuickAddEvents();
    },

    updateResultCount() {
        const el = document.getElementById('shop-result-count');
        if (el) {
            const count = this.state.products.length;
            el.textContent = `Showing ${count} product${count === 1 ? '' : 's'}`;
        }
    },

    updateActiveFilterBadges() {
        const container = document.getElementById('active-filter-badges');
        if (!container) return;

        const badges = [];

        if (this.state.filters.category_id && this.state.filterOptions?.categories) {
            const cat = this.state.filterOptions.categories.find(c => String(c.id) === String(this.state.filters.category_id));
            if (cat) badges.push({ type: 'category_id', label: `Category: ${cat.name}` });
        }

        if (this.state.filters.collection_id && this.state.filterOptions?.collections) {
            const col = this.state.filterOptions.collections.find(c => String(c.id) === String(this.state.filters.collection_id));
            if (col) badges.push({ type: 'collection_id', label: `Collection: ${col.title}` });
        }

        if (this.state.filters.search) {
            badges.push({ type: 'search', label: `Search: "${this.state.filters.search}"` });
        }

        if (this.state.filters.min_price || this.state.filters.max_price) {
            badges.push({ type: 'price', label: `Price: $${this.state.filters.min_price || 0} - $${this.state.filters.max_price || '∞'}` });
        }

        this.state.filters.colors.forEach(c => {
            badges.push({ type: 'color', val: c, label: `Color: ${c}` });
        });

        this.state.filters.sizes.forEach(s => {
            badges.push({ type: 'size', val: s, label: `Size: ${s}` });
        });

        if (badges.length === 0) {
            container.classList.add('hidden');
            container.classList.remove('flex');
            return;
        }

        container.classList.remove('hidden');
        container.classList.add('flex');
        container.innerHTML = `
            <span class="text-[11px] text-[#7A7672] uppercase tracking-wider font-semibold mr-1">Active:</span>
            ${badges.map(b => `
                <span class="inline-flex items-center gap-1.5 bg-[#EFECE6] text-[#2C2926] text-[11px] px-2.5 py-1 border border-[#E5E2DC]">
                    ${b.label}
                    <button data-remove-badge="${b.type}" data-badge-val="${b.val || ''}" class="hover:text-red-600 font-bold ml-1">
                        &times;
                    </button>
                </span>
            `).join('')}
            <button class="reset-all-filters text-[11px] text-[#7A7672] underline hover:text-[#2C2926] ml-2">
                Clear All
            </button>
        `;

        container.querySelectorAll('[data-remove-badge]').forEach(btn => {
            btn.onclick = () => {
                const type = btn.getAttribute('data-remove-badge');
                const val = btn.getAttribute('data-badge-val');
                if (type === 'category_id') this.state.filters.category_id = '';
                else if (type === 'collection_id') this.state.filters.collection_id = '';
                else if (type === 'search') {
                    this.state.filters.search = '';
                    const searchInput = document.getElementById('shop-search');
                    if (searchInput) searchInput.value = '';
                }
                else if (type === 'price') {
                    this.state.filters.min_price = '';
                    this.state.filters.max_price = '';
                }
                else if (type === 'color') {
                    this.state.filters.colors = this.state.filters.colors.filter(c => c !== val);
                }
                else if (type === 'size') {
                    this.state.filters.sizes = this.state.filters.sizes.filter(s => s !== val);
                }

                this.updateHashUrl();
                this.fetchProducts();
            };
        });

        document.querySelectorAll('.reset-all-filters').forEach(btn => {
            btn.onclick = () => this.resetFilters();
        });
    },

    resetFilters() {
        this.state.filters = {
            category_id: '',
            collection_id: '',
            min_price: '',
            max_price: '',
            search: '',
            colors: [],
            sizes: [],
            sort: 'newest'
        };

        const searchInput = document.getElementById('shop-search');
        if (searchInput) searchInput.value = '';

        const sortSelect = document.getElementById('shop-sort');
        if (sortSelect) sortSelect.value = 'newest';

        this.updateHashUrl();
        this.fetchProducts();
    },

    attachEvents() {
        // Search input event (debounced)
        const searchInput = document.getElementById('shop-search');
        if (searchInput) {
            let timer = null;
            searchInput.oninput = (e) => {
                clearTimeout(timer);
                timer = setTimeout(() => {
                    this.state.filters.search = e.target.value.trim();
                    this.updateHashUrl();
                    this.fetchProducts();
                }, 300);
            };
        }

        // Sort dropdown event
        const sortSelect = document.getElementById('shop-sort');
        if (sortSelect) {
            sortSelect.onchange = (e) => {
                this.state.filters.sort = e.target.value;
                this.updateHashUrl();
                this.fetchProducts();
            };
        }

        // Mobile drawer toggles
        const drawer = document.getElementById('mobile-filter-drawer');
        const openBtn = document.getElementById('toggle-mobile-filters');
        const closeBtn = document.getElementById('close-mobile-filters');
        const applyBtn = document.getElementById('apply-mobile-filters');

        if (openBtn && drawer) {
            openBtn.onclick = () => drawer.classList.remove('hidden');
        }
        if (closeBtn && drawer) {
            closeBtn.onclick = () => drawer.classList.add('hidden');
        }
        if (applyBtn && drawer) {
            applyBtn.onclick = () => drawer.classList.add('hidden');
        }

        // Category radios
        document.querySelectorAll('.filter-category-radio').forEach(radio => {
            radio.onchange = (e) => {
                this.state.filters.category_id = e.target.value;
                this.updateHashUrl();
                this.fetchProducts();
            };
        });

        // Collection radios
        document.querySelectorAll('.filter-collection-radio').forEach(radio => {
            radio.onchange = (e) => {
                this.state.filters.collection_id = e.target.value;
                this.updateHashUrl();
                this.fetchProducts();
            };
        });

        // Price min/max inputs
        document.querySelectorAll('.filter-min-price').forEach(input => {
            input.onchange = (e) => {
                this.state.filters.min_price = e.target.value;
                this.updateHashUrl();
                this.fetchProducts();
            };
        });

        document.querySelectorAll('.filter-max-price').forEach(input => {
            input.onchange = (e) => {
                this.state.filters.max_price = e.target.value;
                this.updateHashUrl();
                this.fetchProducts();
            };
        });

        // Color buttons
        document.querySelectorAll('.filter-color-btn').forEach(btn => {
            btn.onclick = () => {
                const color = btn.getAttribute('data-color');
                if (this.state.filters.colors.includes(color)) {
                    this.state.filters.colors = this.state.filters.colors.filter(c => c !== color);
                } else {
                    this.state.filters.colors.push(color);
                }
                this.fetchProducts();
            };
        });

        document.querySelectorAll('[data-toggle-colors]').forEach(btn => {
            btn.onclick = () => {
                const expanded = btn.getAttribute('aria-expanded') === 'true';
                const container = document.getElementById(btn.getAttribute('aria-controls'));
                if (!container) return;

                container.querySelectorAll('[data-color-extra]').forEach(colorButton => {
                    colorButton.classList.toggle('hidden', expanded);
                });
                btn.setAttribute('aria-expanded', String(!expanded));
                btn.textContent = expanded ? 'Show more' : 'Show less';
            };
        });

        // Size buttons
        document.querySelectorAll('.filter-size-btn').forEach(btn => {
            btn.onclick = () => {
                const size = btn.getAttribute('data-size');
                if (this.state.filters.sizes.includes(size)) {
                    this.state.filters.sizes = this.state.filters.sizes.filter(s => s !== size);
                } else {
                    this.state.filters.sizes.push(size);
                }
                this.fetchProducts();
            };
        });

        // Reset all buttons
        document.querySelectorAll('.reset-all-filters').forEach(btn => {
            btn.onclick = () => this.resetFilters();
        });
    },

    attachQuickAddEvents() {
        document.querySelectorAll('[data-quick-add]').forEach(btn => {
            btn.onclick = () => {
                const prodId = btn.getAttribute('data-quick-add');
                const target = this.state.products.find(p => String(p.id) === String(prodId));
                if (target) {
                    CartState.addItem(target, null, 1);
                    btn.classList.add('bg-[#2C2926]', 'text-white');
                    btn.innerHTML = '✓';
                    setTimeout(() => {
                        btn.classList.remove('bg-[#2C2926]', 'text-white');
                        btn.innerHTML = `<svg class="w-4 h-4 stroke-current" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.6" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>`;
                    }, 1200);
                }
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

window.ShopView = ShopView;
