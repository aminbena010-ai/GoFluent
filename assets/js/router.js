/**
 * English Academy - Routing & Protocol System
 * Handles navigation, broken link redirection, and progress tracking.
 */

const Router = {
    // Configuration
    config: {
        errorPage: 'Menud/error/Error404.html',
        maintenancePage: 'Menud/error/maintenance.html',
        noDisponiblePage: 'Menud/error/NoDisponible.html',
        rootPath: '', // Will be calculated
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
        // Adjust based on where index.html is. 
        // Assuming index.html is at the root.
        // This is a simple heuristic for static sites.
        const upLevels = depth - 1; 
        this.config.rootPath = '../'.repeat(Math.max(0, upLevels));
    },

    async checkPath(url) {
        try {
            const response = await fetch(url, { method: 'HEAD' });
            return response.ok;
        } catch (e) {
            return false;
        }
    },

    bindLinks() {
        document.addEventListener('click', async (e) => {
            const link = e.target.closest('a');
            if (!link) return;

            const href = link.getAttribute('href');
            if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('javascript:')) {
                return;
            }

            // Internal link validation protocol
            // Note: HEAD requests might not work everywhere locally (file://)
            // but on a server they work.
            /* 
            e.preventDefault();
            const exists = await this.checkPath(href);
            if (exists) {
                window.location.href = href;
            } else {
                window.location.href = this.config.rootPath + this.config.errorPage;
            }
            */
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
