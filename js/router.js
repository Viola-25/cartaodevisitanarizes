// js/router.js
import { renderHomePage, renderClownCard, renderAdminPanel } from './ui-renderers.js';

export function router() {
    const hash = window.location.hash;
    if (hash.startsWith('#/palhaco/')) {
        renderClownCard(hash.split('/')[2]);
    } else if (hash === '#admin') {
        renderAdminPanel();
    } else {
        renderHomePage();
    }
}
