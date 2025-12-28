/**
 * English Academy - Routing & Protocol System
 * Handles navigation, broken link redirection, and progress tracking.
 * Updated: enable client-side link validation and robust URL resolution.
 */

const Router = {
    // Configuration
    config: {
        errorPage: '/Menud/error/Error404.html',
        maintenancePage: '/Menud/error/maintenance.html',
        noDisponiblePage: '/Menud/error/NoDisponible.html',
        rootPath: '', // kept for backwards compatibility
    },

    init() {
        this.calculateRootPath();
        this.bindLinks();
        this.applyProtocols();
        console.log("English Academy Router Initialized");
    },

    calculateRootPath() {
        const path = window.location.pathname;
        const depth = (path.match(/\//g) || []).length;
        const upLevels = depth - 1;
        this.config.rootPath = '../'.repeat(Math.max(0, upLevels));
    },

    async checkPath(url) {
        // Try HEAD first; fallback to GET. Use a timeout to avoid long hangs.
        const timeoutMs = 3000;
        try {
            const controller = new AbortController();
            const id = setTimeout(() => controller.abort(), timeoutMs);

            // Some servers don't allow HEAD; we'll try HEAD then GET if needed.
            let response = await fetch(url, { method: 'HEAD', signal: controller.signal });
            clearTimeout(id);
            if (response && response.ok) return true;
        } catch (e) {
            // swallow and try GET fallback
        }

        try {
            const controller = new AbortController();
            const id = setTimeout(() => controller.abort(), timeoutMs);
            const response = await fetch(url, { method: 'GET', signal: controller.signal });
            clearTimeout(id);
            return response && response.ok;
        } catch (e) {
            return false;
        }
    },

    bindLinks() {
        document.addEventListener('click', async (e) => {
            const link = e.target.closest('a');
            if (!link) return;

            // Allow modifier + click, non-primary buttons, and _blank targets to behave normally
            if (link.target === '_blank' || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;

            const href = link.getAttribute('href');
            if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('javascript:')) {
                return; // external or anchor or javascript — don't intercept
            }

            // In local file protocol, fetch will not work reliably. Let native navigation occur.
            if (window.location.protocol === 'file:') {
                return; // allow default navigation
            }

            // Internal link validation protocol
            e.preventDefault();

            // Resolve the href relative to current location to form an absolute URL
            let resolvedUrl;
            try {
                resolvedUrl = new URL(href, window.location.href).href;
            } catch (err) {
                // If URL can't be resolved, redirect to configured 404
                window.location.href = new URL(this.config.errorPage, window.location.origin).href;
                return;
            }

            const exists = await this.checkPath(resolvedUrl);
            if (exists) {
                window.location.href = resolvedUrl;
            } else {
                // Redirect to the absolute 404 page
                window.location.href = new URL(this.config.errorPage, window.location.origin).href;
            }
        });
    },

    applyProtocols() {
        // Protocol: Progress Tracking
        this.initProgressTracking();
        
        // Protocol: UI Consistency (Auto-inject footer if missing)
        this.ensureFooter();
    },

    initProgressTracking() {
        const page = window.location.pathname.split('/').pop();
        if (page && page.endsWith('.html')) {
            let progress = JSON.parse(localStorage.getItem('ea_progress') || '{}');
            progress[page] = (progress[page] || 0) + 1;
            localStorage.setItem('ea_progress', JSON.stringify(progress));
        }
    },

    ensureFooter() {
        if (!document.querySelector('footer')) {
            const footer = document.createElement('footer');
            footer.className = 'mt-12 pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center text-gray-400 text-sm pb-8 px-6';
            footer.innerHTML = `
                <p>© 2025 English Academy - Tu progreso cuenta.</p>
                <div class="flex space-x-4 mt-4 md:mt-0">
                    <a href="#" class="hover:text-blue-600">Soporte</a>
                    <a href="#" class="hover:text-blue-600">Protocolo de Privacidad</a>
                </div>
            `;
            document.body.appendChild(footer);
        }
    }
};

document.addEventListener('DOMContentLoaded', () => Router.init());