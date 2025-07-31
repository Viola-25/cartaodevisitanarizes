// js/main.js
import { setupAuthListener } from './firebase-config.js';
import { router } from './router.js';
import { openModalForNew, openModalForEdit, closeModal, adicionarBloco, handleDelete, handleCopyLink } from './modal-handlers.js';

// Expor funções para o escopo global (necessário para onclick no HTML)
window.openModalForNew = openModalForNew;
window.openModalForEdit = openModalForEdit;
window.closeModal = closeModal;
window.adicionarBloco = adicionarBloco;
window.adicionarBloco.removeBlock = adicionarBloco.removeBlock; // Garante que removeBlock também esteja no escopo global
window.handleDelete = handleDelete;
window.handleCopyLink = handleCopyLink;

// Inicia o listener de autenticação e, em seguida, o roteador
setupAuthListener(router);

// Adiciona o listener para mudanças na hash da URL
window.addEventListener('hashchange', router);
