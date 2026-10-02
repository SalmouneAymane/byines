import { HomeView } from './views/HomeView.js';
import { AboutView } from './views/AboutView.js';
import { ShopView } from './views/ShopView.js';
import { ProductDetailView } from './views/ProductDetailView.js';
import { CheckoutView } from './views/CheckoutView.js';
import { AccountView } from './views/AccountView.js';
import { CartDrawer } from './components/CartDrawer.js';
import { AuthModal } from './components/AuthModal.js';
import { i18n } from './i18n.js';
import { CartState } from './cart.js';

// Temporary module placeholders to be expanded in upcoming micro-phases
const PlaceholderView = (title, description) => ({
    render: async () => `
        <div class="max-w-4xl mx-auto px-6 py-20 text-center space-y-4">
            <span class="text-[10px] uppercase tracking-[0.25em] text-stone-400 font-semibold block">Storefront SPA</span>
            <h1 class="text-3xl font-serif font-normal text-obsidian">${title}</h1>
            <p class="text-xs text-stone-500 max-w-md mx-auto">${description}</p>
            <div class="pt-6">
                <a href="#shop" class="inline-block bg-obsidian text-white text-[11px] font-bold uppercase tracking-[0.15em] px-8 py-3.5 rounded-none hover:bg-stone-800 transition-colors">
                    Explore Catalog
                </a>
            </div>
        </div>
    `
});

export class StorefrontRouter {
    constructor() {
        this.appContainer = document.getElementById('app');
        window.addEventListener('hashchange', () => this.handleRoute());
        window.addEventListener('cart-updated', () => this.updateCartBadge());
        window.addEventListener('language-changed', () => this.handleRoute());
    }

    async handleRoute() {
        const hash = window.location.hash.replace('#', '').trim();
        const routeParts = hash.split('/');
        const mainRoute = routeParts[0] || 'home';
        const routeParam = routeParts[1] || null;

        // Dynamic view matching
        let view = null;
        if (mainRoute === '' || mainRoute === 'home') {
            view = HomeView;
        } else if (mainRoute.startsWith('shop') || mainRoute === 'abayas' || mainRoute === 'scarfs' || mainRoute === 'collections') {
            view = ShopView;
        } else if (mainRoute === 'product' && routeParam) {
            view = ProductDetailView;
        } else if (mainRoute === 'checkout') {
            view = CheckoutView;
        } else if (mainRoute === 'account') {
            view = AccountView;
        } else if (mainRoute === 'about') {
            view = AboutView;
        } else {
            view = HomeView;
        }

        // Scroll to top on navigation
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // Update active navigation state
        document.querySelectorAll('[data-nav-link]').forEach(link => {
            const target = link.getAttribute('data-nav-link');
            if (target === mainRoute) {
                link.classList.add('border-b-2', 'border-obsidian', 'text-obsidian');
                link.classList.remove('text-stone-500');
            } else {
                link.classList.remove('border-b-2', 'border-obsidian', 'text-obsidian');
                link.classList.add('text-stone-500');
            }
        });

        // Update header nav labels dynamically via i18n
        const newArrivalsEl = document.querySelector('[data-nav-link="shop"]');
        const collectionsEl = document.querySelector('[data-nav-link="collections"]');
        const aboutEl = document.querySelector('[data-nav-link="about"]');

        if (newArrivalsEl) newArrivalsEl.textContent = i18n.t('nav.new_arrivals');
        if (collectionsEl) collectionsEl.textContent = i18n.t('nav.collections');
        if (aboutEl) aboutEl.textContent = i18n.t('nav.about');

        // Render target view into container
        if (this.appContainer) {
            this.appContainer.innerHTML = `
                <div class="flex items-center justify-center min-h-[50vh]">
                    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-900"></div>
                </div>
            `;
            this.appContainer.innerHTML = await view.render(routeParam);
        }

        this.updateCartBadge();
    }

    updateCartBadge() {
        const total = CartState.getTotalCount();
        document.querySelectorAll('.cart-badge-count').forEach(el => {
            el.textContent = total;
        });
    }

    init() {
        i18n.init();
        CartDrawer.init();
        AuthModal.init();
        this.handleRoute();
        this.updateCartBadge();
    }
}
