export const AuthState = {
    currentUser: null,

    async checkAuth() {
        try {
            const res = await fetch('/api/storefront/auth.php?action=me');
            const result = await res.json();
            if (result.success) {
                this.currentUser = result.data;
                window.dispatchEvent(new CustomEvent('user-auth-changed', { detail: { user: this.currentUser } }));
            }
        } catch (e) {
            console.error('Failed to check auth status', e);
            this.currentUser = null;
        }
        return this.currentUser;
    },

    async logout() {
        try {
            await fetch('/api/storefront/auth.php?action=logout', { method: 'POST' });
        } catch (e) {
            console.error('Logout request failed', e);
        } finally {
            this.currentUser = null;
            window.dispatchEvent(new CustomEvent('user-auth-changed', { detail: { user: null } }));
        }
    }
};

export const AuthModal = {
    isOpen: false,
    mode: 'login', // 'login' or 'signup'

    init() {
        this.injectModalContainer();
        this.attachGlobalListeners();
        AuthState.checkAuth();
    },

    injectModalContainer() {
        if (document.getElementById('auth-modal-root')) return;

        const modalHtml = `
            <div id="auth-modal-root" class="relative z-50">
                <!-- Backdrop Overlay -->
                <div 
                    id="auth-modal-backdrop" 
                    class="fixed inset-0 bg-black/50 backdrop-blur-sm opacity-0 pointer-events-none transition-opacity duration-300 flex items-center justify-center p-4"
                >
                    <!-- Modal Card Container -->
                    <div 
                        id="auth-modal-card" 
                        class="w-full max-w-md bg-white border border-[#E5E2DC] shadow-2xl transform scale-95 transition-transform duration-300 ease-out overflow-hidden"
                    >
                        <div id="auth-modal-inner"></div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHtml);
    },

    attachGlobalListeners() {
        // Global listener for auth profile button click in header
        document.addEventListener('click', (e) => {
            const btn = e.target.closest('[data-open-auth]');
            if (btn) {
                e.preventDefault();
                if (AuthState.currentUser) {
                    window.location.hash = '#account';
                } else {
                    this.open('login');
                }
            }
        });

        // Backdrop click closes modal
        const backdrop = document.getElementById('auth-modal-backdrop');
        if (backdrop) {
            backdrop.onclick = (e) => {
                if (e.target === backdrop) this.close();
            };
        }

        // Update nav badge on auth change
        window.addEventListener('user-auth-changed', (e) => {
            this.updateUserNavIcon(e.detail.user);
        });
    },

    open(mode = 'login') {
        this.mode = mode;
        this.isOpen = true;
        this.renderContent();

        const backdrop = document.getElementById('auth-modal-backdrop');
        const card = document.getElementById('auth-modal-card');

        if (backdrop && card) {
            backdrop.classList.remove('opacity-0', 'pointer-events-none');
            backdrop.classList.add('opacity-100');
            card.classList.remove('scale-95');
            card.classList.add('scale-100');
        }
    },

    close() {
        this.isOpen = false;
        const backdrop = document.getElementById('auth-modal-backdrop');
        const card = document.getElementById('auth-modal-card');

        if (backdrop && card) {
            backdrop.classList.remove('opacity-100');
            backdrop.classList.add('opacity-0', 'pointer-events-none');
            card.classList.remove('scale-100');
            card.classList.add('scale-95');
        }
    },

    renderContent() {
        const inner = document.getElementById('auth-modal-inner');
        if (!inner) return;

        const isLogin = this.mode === 'login';

        inner.innerHTML = `
            <div class="p-6 sm:p-8 space-y-6 font-sans relative">
                
                <!-- Close Button -->
                <button id="close-auth-modal" aria-label="Close modal" class="absolute top-4 right-4 text-[#7A7672] hover:text-[#2C2926]">
                    <svg class="w-6 h-6 stroke-current" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                </button>

                <!-- Modal Header -->
                <div class="text-center space-y-2">
                    <span class="text-[10px] uppercase tracking-[0.25em] text-[#7A7672] font-semibold block">Storefront Account</span>
                    <h2 class="font-serif text-2xl text-[#2C2926] font-normal">
                        ${isLogin ? 'Welcome Back' : 'Create Your Account'}
                    </h2>
                    <p class="text-xs text-[#7A7672] max-w-xs mx-auto leading-relaxed">
                        ${isLogin ? 'Sign in to access your order history and saved addresses.' : 'Join ByInes for faster checkout and exclusive modest fashion stories.'}
                    </p>
                </div>

                <!-- Tab Toggle -->
                <div class="flex border-b border-[#E5E2DC] text-xs font-semibold uppercase tracking-wider">
                    <button id="tab-login" class="flex-1 py-3 text-center transition-colors border-b-2 ${isLogin ? 'border-[#2C2926] text-[#2C2926]' : 'border-transparent text-[#7A7672] hover:text-[#2C2926]'}">
                        Sign In
                    </button>
                    <button id="tab-signup" class="flex-1 py-3 text-center transition-colors border-b-2 ${!isLogin ? 'border-[#2C2926] text-[#2C2926]' : 'border-transparent text-[#7A7672] hover:text-[#2C2926]'}">
                        Create Account
                    </button>
                </div>

                <!-- Error Box -->
                <div id="auth-error-box" class="hidden p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-sans"></div>

                <!-- Auth Form -->
                <form id="auth-form" class="space-y-4">
                    
                    ${!isLogin ? `
                        <div class="grid grid-cols-2 gap-3">
                            <div class="space-y-1">
                                <label for="auth_first_name" class="text-xs font-medium text-[#2C2926]">First Name</label>
                                <input 
                                    type="text" 
                                    id="auth_first_name" 
                                    name="first_name" 
                                    required 
                                    placeholder="First Name" 
                                    class="w-full bg-white border border-[#E5E2DC] p-2.5 text-xs text-[#2C2926] focus:outline-none focus:border-[#2C2926] rounded-none"
                                />
                            </div>
                            <div class="space-y-1">
                                <label for="auth_last_name" class="text-xs font-medium text-[#2C2926]">Last Name</label>
                                <input 
                                    type="text" 
                                    id="auth_last_name" 
                                    name="last_name" 
                                    required 
                                    placeholder="Last Name" 
                                    class="w-full bg-white border border-[#E5E2DC] p-2.5 text-xs text-[#2C2926] focus:outline-none focus:border-[#2C2926] rounded-none"
                                />
                            </div>
                        </div>
                    ` : ''}

                    <!-- Email Input -->
                    <div class="space-y-1">
                        <label for="auth_email" class="text-xs font-medium text-[#2C2926]">Email Address</label>
                        <input 
                            type="email" 
                            id="auth_email" 
                            name="email" 
                            required 
                            placeholder="name@example.com" 
                            class="w-full bg-white border border-[#E5E2DC] p-2.5 text-xs text-[#2C2926] focus:outline-none focus:border-[#2C2926] rounded-none"
                        />
                    </div>

                    ${!isLogin ? `
                        <!-- Phone Input -->
                        <div class="space-y-1">
                            <label for="auth_phone" class="text-xs font-medium text-[#2C2926]">Moroccan Phone Number</label>
                            <input 
                                type="tel" 
                                id="auth_phone" 
                                name="phone" 
                                placeholder="06XXXXXXXX" 
                                class="w-full bg-white border border-[#E5E2DC] p-2.5 text-xs text-[#2C2926] focus:outline-none focus:border-[#2C2926] rounded-none"
                            />
                        </div>
                    ` : ''}

                    <!-- Password Input -->
                    <div class="space-y-1">
                        <label for="auth_password" class="text-xs font-medium text-[#2C2926]">Password</label>
                        <input 
                            type="password" 
                            id="auth_password" 
                            name="password" 
                            required 
                            placeholder="••••••••" 
                            class="w-full bg-white border border-[#E5E2DC] p-2.5 text-xs text-[#2C2926] focus:outline-none focus:border-[#2C2926] rounded-none"
                        />
                    </div>

                    <!-- Submit Action Button -->
                    <div class="pt-2">
                        <button 
                            type="submit" 
                            id="auth-submit-btn" 
                            class="w-full h-12 bg-[#2C2926] text-white text-xs font-semibold uppercase tracking-[0.18em] hover:bg-black transition-colors shadow-sm flex items-center justify-center"
                        >
                            <span>${isLogin ? 'SIGN IN' : 'CREATE ACCOUNT'}</span>
                        </button>
                    </div>

                </form>

                <!-- Footer Switch Link -->
                <div class="text-center text-xs text-[#7A7672] pt-2 border-t border-[#E5E2DC]">
                    ${isLogin ? `
                        Don't have an account? 
                        <button id="switch-to-signup" class="text-[#2C2926] font-semibold underline hover:opacity-80 ml-1">
                            Create One
                        </button>
                    ` : `
                        Already registered? 
                        <button id="switch-to-login" class="text-[#2C2926] font-semibold underline hover:opacity-80 ml-1">
                            Sign In
                        </button>
                    `}
                </div>

            </div>
        `;

        this.attachFormEvents();
    },

    attachFormEvents() {
        const closeBtn = document.getElementById('close-auth-modal');
        if (closeBtn) closeBtn.onclick = () => this.close();

        const tabLogin = document.getElementById('tab-login');
        const tabSignup = document.getElementById('tab-signup');
        const switchToSignup = document.getElementById('switch-to-signup');
        const switchToLogin = document.getElementById('switch-to-login');

        if (tabLogin) tabLogin.onclick = () => this.open('login');
        if (tabSignup) tabSignup.onclick = () => this.open('signup');
        if (switchToSignup) switchToSignup.onclick = () => this.open('signup');
        if (switchToLogin) switchToLogin.onclick = () => this.open('login');

        const form = document.getElementById('auth-form');
        const errorBox = document.getElementById('auth-error-box');
        const submitBtn = document.getElementById('auth-submit-btn');

        if (form) {
            form.onsubmit = async (e) => {
                e.preventDefault();
                errorBox.classList.add('hidden');
                errorBox.textContent = '';

                const isLogin = this.mode === 'login';
                const action = isLogin ? 'login' : 'signup';
                const formData = new FormData(form);

                const payload = {};
                formData.forEach((val, key) => payload[key] = val);

                submitBtn.disabled = true;
                submitBtn.innerHTML = `<div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>`;

                try {
                    const res = await fetch(`/api/storefront/auth.php?action=${action}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });

                    const result = await res.json();

                    if (result.success) {
                        AuthState.currentUser = result.data;
                        window.dispatchEvent(new CustomEvent('user-auth-changed', { detail: { user: result.data } }));
                        this.close();
                    } else {
                        errorBox.textContent = result.message || 'Authentication failed.';
                        errorBox.classList.remove('hidden');
                    }
                } catch (err) {
                    console.error('Auth request failed', err);
                    errorBox.textContent = 'A network error occurred. Please try again.';
                    errorBox.classList.remove('hidden');
                } finally {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = `<span>${isLogin ? 'SIGN IN' : 'CREATE ACCOUNT'}</span>`;
                }
            };
        }
    },

    updateUserNavIcon(user) {
        document.querySelectorAll('[data-user-nav-label]').forEach(el => {
            if (user) {
                el.textContent = `${user.first_name}`;
            } else {
                el.textContent = 'Sign In';
            }
        });
    }
};
