import { DashboardView } from './views/DashboardView.js';
import { CategoriesView } from './views/CategoriesView.js';
import { CollectionsView } from './views/CollectionsView.js';
import { ProductsView } from './views/ProductsView.js';
import { OrdersView } from './views/OrdersView.js';

const PlaceholderView = (title, description) => ({
    render: async () => `
        <div class="bg-white p-10 border border-line rounded-none text-center">
            <h2 class="text-2xl font-serif font-normal text-obsidian">${title}</h2>
            <p class="text-stone-500 text-xs mt-2">${description}</p>
            <div class="mt-6 inline-block bg-stone-100 text-stone-800 text-[10px] font-bold uppercase tracking-[0.15em] px-4 py-2 border border-line rounded-none">
                Ready for Phase Implementation
            </div>
        </div>
    `
});

const routes = {
    '': DashboardView,
    'dashboard': DashboardView,
    'categories': CategoriesView,
    'collections': CollectionsView,
    'products': ProductsView,
    'orders': OrdersView
};

export class AdminRouter {
    constructor() {
        this.appContainer = document.getElementById('admin-app');
        window.addEventListener('hashchange', () => this.handleRoute());
    }

    async checkAdminAuth() {
        try {
            const res = await fetch('/api/storefront/auth.php?action=me');
            const result = await res.json();
            if (result.success && result.data && result.data.role === 'admin') {
                return result.data;
            }
        } catch (e) {
            console.error('Failed to verify admin status', e);
        }
        return null;
    }

    async handleRoute() {
        if (!this.appContainer) return;

        // Show spinner during auth check
        this.appContainer.innerHTML = `
            <div class="flex items-center justify-center min-h-[400px]">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-900"></div>
            </div>
        `;

        // Perform RBAC check
        const adminUser = await this.checkAdminAuth();

        if (!adminUser) {
            this.renderAccessDeniedScreen();
            return;
        }

        // Update header user profile badge
        this.updateHeaderProfileBadge(adminUser);

        const hash = window.location.hash.replace('#', '').trim();
        const routeKey = hash.split('?')[0];
        const view = routes[routeKey] || routes['dashboard'];

        // Update active sidebar nav styling
        document.querySelectorAll('[data-nav]').forEach(link => {
            const navKey = link.getAttribute('data-nav');
            if (navKey === (routeKey || 'dashboard')) {
                link.classList.add('bg-stone-800', 'text-white', 'border-r-2', 'border-white');
                link.classList.remove('text-stone-400', 'hover:bg-stone-800/50', 'hover:text-stone-200');
            } else {
                link.classList.remove('bg-stone-800', 'text-white', 'border-r-2', 'border-white');
                link.classList.add('text-stone-400', 'hover:bg-stone-800/50', 'hover:text-stone-200');
            }
        });

        this.appContainer.innerHTML = await view.render();
    }

    renderAccessDeniedScreen() {
        if (!this.appContainer) return;

        this.appContainer.innerHTML = `
            <div class="max-w-3xl mx-auto my-12 p-10 bg-white border border-line rounded-none text-center space-y-6 shadow-sm">
                <div class="w-16 h-16 bg-rose-50 border border-rose-200 text-rose-600 font-bold flex items-center justify-center mx-auto text-2xl">
                    !
                </div>
                
                <div class="space-y-2">
                    <span class="text-[10px] uppercase font-bold tracking-[0.2em] text-rose-600 block">Restricted Access</span>
                    <h1 class="text-3xl font-serif text-obsidian">Administrator Authorization Required</h1>
                    <p class="text-xs text-stone-500 max-w-md mx-auto leading-relaxed">
                        You are not signed in with an Administrator account. The Store Management Portal is strictly reserved for store administrators.
                    </p>
                </div>

                <div class="pt-4 flex items-center justify-center gap-4 flex-wrap">
                    <a href="/public/index.html" class="bg-obsidian text-white text-xs font-semibold uppercase tracking-widest px-8 py-3.5 hover:bg-stone-800 transition-colors">
                        Go to Storefront Website
                    </a>
                    <a href="/public/index.html#account" class="border border-obsidian text-obsidian text-xs font-semibold uppercase tracking-widest px-8 py-3.5 hover:bg-obsidian hover:text-white transition-colors">
                        Customer Account Portal
                    </a>
                </div>
            </div>
        `;
    }

    updateHeaderProfileBadge(user) {
        const avatar = document.getElementById('admin-header-avatar');
        if (avatar && user) {
            avatar.textContent = `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`;
        }
        const nameEl = document.getElementById('admin-header-name');
        if (nameEl && user) {
            nameEl.textContent = `${user.first_name} ${user.last_name}`;
        }
    }

    init() {
        this.handleRoute();
    }
}
