import { CartState } from '../cart.js';
import { i18n } from '../i18n.js';

export const ProductDetailView = {
    state: {
        product: null,
        variants: [],
        relatedProducts: [],
        selectedColor: '',
        selectedSize: '',
        selectedVariant: null,
        activeImageIndex: 0,
        quantity: 1,
        loading: true,
        error: null
    },

    async render(productIdOrSlug) {
        this.state.loading = true;
        this.state.error = null;
        this.state.quantity = 1;

        const paramKey = isNaN(productIdOrSlug) ? 'slug' : 'id';

        try {
            const res = await fetch(`/api/storefront/product_detail.php?${paramKey}=${encodeURIComponent(productIdOrSlug)}`);
            const result = await res.json();

            if (result.success && result.data.product) {
                this.state.product = result.data.product;
                this.state.variants = result.data.variants || [];
                this.state.relatedProducts = result.data.related_products || [];

                // Initialize default selected color & size
                if (this.state.variants.length > 0) {
                    const firstVar = this.state.variants[0];
                    this.state.selectedColor = firstVar.color !== 'Default' ? firstVar.color : '';
                    this.state.selectedSize = firstVar.size;
                    this.updateSelectedVariant();
                }
            } else {
                this.state.error = result.message || 'Product not found';
            }
        } catch (e) {
            console.error('Failed to load product detail', e);
            this.state.error = 'Failed to load product details.';
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

        if (this.state.error || !this.state.product) {
            return `
                <div class="max-w-4xl mx-auto px-6 py-20 text-center space-y-4">
                    <h2 class="text-3xl font-serif text-[#2C2926]">Product Not Found</h2>
                    <p class="text-xs text-[#7A7672]">${this.escapeHtml(this.state.error || 'The requested product does not exist.')}</p>
                    <div>
                        <a href="#shop" class="inline-block bg-[#2C2926] text-white text-xs font-semibold uppercase tracking-widest px-8 py-3.5 hover:bg-black transition-colors">
                            Return to Shop
                        </a>
                    </div>
                </div>
            `;
        }

        const p = this.state.product;
        const images = (p.images && p.images.length > 0) ? p.images : [];
        const activeImgObj = images[this.state.activeImageIndex] || null;
        
        let mainImgSrc = activeImgObj 
            ? (activeImgObj.image_name.startsWith('prod_') ? `/public/uploads/products/${activeImgObj.image_name}` : `/assets/products/${activeImgObj.image_name}`)
            : (p.main_image ? (p.main_image.startsWith('prod_') ? `/public/uploads/products/${p.main_image}` : `/assets/products/${p.main_image}`) : 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1200&q=80');

        // Available distinct colors & sizes
        const colors = [...new Set(this.state.variants.map(v => v.color).filter(c => c && c !== 'Default'))];
        const sizes = [...new Set(this.state.variants.map(v => v.size).filter(s => s))];

        const selectedVar = this.state.selectedVariant;
        const priceModifier = selectedVar ? parseFloat(selectedVar.price_modifier || 0) : 0;
        const currentPrice = parseFloat(p.price) + priceModifier;

        const inStock = selectedVar ? selectedVar.stock_quantity > 0 : (p.total_stock > 0 || this.state.variants.length === 0);
        const stockQty = selectedVar ? selectedVar.stock_quantity : (p.total_stock || 0);

        return `
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16 font-sans">
                
                <!-- Breadcrumb Navigation -->
                <nav class="flex items-center space-x-2 text-xs text-[#7A7672]">
                    <a href="#home" class="hover:text-[#2C2926]">Home</a>
                    <span>/</span>
                    <a href="#shop?category=${p.category_id}" class="hover:text-[#2C2926]">${this.escapeHtml(p.category_name || 'Catalog')}</a>
                    <span>/</span>
                    <span class="text-[#2C2926] font-medium truncate max-w-xs">${this.escapeHtml(p.name)}</span>
                </nav>

                <!-- Product Showcase Grid (Left: Gallery, Right: Details) -->
                <div class="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
                    
                    <!-- Left Column: Gallery (Lg 7 cols) -->
                    <div class="lg:col-span-7 space-y-4">
                        
                        <!-- Main Viewport Image with Zoom Frame -->
                        <div class="relative aspect-[3/4] bg-[#EFECE6] border border-[#E5E2DC] overflow-hidden group">
                            <img 
                                id="product-main-view-image"
                                src="${mainImgSrc}" 
                                onerror="this.src='https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1200&q=80';" 
                                alt="${this.escapeHtml(p.name)}" 
                                class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            <span class="absolute top-4 left-4 bg-white/95 backdrop-blur border border-[#E5E2DC] text-[10px] uppercase tracking-wider text-[#2C2926] px-3 py-1 font-semibold">
                                ${this.escapeHtml(p.category_name || 'Modest Collection')}
                            </span>
                        </div>

                        <!-- Thumbnails Row -->
                        ${images.length > 1 ? `
                            <div class="flex items-center gap-3 overflow-x-auto pb-2">
                                ${images.map((img, idx) => {
                                    const thumbSrc = img.image_name.startsWith('prod_') 
                                        ? `/public/uploads/products/${img.image_name}` 
                                        : `/assets/products/${img.image_name}`;
                                    const isActive = idx === this.state.activeImageIndex;
                                    return `
                                        <button 
                                            type="button"
                                            data-thumb-index="${idx}"
                                            class="w-20 aspect-[3/4] border transition-all cursor-pointer overflow-hidden shrink-0 ${isActive ? 'border-[#2C2926] ring-1 ring-[#2C2926]' : 'border-[#E5E2DC] opacity-70 hover:opacity-100'}"
                                        >
                                            <img src="${thumbSrc}" onerror="this.src='https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80';" alt="" class="w-full h-full object-cover" />
                                        </button>
                                    `;
                                }).join('')}
                            </div>
                        ` : ''}
                    </div>

                    <!-- Right Column: Details & Actions (Lg 5 cols) -->
                    <div class="lg:col-span-5 space-y-6">
                        
                        <div class="space-y-2 border-b border-[#E5E2DC] pb-6">
                            <span class="text-[10px] uppercase tracking-[0.2em] text-[#7A7672] font-semibold">SKU: ${this.escapeHtml(p.sku)}</span>
                            <h1 class="text-3xl sm:text-4xl font-serif text-[#2C2926] leading-tight font-normal">
                                ${this.escapeHtml(p.name)}
                            </h1>
                            <div class="flex items-center space-x-3 pt-2">
                                <span class="text-2xl font-serif font-medium text-[#2C2926]">
                                    $${currentPrice.toFixed(2)}
                                </span>
                                ${p.old_price ? `
                                    <span class="text-base text-[#7A7672] line-through font-sans">$${parseFloat(p.old_price).toFixed(2)}</span>
                                ` : ''}
                            </div>
                        </div>

                        <!-- Stock Status Badge -->
                        <div class="flex items-center space-x-2 text-xs">
                            <span class="w-2 h-2 rounded-full ${inStock ? 'bg-emerald-600' : 'bg-rose-600'}"></span>
                            <span class="${inStock ? 'text-emerald-700' : 'text-rose-700'} font-semibold uppercase tracking-wider">
                                ${inStock ? (stockQty > 0 ? `In Stock (${stockQty} units)` : 'Available') : 'Out of Stock'}
                            </span>
                        </div>

                        <!-- Color Swatch Selector -->
                        ${colors.length > 0 ? `
                            <div class="space-y-2.5">
                                <label class="text-xs uppercase tracking-wider font-semibold text-[#2C2926] flex items-center justify-between">
                                    <span>Color: <strong class="font-normal text-[#7A7672]">${this.escapeHtml(this.state.selectedColor || 'Select Color')}</strong></span>
                                </label>
                                <div class="flex flex-wrap gap-2.5">
                                    ${colors.map(color => {
                                        const isSelected = this.state.selectedColor === color;
                                        return `
                                            <button 
                                                type="button" 
                                                data-select-color="${this.escapeHtml(color)}"
                                                class="px-4 py-2 text-xs border font-medium uppercase tracking-wider transition-all cursor-pointer ${isSelected ? 'bg-[#2C2926] text-white border-[#2C2926]' : 'bg-white text-[#5D5F5F] border-[#E5E2DC] hover:border-[#2C2926]'}"
                                            >
                                                ${this.escapeHtml(color)}
                                            </button>
                                        `;
                                    }).join('')}
                                </div>
                            </div>
                        ` : ''}

                        <!-- Size Selector -->
                        ${sizes.length > 0 ? `
                            <div class="space-y-2.5">
                                <label class="text-xs uppercase tracking-wider font-semibold text-[#2C2926] flex items-center justify-between">
                                    <span>Size: <strong class="font-normal text-[#7A7672]">${this.escapeHtml(this.state.selectedSize || 'Select Size')}</strong></span>
                                    <a href="#about" class="text-[11px] underline text-[#7A7672] hover:text-[#2C2926]">Size Guide</a>
                                </label>
                                <div class="flex flex-wrap gap-2.5">
                                    ${sizes.map(size => {
                                        const isSelected = this.state.selectedSize === size;
                                        return `
                                            <button 
                                                type="button" 
                                                data-select-size="${this.escapeHtml(size)}"
                                                class="w-12 h-11 text-xs border font-mono font-semibold transition-all cursor-pointer ${isSelected ? 'bg-[#2C2926] text-white border-[#2C2926]' : 'bg-white text-[#5D5F5F] border-[#E5E2DC] hover:border-[#2C2926]'}"
                                            >
                                                ${this.escapeHtml(size)}
                                            </button>
                                        `;
                                    }).join('')}
                                </div>
                            </div>
                        ` : ''}

                        <!-- Quantity Selector & Action Buttons -->
                        <div class="space-y-4 pt-2">
                            <div class="flex items-center space-x-4">
                                <!-- Stepper Box -->
                                <div class="flex items-center border border-[#E5E2DC] bg-white h-12">
                                    <button type="button" id="qty-minus" class="w-10 h-full flex items-center justify-center text-stone-600 hover:bg-stone-100 transition-colors text-sm font-semibold">-</button>
                                    <span id="qty-val" class="w-12 text-center text-xs font-semibold text-[#2C2926] select-none">${this.state.quantity}</span>
                                    <button type="button" id="qty-plus" class="w-10 h-full flex items-center justify-center text-stone-600 hover:bg-stone-100 transition-colors text-sm font-semibold">+</button>
                                </div>

                                <!-- Add to Bag Primary Button -->
                                <button 
                                    type="button" 
                                    id="btn-add-to-cart"
                                    ${!inStock ? 'disabled' : ''}
                                    class="flex-1 h-12 bg-[#2C2926] text-white text-xs font-semibold uppercase tracking-[0.18em] hover:bg-black disabled:bg-stone-300 disabled:cursor-not-allowed transition-all shadow-sm flex items-center justify-center space-x-2"
                                >
                                    <svg class="w-4 h-4 stroke-current" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
                                    <span>${inStock ? i18n.t('product.add_to_bag') : i18n.t('product.out_of_stock')}</span>
                                </button>
                            </div>

                            <!-- Buy Now COD Button -->
                            <a 
                                href="#checkout" 
                                id="btn-buy-now"
                                class="w-full h-12 border border-[#2C2926] text-[#2C2926] text-xs font-semibold uppercase tracking-[0.18em] flex items-center justify-center hover:bg-[#2C2926] hover:text-white transition-colors"
                            >
                                ${i18n.t('product.cod_checkout')}
                            </a>
                        </div>

                        <!-- Accordion Information Tabs -->
                        <div class="border-t border-[#E5E2DC] pt-6 space-y-4">
                            
                            <!-- Description -->
                            <div class="border-b border-[#E5E2DC] pb-4">
                                <h3 class="text-xs font-semibold uppercase tracking-wider text-[#2C2926] mb-2">${i18n.t('product.desc_title')}</h3>
                                <p class="text-xs text-[#7A7672] leading-relaxed">
                                    ${this.escapeHtml(p.description)}
                                </p>
                            </div>

                            <!-- Moroccan COD Delivery Details -->
                            <div class="border-b border-[#E5E2DC] pb-4">
                                <h3 class="text-xs font-semibold uppercase tracking-wider text-[#2C2926] mb-2">${i18n.t('product.cod_title')}</h3>
                                <p class="text-xs text-[#7A7672] leading-relaxed">
                                    ${i18n.t('product.cod_desc')}
                                </p>
                            </div>

                            <!-- Care Guide -->
                            <div>
                                <h3 class="text-xs font-semibold uppercase tracking-wider text-[#2C2926] mb-2">${i18n.t('product.care_title')}</h3>
                                <p class="text-xs text-[#7A7672] leading-relaxed">
                                    ${i18n.t('product.care_desc')}
                                </p>
                            </div>
                        </div>

                    </div>
                </div>

                <!-- Related Products Section -->
                ${this.state.relatedProducts.length > 0 ? `
                    <div class="border-t border-[#E5E2DC] pt-12 space-y-8">
                        <h2 class="text-2xl font-serif text-[#2C2926] text-center font-normal">
                            You May Also Like
                        </h2>

                        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            ${this.state.relatedProducts.map(rel => {
                                const relImg = rel.main_image 
                                    ? (rel.main_image.startsWith('prod_') ? `/public/uploads/products/${rel.main_image}` : `/assets/products/${rel.main_image}`)
                                    : 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80';

                                return `
                                    <div class="group space-y-3">
                                        <div class="aspect-[3/4] bg-[#EFECE6] overflow-hidden border border-[#E5E2DC]/60 group-hover:border-[#2C2926]/40 transition-colors">
                                            <a href="#product/${rel.id}" class="block w-full h-full">
                                                <img src="${relImg}" onerror="this.src='https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80';" alt="${this.escapeHtml(rel.name)}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                            </a>
                                        </div>
                                        <div>
                                            <a href="#product/${rel.id}" class="font-serif text-sm text-[#2C2926] hover:underline block truncate">
                                                ${this.escapeHtml(rel.name)}
                                            </a>
                                            <span class="text-xs text-[#7A7672] font-sans mt-0.5 block">
                                                $${parseFloat(rel.price).toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                ` : ''}

            </div>
        `;
    },

    updateSelectedVariant() {
        if (!this.state.variants || this.state.variants.length === 0) {
            this.state.selectedVariant = null;
            return;
        }

        const match = this.state.variants.find(v => {
            const colorMatch = !this.state.selectedColor || v.color === this.state.selectedColor || v.color === 'Default';
            const sizeMatch = !this.state.selectedSize || v.size === this.state.selectedSize;
            return colorMatch && sizeMatch;
        });

        this.state.selectedVariant = match || this.state.variants[0];
    },

    attachEvents() {
        // Thumbnail click listener
        document.querySelectorAll('[data-thumb-index]').forEach(btn => {
            btn.onclick = () => {
                const idx = parseInt(btn.getAttribute('data-thumb-index'), 10);
                this.state.activeImageIndex = idx;
                const images = this.state.product?.images || [];
                const imgObj = images[idx];
                const mainImg = document.getElementById('product-main-view-image');
                if (mainImg && imgObj) {
                    const src = imgObj.image_name.startsWith('prod_') 
                        ? `/public/uploads/products/${imgObj.image_name}` 
                        : `/assets/products/${imgObj.image_name}`;
                    mainImg.src = src;
                }
            };
        });

        // Color swatch selector
        document.querySelectorAll('[data-select-color]').forEach(btn => {
            btn.onclick = () => {
                const color = btn.getAttribute('data-select-color');
                this.state.selectedColor = color;
                this.updateSelectedVariant();

                // Check if an image matches this color
                const images = this.state.product?.images || [];
                const colorImgIdx = images.findIndex(img => img.color === color);
                if (colorImgIdx !== -1) {
                    this.state.activeImageIndex = colorImgIdx;
                }

                this.reRenderView();
            };
        });

        // Size selector
        document.querySelectorAll('[data-select-size]').forEach(btn => {
            btn.onclick = () => {
                const size = btn.getAttribute('data-select-size');
                this.state.selectedSize = size;
                this.updateSelectedVariant();
                this.reRenderView();
            };
        });

        // Quantity stepper
        const btnMinus = document.getElementById('qty-minus');
        const btnPlus = document.getElementById('qty-plus');
        const qtyVal = document.getElementById('qty-val');

        if (btnMinus) {
            btnMinus.onclick = () => {
                if (this.state.quantity > 1) {
                    this.state.quantity--;
                    if (qtyVal) qtyVal.textContent = this.state.quantity;
                }
            };
        }

        if (btnPlus) {
            btnPlus.onclick = () => {
                const max = this.state.selectedVariant ? this.state.selectedVariant.stock_quantity : 99;
                if (this.state.quantity < max || max === 0) {
                    this.state.quantity++;
                    if (qtyVal) qtyVal.textContent = this.state.quantity;
                }
            };
        }

        // Add to Cart Action
        const btnAdd = document.getElementById('btn-add-to-cart');
        if (btnAdd) {
            btnAdd.onclick = () => {
                if (this.state.product) {
                    CartState.addItem(this.state.product, this.state.selectedVariant, this.state.quantity);
                    btnAdd.classList.add('bg-emerald-800');
                    btnAdd.innerHTML = '✓ ADDED TO BAG';
                    setTimeout(() => {
                        btnAdd.classList.remove('bg-emerald-800');
                        btnAdd.innerHTML = `<svg class="w-4 h-4 stroke-current" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg><span>ADD TO BAG</span>`;
                    }, 1500);
                }
            };
        }

        // Buy Now Button
        const btnBuy = document.getElementById('btn-buy-now');
        if (btnBuy) {
            btnBuy.onclick = () => {
                if (this.state.product) {
                    CartState.addItem(this.state.product, this.state.selectedVariant, this.state.quantity);
                }
            };
        }
    },

    async reRenderView() {
        const app = document.getElementById('app');
        if (app) {
            app.innerHTML = await this.render(this.state.product.id);
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

window.ProductDetailView = ProductDetailView;
