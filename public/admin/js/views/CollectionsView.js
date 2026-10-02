export const CollectionsView = {
    async render() {
        let collections = [];
        try {
            const res = await fetch('/api/admin/collections.php');
            const result = await res.json();
            if (result.success) {
                collections = result.data;
            }
        } catch (e) {
            console.error('Failed to fetch collections', e);
        }

        setTimeout(() => this.attachEvents(), 0);

        return `
            <div class="space-y-8">
                <!-- Page Header -->
                <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-line">
                    <div>
                        <span class="text-[10px] uppercase tracking-[0.2em] text-stone-400 font-semibold block">Curated Banners</span>
                        <h1 class="text-3xl font-serif font-normal tracking-wide text-obsidian mt-1">Collection Management</h1>
                        <p class="text-xs text-muted mt-1">Manage seasonal product showcases and collection banners.</p>
                    </div>
                    <button id="btn-open-add-modal" class="bg-obsidian hover:bg-stone-800 text-white font-bold text-[11px] uppercase tracking-[0.15em] px-6 py-3.5 rounded-none transition-colors border border-obsidian flex items-center space-x-2">
                        <svg class="w-4 h-4 stroke-current" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M12 4v16m8-8H4"/></svg>
                        <span>Add Collection</span>
                    </button>
                </div>

                <!-- Collection Data Table (Ethos Monolith Editorial Table) -->
                <div class="bg-white border border-line rounded-none overflow-hidden">
                    <div class="overflow-x-auto">
                        <table class="w-full text-left border-collapse">
                            <thead>
                                <tr class="bg-stone-50 border-b border-line text-[10px] uppercase tracking-[0.15em] text-stone-400">
                                    <th class="py-4 px-6 font-semibold">Banner Image</th>
                                    <th class="py-4 px-6 font-semibold">Title</th>
                                    <th class="py-4 px-6 font-semibold">Status</th>
                                    <th class="py-4 px-6 font-semibold">Products</th>
                                    <th class="py-4 px-6 font-semibold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-line text-xs">
                                ${collections.length === 0 ? `
                                    <tr>
                                        <td colspan="5" class="py-12 text-center text-stone-400">No collections found. Click "Add Collection" to create one.</td>
                                    </tr>
                                ` : collections.map(col => {
                                    const imgSrc = col.image_path 
                                        ? (col.image_path.startsWith('col_') ? `/public/uploads/collections/${col.image_path}` : `/assets/collections/${col.image_path}`)
                                        : null;
                                    return `
                                    <tr class="hover:bg-stone-50/60 transition-colors">
                                        <td class="py-4 px-6">
                                            <div class="w-20 h-10 bg-stone-100 border border-line flex items-center justify-center overflow-hidden rounded-none">
                                                ${imgSrc ? `
                                                    <img src="${imgSrc}" alt="${col.title}" class="w-full h-full object-cover" onerror="this.parentElement.innerHTML='<span class=\\'text-[9px] text-stone-400\\'>No Img</span>';" />
                                                ` : `
                                                    <svg class="w-5 h-5 text-stone-300 stroke-current" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                                                `}
                                            </div>
                                        </td>
                                        <td class="py-4 px-6 font-semibold text-obsidian">${col.title}</td>
                                        <td class="py-4 px-6">
                                            <span class="inline-block px-2.5 py-1 ${col.is_active == 1 ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-400'} text-[10px] font-bold uppercase tracking-wider rounded-none">
                                                ${col.is_active == 1 ? 'Active' : 'Hidden'}
                                            </span>
                                        </td>
                                        <td class="py-4 px-6">
                                            <span class="inline-block px-2.5 py-1 bg-stone-100 text-stone-800 text-[10px] font-bold uppercase tracking-wider border border-line rounded-none">
                                                ${col.products_count} Items
                                            </span>
                                        </td>
                                        <td class="py-4 px-6 text-right space-x-4">
                                            <button data-action="edit" data-id="${col.id}" data-title="${col.title}" data-image="${col.image_path || ''}" data-active="${col.is_active}" class="text-obsidian hover:underline text-xs font-semibold uppercase tracking-wider transition-colors">
                                                Edit
                                            </button>
                                            <button data-action="delete" data-id="${col.id}" data-title="${col.title}" class="text-stone-400 hover:text-red-600 text-xs font-semibold uppercase tracking-wider transition-colors">
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

            <!-- Add/Edit Collection Modal (Sharp 90° Corners, File Upload) -->
            <div id="collection-modal" class="fixed inset-0 bg-obsidian/70 backdrop-blur-sm z-50 flex items-center justify-center hidden p-4">
                <div class="bg-white border border-stone-900 w-full max-w-md p-8 rounded-none shadow-2xl relative space-y-6">
                    <div class="flex items-center justify-between border-b border-line pb-4">
                        <h3 id="modal-title" class="text-xl font-serif font-normal text-obsidian">Add New Collection</h3>
                        <button id="btn-close-modal" class="text-stone-400 hover:text-obsidian text-lg font-bold">✕</button>
                    </div>

                    <form id="collection-form" class="space-y-5" enctype="multipart/form-data">
                        <input type="hidden" id="collection-id" name="id" value="" />
                        <input type="hidden" id="collection-action" name="action" value="create" />
                        <input type="hidden" id="existing-image-path" name="existing_image_path" value="" />

                        <div>
                            <label class="block text-[10px] font-bold uppercase tracking-[0.15em] text-muted mb-2">Collection Title</label>
                            <input type="text" id="collection-title" name="title" required placeholder="e.g. Summer Collection" class="w-full px-4 py-3 bg-[#FAF9F6] border border-line text-xs font-sans text-obsidian focus:outline-none focus:border-obsidian rounded-none" />
                        </div>

                        <!-- Image File Upload Control -->
                        <div>
                            <label class="block text-[10px] font-bold uppercase tracking-[0.15em] text-muted mb-2">Banner Image File</label>
                            <div class="border border-line bg-[#FAF9F6] p-4 text-center rounded-none space-y-3">
                                <div id="image-preview-box" class="w-32 h-16 bg-stone-200 border border-line mx-auto flex items-center justify-center overflow-hidden hidden">
                                    <img id="image-preview" src="" alt="Preview" class="w-full h-full object-cover" />
                                </div>
                                <input type="file" id="collection-file" name="image_file" accept="image/jpeg,image/png,image/webp" class="block w-full text-xs text-stone-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-none file:border-0 file:text-[10px] file:font-bold file:uppercase file:tracking-wider file:bg-obsidian file:text-white hover:file:bg-stone-800 cursor-pointer" />
                                <p class="text-[10px] text-stone-400">Accepted formats: JPG, PNG, WEBP (Recommended: 1200x400)</p>
                            </div>
                        </div>

                        <div class="flex items-center space-x-3 pt-2">
                            <input type="checkbox" id="collection-active" name="is_active" value="1" checked class="w-4 h-4 accent-obsidian rounded-none" />
                            <label for="collection-active" class="text-xs font-medium text-obsidian">Display Collection on Storefront</label>
                        </div>

                        <div class="pt-4 flex justify-end space-x-3 border-t border-line">
                            <button type="button" id="btn-cancel-modal" class="px-5 py-3 border border-line text-stone-600 text-[11px] font-bold uppercase tracking-wider rounded-none hover:bg-stone-50">
                                Cancel
                            </button>
                            <button type="submit" id="btn-submit-form" class="px-6 py-3 bg-obsidian text-white text-[11px] font-bold uppercase tracking-wider rounded-none hover:bg-stone-800 transition-colors">
                                Save Collection
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
    },

    attachEvents() {
        const modal = document.getElementById('collection-modal');
        const modalTitle = document.getElementById('modal-title');
        const form = document.getElementById('collection-form');
        const btnOpenAdd = document.getElementById('btn-open-add-modal');
        const btnClose = document.getElementById('btn-close-modal');
        const btnCancel = document.getElementById('btn-cancel-modal');
        const fileInput = document.getElementById('collection-file');
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
            document.getElementById('collection-action').value = mode;
            document.getElementById('collection-id').value = data.id || '';
            document.getElementById('collection-title').value = data.title || '';
            document.getElementById('existing-image-path').value = data.image_path || '';
            document.getElementById('collection-active').checked = (data.is_active != 0);

            if (data.image_path) {
                const imgSrc = data.image_path.startsWith('col_') 
                    ? `/public/uploads/collections/${data.image_path}` 
                    : `/assets/collections/${data.image_path}`;
                previewImg.src = imgSrc;
                previewBox.classList.remove('hidden');
            } else {
                previewBox.classList.add('hidden');
            }

            modalTitle.textContent = mode === 'create' ? 'Add New Collection' : 'Edit Collection';
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
                const title = btn.getAttribute('data-title');
                const image_path = btn.getAttribute('data-image');
                const is_active = btn.getAttribute('data-active');
                openModal('update', { id, title, image_path, is_active });
            };
        });

        document.querySelectorAll('[data-action="delete"]').forEach(btn => {
            btn.onclick = async () => {
                const id = btn.getAttribute('data-id');
                const title = btn.getAttribute('data-title');
                if (confirm(`Are you sure you want to delete collection "${title}"?`)) {
                    try {
                        const res = await fetch('/api/admin/collections.php', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ action: 'delete', id: id })
                        });
                        const result = await res.json();
                        if (result.success) {
                            window.location.reload();
                        } else {
                            alert(result.message || 'Failed to delete collection');
                        }
                    } catch (e) {
                        alert('Error connecting to collection API');
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
                if (!document.getElementById('collection-active').checked) {
                    formData.set('is_active', '0');
                }

                try {
                    const res = await fetch('/api/admin/collections.php', {
                        method: 'POST',
                        body: formData
                    });
                    const result = await res.json();
                    if (result.success) {
                        closeModal();
                        window.location.reload();
                    } else {
                        alert(result.message || 'Error saving collection');
                        submitBtn.disabled = false;
                        submitBtn.textContent = 'SAVE COLLECTION';
                    }
                } catch (e) {
                    alert('Failed to connect to server');
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'SAVE COLLECTION';
                }
            };
        }
    }
};
