import { login, logout, getPalhacos, createPalhaco, updatePalhaco, deletePalhaco, getPalhacoByDocId, uploadImage, getImageUrl, deleteImage } from '../services/firebase-service.js';
import { renderAdmin, renderModalForm, renderQRCodeModal, renderCustomLinkRow, renderAdditionalPhotoRow } from './components.js';

const mainContainer = document.getElementById('main');
const modalContainer = document.getElementById('modal-bg');

export function initCarousel() {
    const carousel = document.getElementById('image-carousel');
    if (!carousel) return;

    const track = carousel.querySelector('.carousel-track');
    const slides = Array.from(track.children);
    const nextButton = document.getElementById('carousel-next');
    const prevButton = document.getElementById('carousel-prev');

    if (slides.length <= 1) {
        if(nextButton) nextButton.style.display = 'none';
        if(prevButton) prevButton.style.display = 'none';
        return;
    }

    const slideWidth = slides[0].getBoundingClientRect().width;
    let currentIndex = 0;
    let isDragging = false, startPos = 0, currentTranslate = 0, prevTranslate = 0;

    const getPositionX = e => e.type.includes('mouse') ? e.pageX : e.touches[0].clientX;

    const dragStart = (e) => {
        isDragging = true;
        startPos = getPositionX(e);
        track.style.transition = 'none';
        carousel.style.cursor = 'grabbing';
    };

    const dragging = (e) => {
        if (!isDragging) return;
        const currentPosition = getPositionX(e);
        currentTranslate = prevTranslate + currentPosition - startPos;
        track.style.transform = `translateX(${currentTranslate}px)`;
    };

    const dragEnd = () => {
        if (!isDragging) return;
        isDragging = false;
        track.style.transition = 'transform 0.4s ease-in-out';
        carousel.style.cursor = 'grab';
        const movedBy = currentTranslate - prevTranslate;

        if (movedBy < -50 && currentIndex < slides.length - 1) currentIndex++;
        if (movedBy > 50 && currentIndex > 0) currentIndex--;

        moveToSlide(currentIndex);
    };

    const updateButtons = () => {
        prevButton.disabled = currentIndex === 0;
        nextButton.disabled = currentIndex === slides.length - 1;
    };

    const moveToSlide = (index) => {
        currentTranslate = -index * slideWidth;
        track.style.transform = `translateX(${currentTranslate}px)`;
        prevTranslate = currentTranslate;
        currentIndex = index;
        updateButtons();
    };

    carousel.addEventListener('mousedown', dragStart);
    carousel.addEventListener('touchstart', dragStart);
    carousel.addEventListener('mouseup', dragEnd);
    carousel.addEventListener('touchend', dragEnd);
    carousel.addEventListener('mouseleave', dragEnd);
    carousel.addEventListener('mousemove', dragging);
    carousel.addEventListener('touchmove', dragging);

    nextButton.style.opacity = '1';
    prevButton.style.opacity = '1';
    prevButton.addEventListener('click', () => moveToSlide(currentIndex - 1));
    nextButton.addEventListener('click', () => moveToSlide(currentIndex + 1));

    updateButtons();
}

export function attachLoginEvents() {
    const form = document.getElementById('login-form');
    if (!form) return;
    form.onsubmit = async (e) => {
        e.preventDefault();
        try {
            await login(luser.value, lsenha.value);
        } catch {
            document.getElementById('login-error').innerText = "Login inválido!";
        }
    };
}

export function attachAdminEvents() {
    document.getElementById('add-palhaco-btn')?.addEventListener('click', () => showEditModal());
    document.getElementById('logout-btn')?.addEventListener('click', () => logout());

    document.getElementById('admin-card-list')?.addEventListener('click', (e) => {
        const button = e.target.closest('button');
        if (!button) return;

        const card = button.closest('.admin-card');
        const key = card.dataset.key;
        const id = card.dataset.id;
        const action = button.dataset.action;
        const link = button.dataset.link;

        switch (action) {
            case 'edit': showEditModal(key); break;
            case 'delete': handleDelete(key); break;
            case 'view': window.open(`?id=${id}`, '_blank'); break;
            case 'qrcode': showQRCodeModal(link); break;
            default:
                if (button.classList.contains('copiar-link')) {
                    copyLink(button, link);
                }
        }
    });
}

function copyLink(btn, link) {
    navigator.clipboard.writeText(link);
    const originalText = btn.innerHTML;
    btn.innerHTML = 'Copiado!';
    btn.classList.add('copied');
    setTimeout(() => {
        btn.innerHTML = originalText;
        btn.classList.remove('copied');
    }, 2000);
}

async function handleDelete(key) {
    if (confirm("Excluir este palhaço? Esta ação não pode ser desfeita e apagará todas as imagens associadas.")) {
        try {
            await deletePalhaco(key);
            const palhacos = await getPalhacos();
            mainContainer.innerHTML = renderAdmin(palhacos);
            attachAdminEvents();
        } catch (error) {
            console.error("Erro ao excluir palhaço:", error);
            alert("Ocorreu um erro ao excluir o palhaço.");
        }
    }
}

