// js/ui-renderers.js
import { db, appId, storage } from './firebase-config.js';
import { collection, doc, onSnapshot, getDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";
import { ref, deleteObject } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-storage.js";
import { showCustomModal } from './modal-handlers.js'; // Importa o modal customizado

// Elementos do DOM (podem ser passados como parâmetros ou importados de um arquivo de utilidades de DOM)
const appContainer = document.getElementById('app-container');

// --- Ícones SVG ---
const icons = {
    clownNose: `<svg class="w-28 h-28 text-yellow-500 drop-shadow-lg" viewBox="0 0 24 24" fill="currentColor"><path d="M12,2C6.48,2,2,6.48,2,12s4.48,10,10,10,10-4.48,10-10S17.52,2,12,2Zm0,18c-4.41,0-8-3.59-8-8s3.59-8,8-8,8,3.59,8,8-3.59,8-8,8Z" /><path d="M12,6c-3.31,0-6,2.69-6,6s2.69,6,6,6,6-2.69,6-6-2.69-6-6-6Z" /></svg>`,
    copy: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>`,
    edit: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z"></path></svg>`,
    trash: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>`,
    add: `<svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>`,
    instagram: `<svg class="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 24 24"><path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4c0 3.2-2.6 5.8-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8C2 4.6 4.6 2 7.8 2zm-.2 2.7C5.5 4.9 4.9 5.5 4.7 7.2v8.6c.2 1.7.8 2.3 2.9 2.5h8.6c1.7-.2 2.3-.8 2.5-2.9V7.2c-.2-1.7-.8-2.3-2.9-2.5H7.6zM12 7a5 5 0 100 10 5 5 0 000-10zm0 8a3 3 0 110-6 3 3 0 010 6zm5.2-8.2a1.2 1.2 0 100 2.4 1.2 1.2 0 000-2.4z"/></svg>`
};

export function renderLoading(text = 'Carregando...') {
    appContainer.innerHTML = `
        <div class="flex flex-col justify-center items-center h-screen">
            <div class="animate-spin rounded-full h-32 w-32 border-b-4 border-yellow-500"></div>
            <p class="mt-4 text-lg text-gray-600">${text}</p>
        </div>
    `;
}

export function renderHomePage() {
    appContainer.innerHTML = `
        <div class="flex flex-col justify-center items-center text-center p-4 min-h-screen">
            ${icons.clownNose}
            <h1 class="text-6xl font-bold text-gray-800 mt-6 font-comfortaa leading-tight">Cartões de Visita dos Palhaços</h1>
            <p class="text-xl text-gray-600 mt-4 max-w-lg">Conheça os voluntários que espalham alegria e transformam vidas!</p>
            <div class="mt-12 box-container max-w-md">
                <h2 class="text-2xl font-semibold text-gray-800 font-comfortaa mb-4">Acesso para Coordenadores</h2>
                <a href="#admin" class="btn-primary inline-block">Gerenciar Cartões</a>
            </div>
        </div>
    `;
}

export async function renderClownCard(clownId) {
    renderLoading('Buscando o sorriso do palhaço...');
    try {
        const docRef = doc(db, `artifacts/${appId}/public/data/clowns`, clownId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            const blocosHtml = (data.blocos || []).map(bloco => {
                if (bloco.tipo === 'link') {
                    return `<div class="p-4 bg-blue-50 rounded-xl shadow-sm border border-blue-100">
                                <a href="${bloco.conteudo}" target="_blank" rel="noopener noreferrer" class="block w-full text-center bg-blue-500 text-white font-bold py-3 px-4 rounded-full hover:bg-blue-600 transition-all shadow-md text-lg">${bloco.titulo}</a>
                            </div>`;
                }
                if (bloco.tipo === 'video') {
                    const videoId = bloco.conteudo.split('v=')[1]?.split('&')[0] || bloco.conteudo.split('/').pop();
                    return `
                        <div class="p-4 bg-red-50 rounded-xl shadow-sm border border-red-100">
                            <h3 class="font-bold text-xl mb-3 text-gray-800">${bloco.titulo}</h3>
                            <div class="relative pt-[56.25%]"> <!-- 16:9 Aspect Ratio -->
                                <iframe src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen class="absolute top-0 left-0 w-full h-full rounded-lg shadow-lg"></iframe>
                            </div>
                        </div>`;
                }
                return `<div class="p-5 bg-yellow-50 rounded-xl shadow-sm border border-yellow-100">
                            <h3 class="font-bold text-xl text-gray-900 mb-2">${bloco.titulo}</h3>
                            <p class="text-gray-700 whitespace-pre-wrap leading-relaxed">${bloco.conteudo}</p>
                        </div>`;
            }).join('');

            appContainer.innerHTML = `
                <div class="min-h-screen flex items-center justify-center p-4">
                    <div class="w-full max-w-xl card-clown my-8">
                        <div class="h-64 bg-cover bg-center relative" style="background-image: url('${data.fotoUrl || 'https://placehold.co/600x300/ffe082/c53030?text=Foto+de+Capa'}')">
                            <div class="absolute inset-0 bg-gradient-to-t from-yellow-500/40 to-transparent"></div>
                        </div>
                        <div class="p-8 text-center -mt-24 relative z-10">
                            <img src="${data.fotoUrl || 'https://placehold.co/200x200/ffe082/c53030?text=?'}" alt="Foto de ${data.nomePalhaco}" class="w-40 h-40 rounded-full object-cover mx-auto ring-8 ring-white shadow-xl border-4 border-yellow-300">
                            <div class="box-container p-6 mt-6">
                                <h1 class="text-5xl font-bold text-gray-800 font-comfortaa leading-tight">${data.nomePalhaco}</h1>
                                <p class="text-xl text-yellow-600 font-semibold mt-2">${data.profissao}</p>
                            </div>
                            <div class="box-container p-6 mt-8 text-left">
                                <h2 class="text-2xl font-bold text-gray-800 mb-4 font-comfortaa">Sobre Mim</h2>
                                <p class="text-gray-700 whitespace-pre-wrap leading-relaxed">${data.bio}</p>
                            </div>
                            <div class="space-y-5 mt-8">
                                <h2 class="text-2xl font-bold text-gray-800 mb-4 font-comfortaa text-center">Meus Talentos e Links</h2>
                                ${blocosHtml}
                            </div>
                            <a href="https://www.instagram.com/narizesdeplantao_/" target="_blank" rel="noopener noreferrer" class="mt-10 inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-medium rounded-full text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg">
                                ${icons.instagram}
                                Nosso Instagram
                            </a>
                        </div>
                    </div>
                </div>
            `;
        } else {
            appContainer.innerHTML = `
                <div class="text-center p-8 box-container my-8 max-w-md">
                    <h2 class="text-3xl font-bold text-yellow-600 mb-4">Oops! Palhaço não encontrado.</h2>
                    <p class="text-lg text-gray-700">Parece que este cartão de visita não existe ou foi removido.</p>
                    <a href="#" class="mt-6 inline-block btn-primary">Voltar para a Página Inicial</a>
                </div>
            `;
        }
    } catch (error) {
        console.error("Erro ao buscar dados do palhaço:", error);
        showCustomModal("Erro", "Não foi possível carregar o cartão do palhaço. Verifique sua conexão ou tente novamente.");
        // Não chame router() aqui, pois o erro já foi tratado e o modal exibido.
    }
}

export function renderAdminPanel() {
    renderLoading('Preparando o palco...');
    const clownsCollectionRef = collection(db, `artifacts/${appId}/public/data/clowns`);

    onSnapshot(clownsCollectionRef, (snapshot) => {
        const clownsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const clownsHtml = clownsList.map(clown => `
            <div class="card-clown flex flex-col">
                <div class="h-40 bg-cover bg-center relative" style="background-image: url('${clown.fotoUrl || 'https://placehold.co/600x300/ffe082/c53030?text=Sem+Foto'}')">
                    <div class="absolute inset-0 bg-gradient-to-t from-yellow-500/20 to-transparent"></div>
                </div>
                <div class="p-6 flex-grow relative -mt-16">
                    <img src="${clown.fotoUrl || 'https://placehold.co/100x100/ffe082/c53030?text=?'}" class="w-28 h-28 rounded-full object-cover mx-auto ring-4 ring-white shadow-lg border-2 border-yellow-200">
                    <h2 class="text-3xl font-bold text-gray-800 text-center mt-3 font-comfortaa">${clown.nomePalhaco}</h2>
                    <p class="text-md text-yellow-600 font-semibold text-center">${clown.profissao}</p>
                </div>
                <div class="bg-gray-50 p-4 flex justify-center items-center space-x-3 border-t border-gray-100">
                    <button onclick="window.handleCopyLink('${clown.id}')" title="Copiar Link" class="icon-btn text-gray-500 hover:text-blue-600">
                        ${icons.copy}
                        <span class="sr-only">Copiar Link</span>
                    </button>
                    <button onclick='window.openModalForEdit(${JSON.stringify(clown).replace(/'/g, "&apos;")})' title="Editar" class="icon-btn text-gray-500 hover:text-green-600">
                        ${icons.edit}
                        <span class="sr-only">Editar</span>
                    </button>
                    <button onclick="window.handleDelete('${clown.id}', '${clown.fotoPath || ''}')" title="Apagar" class="icon-btn text-gray-500 hover:text-red-600">
                        ${icons.trash}
                        <span class="sr-only">Apagar</span>
                    </button>
                </div>
            </div>
        `).join('');

        appContainer.innerHTML = `
            <div class="container mx-auto p-4 sm:p-6 lg:p-8 w-full max-w-6xl">
                <header class="flex flex-col sm:flex-row justify-between items-center mb-12 pb-8 border-b-2 border-yellow-200">
                    <h1 class="text-5xl font-bold text-gray-800 font-comfortaa mb-6 sm:mb-0">Painel de Palhaços</h1>
                    <button onclick="window.openModalForNew()" class="btn-primary px-8 py-4">
                        ${icons.add} Adicionar Novo Palhaço
                    </button>
                </header>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">${clownsHtml}</div>
                ${clownsList.length === 0 ? `<div class="text-center text-gray-600 text-lg mt-10 p-4 box-container">Nenhum palhaço cadastrado ainda. Que tal adicionar o primeiro e espalhar mais alegria?</div>` : ''}
            </div>
        `;
    }, (error) => {
        console.error("Erro ao buscar dados do Firestore: ", error);
        showCustomModal("Erro de Conexão", "Não foi possível carregar os dados. Verifique sua conexão e as regras de segurança do Firestore no console do Firebase.");
        // Não chame router() aqui, pois o erro já foi tratado e o modal exibido.
    });
}
