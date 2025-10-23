import { onAuthChange, getPalhacoByCardId, getPalhacos } from './services/firebase-service.js';
import { renderIndvCard, renderLogin, renderAdmin, renderNotFound, renderSpinner } from './ui/components.js';
import { initCarousel, attachLoginEvents, attachAdminEvents, attachGlobalEvents } from './ui/events.js';
import { getParamId } from './utils.js';

const mainContainer = document.getElementById('main');

async function router() {
    const idParam = getParamId();

    if (idParam) {
        // View individual card
        renderSpinner(mainContainer, true);
        const palhaco = await getPalhacoByCardId(idParam);
        if (palhaco) {
            mainContainer.innerHTML = renderIndvCard(palhaco);
            initCarousel();
        } else {
            mainContainer.innerHTML = renderNotFound();
        }
    } else {
        // Check auth state for Admin/Login view
        onAuthChange(async (user) => {
            if (user) {
                renderSpinner(mainContainer);
                const palhacos = await getPalhacos();
                mainContainer.innerHTML = renderAdmin(palhacos);
                attachAdminEvents();
            } else {
                mainContainer.innerHTML = renderLogin();
                attachLoginEvents();
            }
        });
    }
}

// --- App Initialization ---

// Attach events that are always present (like the modal background click)
attachGlobalEvents();
// Start the router
router();