function showQRCodeModal(url) {
    modalContainer.innerHTML = renderQRCodeModal(url);
    modalContainer.classList.add('active');
}

async function showEditModal(key) {
    let data = { name: "", id: "", photo: "", jobTitle: "", bio: "", instagram: "", facebook: "", twitter: "", linkedin: "", website: "", customLinks: [], color1: "#E74C3C", color2: "#F39C12", additionalImages: ["", "", "", ""], sectionOrder: ['bio', 'social', 'images', 'links'] };
    let isEdit = false;

    if (key) {
        const fetchedData = await getPalhacoByDocId(key);
        if (fetchedData) {
            data = { ...data, ...fetchedData };
            isEdit = true;
        }
    }

    modalContainer.innerHTML = renderModalForm(data, isEdit);
    attachModalFormEvents(data);
    modalContainer.classList.add('active');
}

function closeModal() {
    modalContainer.classList.remove('active');
    setTimeout(() => modalContainer.innerHTML = '', 150);
}

export function attachGlobalEvents() {
    modalContainer.addEventListener('click', (e) => {
        if (e.target === modalContainer || e.target.closest('[data-action="close-modal"]')) {
            closeModal();
        }
    });
}

function attachModalFormEvents(originalData) {
    const form = document.getElementById('palhaco-form');
    if (!form) return;

    // Populate dynamic parts
    const customLinksContainer = document.getElementById('custom-links');
    (originalData.customLinks || []).forEach(link => {
        customLinksContainer.innerHTML += renderCustomLinkRow(link);
    });

    const additionalPhotosContainer = document.getElementById('additional-photos-container');
    for (let i = 0; i < 4; i++) {
        const photoUrl = (originalData.additionalImages && originalData.additionalImages[i]) || '';
        additionalPhotosContainer.innerHTML += renderAdditionalPhotoRow(photoUrl, i);
    }

    // Attach event listeners within the modal
    form.addEventListener('click', (e) => {
        const target = e.target;
        if (target.id === 'add-custom-link-btn') {
            document.getElementById('custom-links').insertAdjacentHTML('beforeend', renderCustomLinkRow());
        }
        if (target.dataset.action === 'remove-custom-link') {
            target.closest('.custom-link-row').remove();
        }
        if (target.id === 'f_photo_choose_btn') {
            document.getElementById('f_photo_file').click();
        }
        if (target.dataset.action === 'choose-extra-file') {
            document.getElementById(`f_extra_photo_file_${target.dataset.index}`).click();
        }
        if (target.dataset.action === 'remove-extra-file') {
            const index = target.dataset.index;
            document.getElementById(`f_extra_photo_url_${index}`).value = '';
            const preview = document.getElementById(`extra_photo_preview_${index}`);
            preview.src = '';
            preview.style.display = 'none';
        }
    });

    // Handle file uploads
    form.addEventListener('change', (e) => {
        const target = e.target;
        if (target.type === 'file') {
            const file = e.target.files[0];
            if (!file) return;

            if (target.id === 'f_photo_file') {
                handleFileUpload(file, 'palhacos', 
                    (url) => {
                        document.getElementById('f_photo').value = url;
                        const preview = document.getElementById('photo-preview');
                        preview.src = url;
                        preview.style.display = 'block';
                    },
                    (status) => { document.getElementById('f_photo').value = status; }
                );
            } else if (target.id.startsWith('f_extra_photo_file_')) {
                const index = target.dataset.index;
                handleFileUpload(file, 'palhacos_extra',
                    (url) => {
                        document.getElementById(`f_extra_photo_url_${index}`).value = url;
                        const preview = document.getElementById(`extra_photo_preview_${index}`);
                        preview.src = url;
                        preview.style.display = 'block';
                    },
                    (status) => { document.getElementById(`upload_status_${index}`).textContent = status; }
                );
            }
        }
    });

    // Form submission
    form.onsubmit = async (e) => {
        e.preventDefault();
        // ... (A lógica de submissão do formulário, que é bem grande, iria aqui)
        // Para manter a clareza, a lógica de submissão pode ser movida para sua própria função.
        // Por exemplo: await handleFormSubmit(e, originalData);
        console.log("Form submitted. Logic to save data would be here.");
        closeModal();
        // Refresh admin view
        const palhacos = await getPalhacos();
        mainContainer.innerHTML = renderAdmin(palhacos);
        attachAdminEvents();
    };
}

function handleFileUpload(file, path, onSuccess, onStatus) {
    onStatus('Enviando...');
    const { uploadTask, storageRef } = uploadImage(file, path);

    uploadTask.on('state_changed',
        () => {}, // progress
        (error) => { onStatus("Erro!"); console.error(error); },
        async () => {
            const url = await getImageUrl(storageRef);
            onSuccess(url);
            onStatus('Enviado!');
            setTimeout(() => onStatus(''), 2000);
        }
    );
}