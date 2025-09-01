// js/modules/router.js

let routes = {};
let appRoot = null;

function handleRouteChange() {
    const hash = window.location.hash || '#dashboard';
    const renderView = routes[hash];

    if (appRoot && typeof renderView === 'function') {
        appRoot.innerHTML = '';
        try {
            renderView(appRoot);
            appRoot.classList.add('view-fade-in');
            setTimeout(() => appRoot.classList.remove('view-fade-in'), 300);
        } catch (error) {
            console.error(`Erro ao renderizar a rota ${hash}:`, error);
            appRoot.innerHTML = `<div class="text-center text-red-500 p-8">
                <h2 class="text-xl font-bold">Ocorreu um Erro</h2>
                <p>Não foi possível carregar esta seção. Tente novamente mais tarde.</p>
            </div>`;
            // Garante que os ícones sejam renderizados mesmo na tela de erro
            if (window.lucide) {
                setTimeout(() => window.lucide.createIcons(), 0);
            }
        }
    }
}

export function initRouter(definedRoutes, rootElement) {
    routes = definedRoutes;
    appRoot = rootElement;
    window.addEventListener('load', handleRouteChange);
    window.addEventListener('hashchange', handleRouteChange);
}