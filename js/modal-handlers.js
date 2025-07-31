// js/modal-handlers.js
import { db, appId, storage } from './firebase-config.js';
import { collection, doc, setDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-storage.js";

// Elementos do DOM dos modais (assumindo que estão no index.html)
const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modal-title');
const modalForm = document.getElementById('modal-form');
const fotoPreview = document.getElementById('foto-preview');
const fotoInput = document.getElementById('foto');
const blocosContainer = document.getElementById('blocos-container');
const saveButton = document.getElementById('save-button');

// Elementos do modal customizado
const customModal = document.getElementById('custom-modal');
const customModalTitle = document.getElementById('custom-modal-title');
const customModalMessage = document.getElementById('custom-modal-message');
const customModalConfirmBtn = document.getElementById('custom-modal-confirm-btn');
const customModalCancelBtn = document.getElementById('custom-modal-cancel-btn');
let currentModalCallback = null;

// --- Funções do Modal Customizado ---
export function showCustomModal(title, message, type = 'alert', callback = null) {
    customModalTitle.innerText = title;
    customModalMessage.innerText = message;
    currentModalCallback = callback;

    if (type === 'confirm') {
        customModalConfirmBtn.classList.remove('hidden');
        customModalCancelBtn.classList.remove('hidden');
        customModalConfirmBtn.innerText = 'Confirmar';
        customModalCancelBtn.innerText = 'Cancelar';
    } else {
        customModalConfirmBtn.classList.remove('hidden');
        customModalCancelBtn.classList.add('hidden');
        customModalConfirmBtn.innerText = 'OK';
    }

    customModal.classList.remove('hidden');
    customModal.querySelector('div').classList.add('scale-100');
}

export function hideCustomModal() {
    const modalContent = customModal.querySelector('div');
    modalContent.classList.remove('scale-100');
    setTimeout(() => {
        customModal.classList.add('hidden');
        currentModalCallback = null;
    }, 300);
}

// Listeners para o modal customizado
customModalConfirmBtn.onclick = () => {
    if (currentModalCallback) {
        currentModalCallback(true);
    }
    hideCustomModal();
};

customModalCancelBtn.onclick = () => {
    if (currentModalCallback) {
        currentModalCallback(false);
    }
    hideCustomModal();
};

// --- Funções do Modal de Edição/Criação ---

export function adicionarBloco(bloco = { tipo: 'texto', titulo: '', conteudo: '' }) {
    const div = document.createElement('div');
    // Usando a classe card-container para os blocos de conteúdo no modal
    div.className = 'card-container relative space-y-4';
    div.innerHTML = `
        <button type="button" onclick="window.adicionarBloco.removeBlock(this)" class="absolute -top-3 -right-3 text-white bg-red-500 hover:bg-red-600 w-8 h-8 rounded-full flex items-center justify-center shadow-md text-xl font-bold">&times;</button>
        <div>
            <label class="label text-sm">Tipo de Bloco</label>
            <select class="bloco-tipo form-input">
                <option value="texto" ${bloco.tipo === 'texto' ? 'selected' : ''}>Texto Simples</option>
                <option value="link" ${bloco.tipo === 'link' ? 'selected' : ''}>Botão de Link</option>
                <option value="video" ${bloco.tipo === 'video' ? 'selected' : ''}>Vídeo do YouTube</option>
            </select>
        </div>
        <div>
            <label class="label text-sm">Título do Bloco</label>
            <input type="text" placeholder="Título do Bloco" class="bloco-titulo form-input" value="${bloco.titulo}" required>
        </div>
        <div>
            <label class="label text-sm">Conteúdo</label>
            <textarea placeholder="Conteúdo (texto, URL do link ou URL do vídeo)" class="bloco-conteudo form-input" rows="4" required>${bloco.conteudo}</textarea>
        </div>
    `;
    blocosContainer.appendChild(div);
}
// Adiciona uma função para remover blocos, acessível globalmente
adicionarBloco.removeBlock = (element) => {
    element.parentElement.remove();
};


export function openModalForNew() {
    modalForm.reset();
    modalForm.removeAttribute('data-clown-id');
    modalForm.removeAttribute('data-foto-path');
    blocosContainer.innerHTML = '';
    fotoPreview.src = 'https://placehold.co/200x200/e9ecef/495057?text=Foto';
    modalTitle.innerText = 'Adicionar Novo Palhaço';
    modal.classList.remove('hidden');
    modal.querySelector('div').classList.add('scale-100');
}

export function openModalForEdit(clown) {
    openModalForNew(); // Reseta o formulário primeiro
    modalTitle.innerText = 'Editar Palhaço';
    modalForm.dataset.clownId = clown.id;
    modalForm.dataset.fotoPath = clown.fotoPath || '';

    document.getElementById('nomePalhaco').value = clown.nomePalhaco;
    document.getElementById('profissao').value = clown.profissao;
    document.getElementById('bio').value = clown.bio;

    if(clown.fotoUrl) {
        fotoPreview.src = clown.fotoUrl;
    }

    if (clown.blocos) {
        clown.blocos.forEach(bloco => adicionarBloco(bloco));
    }
}

export function closeModal() {
    const modalContent = modal.querySelector('div');
    modalContent.classList.remove('scale-100');
    setTimeout(() => modal.classList.add('hidden'), 300);
}

// Listeners para o formulário do modal
fotoInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        fotoPreview.src = URL.createObjectURL(file);
    }
});

modalForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    saveButton.disabled = true;
    saveButton.innerText = 'Salvando...';

    try {
        const clownId = e.target.dataset.clownId;
        const fotoFile = fotoInput.files[0];
        let fotoUrl = fotoPreview.src;
        let fotoPath = e.target.dataset.fotoPath || '';

        if (fotoFile && fotoUrl.startsWith('blob:')) {
            saveButton.innerText = 'Enviando foto...';
            fotoPath = `fotos/${Date.now()}-${fotoFile.name}`;
            const storageRef = ref(storage, fotoPath);
            await uploadBytes(storageRef, fotoFile);
            fotoUrl = await getDownloadURL(storageRef);
        }

        saveButton.innerText = 'Salvando dados...';
        const blocos = Array.from(document.querySelectorAll('#blocos-container > div')).map(div => ({
            tipo: div.querySelector('.bloco-tipo').value,
            titulo: div.querySelector('.bloco-titulo').value,
            conteudo: div.querySelector('.bloco-conteudo').value
        }));

        const clownData = {
            nomePalhaco: document.getElementById('nomePalhaco').value,
            profissao: document.getElementById('profissao').value,
            bio: document.getElementById('bio').value,
            fotoUrl,
            fotoPath,
            blocos
        };

        const docRef = clownId ? doc(db, `artifacts/${appId}/public/data/clowns`, clownId) : doc(collection(db, `artifacts/${appId}/public/data/clowns`));
        await setDoc(docRef, clownData, { merge: true });

        closeModal();
        showCustomModal("Sucesso!", "Palhaço salvo com sucesso!");

    } catch (error) {
        console.error("Erro detalhado ao salvar:", error);
        let errorMessage = "Não foi possível salvar. ";
        if (error.code) {
            switch (error.code) {
                case 'storage/unauthorized':
                    errorMessage += "Erro de permissão ao enviar a foto. Verifique as regras de segurança do Firebase Storage.";
                    break;
                case 'firestore/permission-denied':
                    errorMessage += "Erro de permissão ao acessar o banco de dados. Verifique as regras de segurança do Firestore.";
                    break;
                default:
                    errorMessage += `Código do erro: ${error.code}`;
            }
        } else {
            errorMessage += "Erro desconhecido.";
        }
        showCustomModal("Erro ao Salvar", errorMessage);
    } finally {
        saveButton.disabled = false;
        saveButton.innerText = 'Salvar Alterações';
    }
});

export async function handleDelete(id, fotoPath) {
    showCustomModal("Confirmar Exclusão", "Tem certeza que deseja apagar este palhaço? Esta ação não pode ser desfeita.", 'confirm', async (confirmed) => {
        if (confirmed) {
            try {
                await deleteDoc(doc(db, `artifacts/${appId}/public/data/clowns`, id));
                if (fotoPath) {
                    const fotoRef = ref(storage, fotoPath);
                    await deleteObject(fotoRef);
                }
                showCustomModal("Sucesso!", "Palhaço apagado com sucesso!");
            } catch (error) {
                console.error("Erro ao deletar:", error);
                showCustomModal("Erro ao Apagar", "Ocorreu um erro ao apagar o palhaço. Verifique o console.");
            }
        }
    });
}

export function handleCopyLink(id) {
    const link = `${window.location.href.split('#')[0]}#/palhaco/${id}`;
    const textArea = document.createElement("textarea");
    textArea.value = link;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
        document.execCommand('copy');
        showCustomModal("Link Copiado!", "O link do cartão de visita foi copiado para a área de transferência!");
    } catch (err) {
        console.error('Falha ao copiar:', err);
        showCustomModal("Erro ao Copiar", "Não foi possível copiar o link automaticamente. Por favor, copie manualmente: " + link);
    }
    document.body.removeChild(textArea);
}
