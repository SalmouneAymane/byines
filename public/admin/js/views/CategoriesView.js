export const CategoriesView = {
    async render() {
        let categories = [];
        try {
            const res = await fetch('/api/admin/categories.php');
            const result = await res.json();
            if (result.success) {
                categories = result.data;
            }
        } catch (e) {
            console.error('Failed to fetch categories', e);
        }

        setTimeout(() => this.attachEvents(), 0);

        return `
            <div class="space-y-8">
                <!-- Page Header -->
                <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-line">
                    <div>
                        <span class="text-[10px] uppercase tracking-[0.2em] text-stone-400 font-semibold block">Catalog Organization</span>
                        <h1 class="text-3xl font-serif font-normal tracking-wide text-obsidian mt-1">Category Management</h1>
                        <p class="text-xs text-muted mt-1">Manage product categories and upload category banner images.</p>
                    </div>
                    <button id="btn-open-add-modal" class="bg-obsidian hover:bg-stone-800 text-white font-bold text-[11px] uppercase tracking-[0.15em] px-6 py-3.5 rounded-none transition-colors border border-obsidian flex items-center space-x-2">
                        <svg class="w-4 h-4 stroke-current" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M12 4v16m8-8H4"/></svg>
                        <span>Add Category</span>
                    </button>
                </div>

                <!-- Category Data Table (Ethos Monolith Editorial Table) -->
                <div class="bg-white border border-line rounded-none overflow-hidden">
                    <div class="overflow-x-auto">
                        <table class="w-full text-left border-collapse">
                            <thead>
                                <tr class="bg-stone-50 border-b border-line text-[10px] uppercase tracking-[0.15em] text-stone-400">
                                    <th class="py-4 px-6 font-semibold">Image</th>
                                    <th class="py-4 px-6 font-semibold">Name</th>
                                    <th class="py-4 px-6 font-semibold">Slug</th>
                                    <th class="py-4 px-6 font-semibold">Products</th>
                                    <th class="py-4 px-6 font-semibold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-line text-xs">
                                ${categories.length === 0 ? `
                                    <tr>
                                        <td colspan="5" class="py-12 text-center text-stone-400">No categories found. Click "Add Category" to create one.</td>
                                    </tr>
                                ` : categories.map(cat => {
                                    const imgSrc = cat.image_url 
                                        ? (cat.image_url.startsWith('cat_') ? `/public/uploads/categories/${cat.image_url}` : `/assets/categories/${cat.image_url}`)
                                        : null;
                                    return `
                                    <tr class="hover:bg-stone-50/60 transition-colors">
                                        <td class="py-4 px-6">
                                            <div class="w-12 h-12 bg-stone-100 border border-line flex items-center justify-center overflow-hidden rounded-none">
                                                ${imgSrc ? `
                                                    <img src="${imgSrc}" alt="${cat.name}" class="w-full h-full object-cover" onerror="this.parentElement.innerHTML='<span class=\\'text-[9px] text-stone-400\\'>No Img</span>';" />
                                                ` : `
                                                    <svg class="w-5 h-5 text-stone-300 stroke-current" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                                                `}
                                            </div>
                                        </td>
                                        <td class="py-4 px-6 font-semibold text-obsidian">${cat.name}</td>
                                        <td class="py-4 px-6 text-muted font-mono text-[11px]">${cat.slug}</td>
                                        <td class="py-4 px-6">
                                            <span class="inline-block px-2.5 py-1 bg-stone-100 text-stone-800 text-[10px] font-bold uppercase tracking-wider border border-line rounded-none">
                                                ${cat.products_count} Items
                                            </span>
                                        </td>
                                        <td class="py-4 px-6 text-right space-x-4">
                                            <button data-action="edit" data-id="${cat.id}" data-name="${cat.name}" data-slug="${cat.slug}" data-image="${cat.image_url || ''}" class="text-obsidian hover:underline text-xs font-semibold uppercase tracking-wider transition-colors">
                                                Edit
                                            </button>
                                            <button data-action="delete" data-id="${cat.id}" data-name="${cat.name}" class="text-stone-400 hover:text-red-600 text-xs font-semibold uppercase tracking-wider transition-colors">
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                    `;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- Add/Edit Category Modal (Sharp 90° Corners, File Upload) -->
            <div id="category-modal" class="fixed inset-0 bg-obsidian/70 backdrop-blur-sm z-50 flex items-center justify-center hidden p-4">
                <div class="bg-white border border-stone-900 w-full max-w-md p-8 rounded-none shadow-2xl relative space-y-6">
                    <div class="flex items-center justify-between border-b border-line pb-4">
                        <h3 id="modal-title" class="text-xl font-serif font-normal text-obsidian">Add New Category</h3>
                        <button id="btn-close-modal" class="text-stone-400 hover:text-obsidian text-lg font-bold">✕</button>
                    </div>

                    <form id="category-form" class="space-y-5" enctype="multipart/form-data">
                        <input type="hidden" id="category-id" name="id" value="" />
                        <input type="hidden" id="category-action" name="action" value="create" />
                        <input type="hidden" id="existing-image-url" name="existing_image_url" value="" />

                        <div>
                            <label class="block text-[10px] font-bold uppercase tracking-[0.15em] text-muted mb-2">Category Name</label>
                            <input type="text" id="category-name" name="name" required placeholder="e.g. Abayas" class="w-full px-4 py-3 bg-[#FAF9F6] border border-line text-xs font-sans text-obsidian focus:outline-none focus:border-obsidian rounded-none" />
                        </div>

                        <div>
                            <label class="block text-[10px] font-bold uppercase tracking-[0.15em] text-muted mb-2">Slug (URL)</label>
                            <input type="text" id="category-slug" name="slug" placeholder="e.g. abayas (auto-generated if empty)" class="w-full px-4 py-3 bg-[#FAF9F6] border border-line text-xs font-mono text-obsidian focus:outline-none focus:border-obsidian rounded-none" />
                        </div>

                        <!-- Image File Upload Control -->
                        <div>
                            <label class="block text-[10px] font-bold uppercase tracking-[0.15em] text-muted mb-2">Upload Image File</label>
                            <div class="border border-line bg-[#FAF9F6] p-4 text-center rounded-none space-y-3">
                                <div id="image-preview-box" class="w-20 h-20 bg-stone-200 border border-line mx-auto flex items-center justify-center overflow-hidden hidden">
                                    <img id="image-preview" src="" alt="Preview" class="w-full h-full object-cover" />
                                </div>
                                <input type="file" id="category-file" name="image_file" accept="image/jpeg,image/png,image/webp" class="block w-full text-xs text-stone-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-none file:border-0 file:text-[10px] file:font-bold file:uppercase file:tracking-wider file:bg-obsidian file:text-white hover:file:bg-stone-800 cursor-pointer" />
                                <p class="text-[10px] text-stone-400">Accepted formats: JPG, PNG, WEBP (Max: 5MB)</p>
                            </div>
                        </div>

                        <div class="pt-4 flex justify-end space-x-3 border-t border-line">
                            <button type="button" id="btn-cancel-modal" class="px-5 py-3 border border-line text-stone-600 text-[11px] font-bold uppercase tracking-wider rounded-none hover:bg-stone-50">
                                Cancel
                            </button>
                            <button type="submit" id="btn-submit-form" class="px-6 py-3 bg-obsidian text-white text-[11px] font-bold uppercase tracking-wider rounded-none hover:bg-stone-800 transition-colors">
                                Save Category
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
    },

    attachEvents() {
        const modal = document.getElementById('category-modal');
        const modalTitle = document.getElementById('modal-title');
        const form = document.getElementById('category-form');
        const btnOpenAdd = document.getElementById('btn-open-add-modal');
        const btnClose = document.getElementById('btn-close-modal');
        const btnCancel = document.getElementById('btn-cancel-modal');
        const fileInput = document.getElementById('category-file');
        const previewBox = document.getElementById('image-preview-box');
        const previewImg = document.getElementById('image-preview');

        // File preview handler
        if (fileInput) {
            fileInput.onchange = (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        previewImg.src = event.target.result;
                        previewBox.classList.remove('hidden');
                    };
                    reader.readAsDataURL(file);
                }
            };
        }

        const openModal = (mode = 'create', data = {}) => {
            form.reset();
            document.getElementById('category-action').value = mode;
            document.getElementById('category-id').value = data.id || '';
            document.getElementById('category-name').value = data.name || '';
            document.getElementById('category-slug').value = data.slug || '';
            document.getElementById('existing-image-url').value = data.image_url || '';

            if (data.image_url) {
                const imgSrc = data.image_url.startsWith('cat_') 
                    ? `/public/uploads/categories/${data.image_url}` 
                    : `/assets/categories/${data.image_url}`;
                previewImg.src = imgSrc;
                previewBox.classList.remove('hidden');
            } else {
                previewBox.classList.add('hidden');
            }

            modalTitle.textContent = mode === 'create' ? 'Add New Category' : 'Edit Category';
            modal.classList.remove('hidden');
        };

        const closeModal = () => {
            modal.classList.add('hidden');
        };

        if (btnOpenAdd) btnOpenAdd.onclick = () => openModal('create');
        if (btnClose) btnClose.onclick = closeModal;
        if (btnCancel) btnCancel.onclick = closeModal;

        // Edit & Delete Handlers
        document.querySelectorAll('[data-action="edit"]').forEach(btn => {
            btn.onclick = () => {
                const id = btn.getAttribute('data-id');
                const name = btn.getAttribute('data-name');
                const slug = btn.getAttribute('data-slug');
                const image_url = btn.getAttribute('data-image');
                openModal('update', { id, name, slug, image_url });
            };
        });

        document.querySelectorAll('[data-action="delete"]').forEach(btn => {
            btn.onclick = async () => {
                const id = btn.getAttribute('data-id');
                const name = btn.getAttribute('data-name');
                if (confirm(`Are you sure you want to delete category "${name}"?`)) {
                    try {
                        const res = await fetch('/api/admin/categories.php', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ action: 'delete', id: id })
                        });
                        const result = await res.json();
                        if (result.success) {
                            window.location.reload();
                        } else {
                            alert(result.message || 'Failed to delete category');
                        }
                    } catch (e) {
                        alert('Error connecting to category API');
                    }
                }
            };
        });

        // Multipart Form Submit Handler
        if (form) {
            form.onsubmit = async (e) => {
                e.preventDefault();
                const submitBtn = document.getElementById('btn-submit-form');
                submitBtn.disabled = true;
                submitBtn.textContent = 'SAVING...';

                const formData = new FormData(form);

                try {
                    const res = await fetch('/api/admin/categories.php', {
                        method: 'POST',
                        body: formData
                    });
                    const result = await res.json();
                    if (result.success) {
                        closeModal();
                        window.location.reload();
                    } else {
                        alert(result.message || 'Error saving category');
                        submitBtn.disabled = false;
                        submitBtn.textContent = 'SAVE CATEGORY';
                    }
                } catch (e) {
                    alert('Failed to connect to server');
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'SAVE CATEGORY';
                }
            };
        }
    }
};
