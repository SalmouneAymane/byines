export const ProductsView = {
    products: [],
    categories: [],
    collections: [],

    async render() {
        try {
            const [prodRes, catRes, colRes] = await Promise.all([
                fetch('/api/admin/products.php'),
                fetch('/api/admin/categories.php'),
                fetch('/api/admin/collections.php')
            ]);

            const prods = await prodRes.json();
            const cats = await catRes.json();
            const cols = await colRes.json();

            if (prods.success) this.products = prods.data;
            if (cats.success) this.categories = cats.data;
            if (cols.success) this.collections = cols.data;
        } catch (e) {
            console.error('Failed to load products data', e);
        }

        setTimeout(() => this.attachEvents(), 0);

        return `
            <div class="space-y-8">
                <!-- Page Header -->
                <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-line">
                    <div>
                        <span class="text-[10px] uppercase tracking-[0.2em] text-stone-400 font-semibold block">Inventory & Catalog</span>
                        <h1 class="text-3xl font-serif font-normal tracking-wide text-obsidian mt-1">Product Management</h1>
                        <p class="text-xs text-muted mt-1">Manage luxury modest fashion items, variants matrix, stock levels, and gallery images.</p>
                    </div>
                    <button id="btn-open-add-product" class="bg-obsidian hover:bg-stone-800 text-white font-bold text-[11px] uppercase tracking-[0.15em] px-6 py-3.5 rounded-none transition-colors border border-obsidian flex items-center space-x-2">
                        <svg class="w-4 h-4 stroke-current" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M12 4v16m8-8H4"/></svg>
                        <span>Add Product</span>
                    </button>
                </div>

                <!-- Filters & Search Bar -->
                <div class="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 border border-line rounded-none">
                    <div class="w-full sm:w-80 relative">
                        <input type="text" id="product-search" placeholder="Search by name or SKU..." class="w-full pl-9 pr-4 py-2.5 bg-[#FAF9F6] border border-line text-xs font-sans text-obsidian focus:outline-none focus:border-obsidian rounded-none" />
                        <svg class="w-4 h-4 text-stone-400 absolute left-3 top-3 stroke-current" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                    </div>
                    <div class="flex items-center space-x-3 w-full sm:w-auto">
                        <select id="filter-category" class="px-4 py-2.5 bg-[#FAF9F6] border border-line text-xs font-sans text-obsidian focus:outline-none focus:border-obsidian rounded-none">
                            <option value="">All Categories</option>
                            ${this.categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
                        </select>
                    </div>
                </div>

                <!-- Products Table -->
                <div class="bg-white border border-line rounded-none overflow-hidden">
                    <div class="overflow-x-auto">
                        <table class="w-full text-left border-collapse" id="products-table">
                            <thead>
                                <tr class="bg-stone-50 border-b border-line text-[10px] uppercase tracking-[0.15em] text-stone-400">
                                    <th class="py-4 px-6 font-semibold">Product</th>
                                    <th class="py-4 px-6 font-semibold">SKU</th>
                                    <th class="py-4 px-6 font-semibold">Category</th>
                                    <th class="py-4 px-6 font-semibold">Price</th>
                                    <th class="py-4 px-6 font-semibold">Stock / Variants</th>
                                    <th class="py-4 px-6 font-semibold">Status</th>
                                    <th class="py-4 px-6 font-semibold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-line text-xs">
                                ${this.renderProductRows(this.products)}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- Product Add/Edit Modal -->
            <div id="product-modal" class="fixed inset-0 bg-obsidian/70 backdrop-blur-sm z-50 flex items-center justify-center hidden p-4">
                <div class="bg-white border border-stone-900 w-full max-w-3xl max-h-[90vh] overflow-y-auto p-8 rounded-none shadow-2xl relative space-y-6">
                    <div class="flex items-center justify-between border-b border-line pb-4 sticky top-0 bg-white z-10">
                        <h3 id="modal-title" class="text-xl font-serif font-normal text-obsidian">Add New Product</h3>
                        <button id="btn-close-modal" class="text-stone-400 hover:text-obsidian text-lg font-bold">✕</button>
                    </div>

                    <form id="product-form" class="space-y-6" enctype="multipart/form-data">
                        <input type="hidden" id="product-id" name="id" value="" />
                        <input type="hidden" id="product-action" name="action" value="create" />

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <!-- Left Column: Primary Details -->
                            <div class="space-y-4">
                                <div>
                                    <label class="block text-[10px] font-bold uppercase tracking-[0.15em] text-muted mb-2">Product Name *</label>
                                    <input type="text" id="product-name" name="name" required placeholder="e.g. Abaya Silk" class="w-full px-4 py-3 bg-[#FAF9F6] border border-line text-xs font-sans text-obsidian focus:outline-none focus:border-obsidian rounded-none" />
                                </div>

                                <div>
                                    <label class="block text-[10px] font-bold uppercase tracking-[0.15em] text-muted mb-2">Category *</label>
                                    <select id="product-category" name="category_id" required class="w-full px-4 py-3 bg-[#FAF9F6] border border-line text-xs font-sans text-obsidian focus:outline-none focus:border-obsidian rounded-none">
                                        <option value="">Select Category</option>
                                        ${this.categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
                                    </select>
                                </div>

                                <div class="grid grid-cols-2 gap-4">
                                    <div>
                                        <label class="block text-[10px] font-bold uppercase tracking-[0.15em] text-muted mb-2">Price ($) *</label>
                                        <input type="number" step="0.01" id="product-price" name="price" required placeholder="35.00" class="w-full px-4 py-3 bg-[#FAF9F6] border border-line text-xs font-sans text-obsidian focus:outline-none focus:border-obsidian rounded-none" />
                                    </div>
                                    <div>
                                        <label class="block text-[10px] font-bold uppercase tracking-[0.15em] text-muted mb-2">Old Price ($)</label>
                                        <input type="number" step="0.01" id="product-old-price" name="old_price" placeholder="45.00" class="w-full px-4 py-3 bg-[#FAF9F6] border border-line text-xs font-sans text-obsidian focus:outline-none focus:border-obsidian rounded-none" />
                                    </div>
                                </div>

                                <div class="grid grid-cols-2 gap-4">
                                    <div>
                                        <label class="block text-[10px] font-bold uppercase tracking-[0.15em] text-muted mb-2">SKU Code</label>
                                        <input type="text" id="product-sku" name="sku" placeholder="Auto-generated if empty" class="w-full px-4 py-3 bg-[#FAF9F6] border border-line text-xs font-mono text-obsidian focus:outline-none focus:border-obsidian rounded-none" />
                                    </div>
                                    <div>
                                        <label class="block text-[10px] font-bold uppercase tracking-[0.15em] text-muted mb-2">Status</label>
                                        <select id="product-status" name="is_active" class="w-full px-4 py-3 bg-[#FAF9F6] border border-line text-xs font-sans text-obsidian focus:outline-none focus:border-obsidian rounded-none">
                                            <option value="1">Active</option>
                                            <option value="0">Inactive / Draft</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label class="block text-[10px] font-bold uppercase tracking-[0.15em] text-muted mb-2">Description</label>
                                    <textarea id="product-description" name="description" rows="3" placeholder="Enter detailed product description..." class="w-full px-4 py-3 bg-[#FAF9F6] border border-line text-xs font-sans text-obsidian focus:outline-none focus:border-obsidian rounded-none"></textarea>
                                </div>
                            </div>

                            <!-- Right Column: Collections & Gallery -->
                            <div class="space-y-4">
                                <div>
                                    <label class="block text-[10px] font-bold uppercase tracking-[0.15em] text-muted mb-2">Assigned Collections</label>
                                    <div class="border border-line bg-[#FAF9F6] p-3 max-h-36 overflow-y-auto space-y-2 rounded-none">
                                        ${this.collections.length === 0 ? '<p class="text-[11px] text-stone-400">No collections created yet.</p>' : this.collections.map(col => `
                                            <label class="flex items-center space-x-2 text-xs text-stone-700 cursor-pointer select-none">
                                                <input type="checkbox" name="collection_ids[]" value="${col.id}" class="collection-checkbox rounded-none border-line text-obsidian focus:ring-0" />
                                                <span>${col.title}</span>
                                            </label>
                                        `).join('')}
                                    </div>
                                </div>

                                <!-- Image Uploads Section -->
                                <div>
                                    <label class="block text-[10px] font-bold uppercase tracking-[0.15em] text-muted mb-2">Product Images</label>
                                    <div id="existing-images-container" class="grid grid-cols-4 gap-2 mb-3 hidden">
                                        <!-- Rendered dynamically -->
                                    </div>
                                    <div class="border border-line bg-[#FAF9F6] p-4 text-center rounded-none space-y-3">
                                        <input type="file" id="product-files" name="images[]" multiple accept="image/jpeg,image/png,image/webp" class="block w-full text-xs text-stone-500 file:mr-4 file:py-2 file:px-3 file:rounded-none file:border-0 file:text-[10px] file:font-bold file:uppercase file:tracking-wider file:bg-obsidian file:text-white hover:file:bg-stone-800 cursor-pointer" />
                                        <p class="text-[10px] text-stone-400">Select multiple JPG, PNG, or WEBP images.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Variant Matrix Builder Section -->
                        <div class="border-t border-line pt-6">
                            <div class="flex items-center justify-between mb-4">
                                <div>
                                    <h4 class="text-sm font-serif font-semibold text-obsidian">Color & Size Variant Stock Matrix</h4>
                                    <p class="text-[11px] text-muted">Define available colors, sizes, stock quantity, and price modifiers.</p>
                                </div>
                                <button type="button" id="btn-add-variant-row" class="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-obsidian text-[10px] font-bold uppercase tracking-wider border border-line rounded-none">
                                    + Add Variant
                                </button>
                            </div>

                            <div class="border border-line overflow-hidden rounded-none">
                                <table class="w-full text-left border-collapse" id="variant-matrix-table">
                                    <thead>
                                        <tr class="bg-stone-100 border-b border-line text-[9px] uppercase tracking-[0.15em] text-stone-500">
                                            <th class="py-2.5 px-4 font-semibold">Color</th>
                                            <th class="py-2.5 px-4 font-semibold">Size</th>
                                            <th class="py-2.5 px-4 font-semibold">Stock Quantity</th>
                                            <th class="py-2.5 px-4 font-semibold">Price Mod ($)</th>
                                            <th class="py-2.5 px-4 font-semibold text-right">Remove</th>
                                        </tr>
                                    </thead>
                                    <tbody id="variant-matrix-body" class="divide-y divide-line text-xs">
                                        <!-- Variant Rows appended via JS -->
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <!-- Form Actions -->
                        <div class="pt-4 flex justify-end space-x-3 border-t border-line">
                            <button type="button" id="btn-cancel-modal" class="px-5 py-3 border border-line text-stone-600 text-[11px] font-bold uppercase tracking-wider rounded-none hover:bg-stone-50">
                                Cancel
                            </button>
                            <button type="submit" id="btn-submit-product" class="px-6 py-3 bg-obsidian text-white text-[11px] font-bold uppercase tracking-wider rounded-none hover:bg-stone-800 transition-colors">
                                Save Product
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
    },

    renderProductRows(products) {
        if (!products || products.length === 0) {
            return `
                <tr>
                    <td colspan="7" class="py-12 text-center text-stone-400">No products found in catalog. Click "Add Product" to create one.</td>
                </tr>
            `;
        }

        return products.map(prod => {
            const mainImg = prod.main_image 
                ? (prod.main_image.startsWith('prod_') ? `/public/uploads/products/${prod.main_image}` : `/assets/products/${prod.main_image}`)
                : null;

            return `
                <tr class="hover:bg-stone-50/60 transition-colors" data-product-id="${prod.id}">
                    <td class="py-4 px-6">
                        <div class="flex items-center space-x-3">
                            <div class="w-12 h-14 bg-stone-100 border border-line flex items-center justify-center overflow-hidden rounded-none shrink-0">
                                ${mainImg ? `
                                    <img src="${mainImg}" alt="${prod.name}" class="w-full h-full object-cover" onerror="this.parentElement.innerHTML='<span class=\\'text-[9px] text-stone-400\\'>No Img</span>';" />
                                ` : `
                                    <svg class="w-5 h-5 text-stone-300 stroke-current" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                                `}
                            </div>
                            <div>
                                <span class="font-semibold text-obsidian block">${prod.name}</span>
                                <span class="text-[10px] text-stone-400 font-mono block">${prod.slug}</span>
                            </div>
                        </div>
                    </td>
                    <td class="py-4 px-6 font-mono text-[11px] text-stone-600">${prod.sku}</td>
                    <td class="py-4 px-6 text-stone-700">${prod.category_name || '—'}</td>
                    <td class="py-4 px-6 font-medium">
                        <span class="text-obsidian">$${parseFloat(prod.price).toFixed(2)}</span>
                        ${prod.old_price ? `<span class="text-stone-400 line-through text-[11px] ml-1.5">$${parseFloat(prod.old_price).toFixed(2)}</span>` : ''}
                    </td>
                    <td class="py-4 px-6">
                        <div class="space-y-1">
                            <span class="inline-block px-2.5 py-0.5 bg-stone-100 text-stone-800 text-[10px] font-bold uppercase tracking-wider border border-line rounded-none">
                                ${prod.total_stock} units
                            </span>
                            <span class="text-[10px] text-stone-400 block">${prod.variants_count} variant(s)</span>
                        </div>
                    </td>
                    <td class="py-4 px-6">
                        ${prod.is_active == 1 
                            ? `<span class="inline-flex items-center px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-stone-900 text-white border border-stone-900">Active</span>`
                            : `<span class="inline-flex items-center px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-stone-100 text-stone-500 border border-line">Draft</span>`
                        }
                    </td>
                    <td class="py-4 px-6 text-right space-x-3">
                        <button data-action="edit" data-id="${prod.id}" class="text-obsidian hover:underline text-xs font-semibold uppercase tracking-wider transition-colors">
                            Edit
                        </button>
                        <button data-action="delete" data-id="${prod.id}" data-name="${prod.name}" class="text-stone-400 hover:text-red-600 text-xs font-semibold uppercase tracking-wider transition-colors">
                            Delete
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    },

    attachEvents() {
        const modal = document.getElementById('product-modal');
        const modalTitle = document.getElementById('modal-title');
        const form = document.getElementById('product-form');
        const btnOpenAdd = document.getElementById('btn-open-add-product');
        const btnClose = document.getElementById('btn-close-modal');
        const btnCancel = document.getElementById('btn-cancel-modal');
        const btnAddVariant = document.getElementById('btn-add-variant-row');
        const variantBody = document.getElementById('variant-matrix-body');
        const searchInput = document.getElementById('product-search');
        const categoryFilter = document.getElementById('filter-category');

        // Filter / Search logic
        const filterProducts = () => {
            const query = searchInput.value.toLowerCase().trim();
            const catId = categoryFilter.value;

            const filtered = this.products.filter(p => {
                const matchesQuery = p.name.toLowerCase().includes(query) || p.sku.toLowerCase().includes(query);
                const matchesCat = !catId || String(p.category_id) === String(catId);
                return matchesQuery && matchesCat;
            });

            document.querySelector('#products-table tbody').innerHTML = this.renderProductRows(filtered);
            this.attachTableActionEvents();
        };

        if (searchInput) searchInput.oninput = filterProducts;
        if (categoryFilter) categoryFilter.onchange = filterProducts;

        // Variant row builder helper
        const addVariantRow = (variant = { color: 'Default', size: 'M', stock_quantity: 10, price_modifier: '0.00', id: '' }) => {
            const tr = document.createElement('tr');
            tr.className = 'hover:bg-stone-50 transition-colors';
            tr.innerHTML = `
                <td class="py-2 px-3">
                    <input type="hidden" name="variant_ids[]" value="${variant.id || ''}" />
                    <input type="text" name="variant_colors[]" value="${variant.color}" placeholder="Color (e.g. Black)" class="w-full px-2.5 py-1.5 bg-white border border-line text-xs rounded-none focus:outline-none focus:border-obsidian" />
                </td>
                <td class="py-2 px-3">
                    <input type="text" name="variant_sizes[]" value="${variant.size}" placeholder="Size (e.g. M)" class="w-full px-2.5 py-1.5 bg-white border border-line text-xs rounded-none focus:outline-none focus:border-obsidian" />
                </td>
                <td class="py-2 px-3">
                    <input type="number" min="0" name="variant_stocks[]" value="${variant.stock_quantity}" class="w-full px-2.5 py-1.5 bg-white border border-line text-xs rounded-none focus:outline-none focus:border-obsidian" />
                </td>
                <td class="py-2 px-3">
                    <input type="number" step="0.01" name="variant_price_mods[]" value="${variant.price_modifier}" class="w-full px-2.5 py-1.5 bg-white border border-line text-xs rounded-none focus:outline-none focus:border-obsidian" />
                </td>
                <td class="py-2 px-3 text-right">
                    <button type="button" class="btn-remove-variant-row text-stone-400 hover:text-red-600 text-xs font-bold px-2">✕</button>
                </td>
            `;
            tr.querySelector('.btn-remove-variant-row').onclick = () => tr.remove();
            variantBody.appendChild(tr);
        };

        if (btnAddVariant) {
            btnAddVariant.onclick = () => addVariantRow();
        }

        const openModal = async (mode = 'create', productId = null) => {
            form.reset();
            variantBody.innerHTML = '';
            document.getElementById('existing-images-container').classList.add('hidden');
            document.getElementById('existing-images-container').innerHTML = '';

            // Reset collection checkboxes
            document.querySelectorAll('.collection-checkbox').forEach(cb => cb.checked = false);

            document.getElementById('product-action').value = mode;
            document.getElementById('product-id').value = productId || '';

            if (mode === 'create') {
                modalTitle.textContent = 'Add New Product';
                addVariantRow({ color: 'Default', size: 'M', stock_quantity: 10, price_modifier: '0.00' });
                modal.classList.remove('hidden');
            } else if (mode === 'update' && productId) {
                modalTitle.textContent = 'Edit Product & Variants';
                try {
                    const res = await fetch(`/api/admin/products.php?id=${productId}`);
                    const result = await res.json();
                    if (result.success) {
                        const p = result.data;
                        document.getElementById('product-name').value = p.name || '';
                        document.getElementById('product-category').value = p.category_id || '';
                        document.getElementById('product-price').value = p.price || '';
                        document.getElementById('product-old-price').value = p.old_price || '';
                        document.getElementById('product-sku').value = p.sku || '';
                        document.getElementById('product-status').value = p.is_active;
                        document.getElementById('product-description').value = p.description || '';

                        // Populate collections checkboxes
                        if (p.collection_ids && Array.isArray(p.collection_ids)) {
                            document.querySelectorAll('.collection-checkbox').forEach(cb => {
                                if (p.collection_ids.includes(parseInt(cb.value))) {
                                    cb.checked = true;
                                }
                            });
                        }

                        // Render existing images
                        if (p.images && p.images.length > 0) {
                            const imgContainer = document.getElementById('existing-images-container');
                            imgContainer.classList.remove('hidden');
                            imgContainer.innerHTML = p.images.map(img => {
                                const src = img.image_name.startsWith('prod_') 
                                    ? `/public/uploads/products/${img.image_name}` 
                                    : `/assets/products/${img.image_name}`;
                                return `
                                    <div class="relative group border border-line bg-stone-100 overflow-hidden h-20 rounded-none">
                                        <img src="${src}" class="w-full h-full object-cover" />
                                        ${img.is_main == 1 ? '<span class="absolute top-1 left-1 bg-obsidian text-white text-[8px] uppercase tracking-wider font-bold px-1.5 py-0.5">Main</span>' : ''}
                                        <div class="absolute inset-0 bg-obsidian/60 opacity-0 group-hover:opacity-100 flex items-center justify-center space-x-2 transition-opacity">
                                            ${img.is_main == 0 ? `<button type="button" data-action="set-main-img" data-img-id="${img.id}" class="text-white text-[9px] font-bold uppercase underline">Main</button>` : ''}
                                            <button type="button" data-action="del-img" data-img-id="${img.id}" class="text-red-400 text-[9px] font-bold uppercase underline">Del</button>
                                        </div>
                                    </div>
                                `;
                            }).join('');

                            // Attach Image action listeners inside modal
                            imgContainer.querySelectorAll('[data-action="set-main-img"]').forEach(b => {
                                b.onclick = async () => {
                                    const imgId = b.getAttribute('data-img-id');
                                    await fetch(`/api/admin/products.php?action=set_main_image&id=${productId}&image_id=${imgId}`, { method: 'POST' });
                                    openModal('update', productId);
                                };
                            });
                            imgContainer.querySelectorAll('[data-action="del-img"]').forEach(b => {
                                b.onclick = async () => {
                                    const imgId = b.getAttribute('data-img-id');
                                    await fetch(`/api/admin/products.php?action=delete_image&image_id=${imgId}`, { method: 'POST' });
                                    openModal('update', productId);
                                };
                            });
                        }

                        // Populate variants
                        if (p.variants && p.variants.length > 0) {
                            p.variants.forEach(v => addVariantRow(v));
                        } else {
                            addVariantRow({ color: 'Default', size: 'M', stock_quantity: 10, price_modifier: '0.00' });
                        }
                    }
                } catch (e) {
                    console.error('Failed to fetch product details', e);
                }
                modal.classList.remove('hidden');
            }
        };

        const closeModal = () => modal.classList.add('hidden');

        if (btnOpenAdd) btnOpenAdd.onclick = () => openModal('create');
        if (btnClose) btnClose.onclick = closeModal;
        if (btnCancel) btnCancel.onclick = closeModal;

        this.attachTableActionEvents(openModal);

        // Form Submission
        if (form) {
            form.onsubmit = async (e) => {
                e.preventDefault();
                const submitBtn = document.getElementById('btn-submit-product');
                submitBtn.disabled = true;
                submitBtn.textContent = 'SAVING...';

                const formData = new FormData(form);

                // Reconstruct variants array from parallel inputs
                const variantColors = formData.getAll('variant_colors[]');
                const variantSizes = formData.getAll('variant_sizes[]');
                const variantStocks = formData.getAll('variant_stocks[]');
                const variantMods = formData.getAll('variant_price_mods[]');
                const variantIds = formData.getAll('variant_ids[]');

                const variantsArray = [];
                for (let i = 0; i < variantColors.length; i++) {
                    if (variantColors[i] || variantSizes[i]) {
                        variantsArray.push({
                            id: variantIds[i] || null,
                            color: variantColors[i] || 'Default',
                            size: variantSizes[i] || 'M',
                            stock_quantity: parseInt(variantStocks[i] || 0),
                            price_modifier: parseFloat(variantMods[i] || 0.00)
                        });
                    }
                }

                formData.set('variants', JSON.stringify(variantsArray));

                try {
                    const res = await fetch('/api/admin/products.php', {
                        method: 'POST',
                        body: formData
                    });
                    const result = await res.json();
                    if (result.success) {
                        closeModal();
                        window.location.reload();
                    } else {
                        alert(result.message || (result.errors ? result.errors.join(', ') : 'Error saving product'));
                        submitBtn.disabled = false;
                        submitBtn.textContent = 'SAVE PRODUCT';
                    }
                } catch (err) {
                    alert('Failed to connect to product server');
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'SAVE PRODUCT';
                }
            };
        }
    },

    attachTableActionEvents(openModalFn) {
        document.querySelectorAll('#products-table [data-action="edit"]').forEach(btn => {
            btn.onclick = () => {
                const id = btn.getAttribute('data-id');
                if (openModalFn) openModalFn('update', id);
            };
        });

        document.querySelectorAll('#products-table [data-action="delete"]').forEach(btn => {
            btn.onclick = async () => {
                const id = btn.getAttribute('data-id');
                const name = btn.getAttribute('data-name');
                if (confirm(`Are you sure you want to delete product "${name}"?`)) {
                    try {
                        const res = await fetch(`/api/admin/products.php?action=delete&id=${id}`, { method: 'POST' });
                        const result = await res.json();
                        if (result.success) {
                            window.location.reload();
                        } else {
                            alert(result.message || 'Failed to delete product');
                        }
                    } catch (e) {
                        alert('Error connecting to products API');
                    }
                }
            };
        });
    }
};
