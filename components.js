import { formatLink } from '../utils.js';

export const renderSpinner = (container, fullPage = false) => {
    const spinnerHtml = `<div class="spinner" style="margin:auto; border-color: #ccc; border-top-color: var(--primary);"></div>`;
    if (fullPage) {
        container.innerHTML = `<div class="center-card-indv">${spinnerHtml}</div>`;
    } else {
        container.innerHTML = `<div style="text-align:center; padding-top: 40px;">${spinnerHtml}</div>`;
    }
};

export function renderIndvCard(palhaco) {
    const socialLinksConfig = [
        { key: 'instagram', base: 'https://instagram.com/', icon: 'fab fa-instagram' },
        { key: 'facebook', base: 'https://facebook.com/', icon: 'fab fa-facebook' },
        { key: 'twitter', base: 'https://x.com/', icon: 'fab fa-x-twitter' },
        { key: 'linkedin', base: 'https://linkedin.com/in/', icon: 'fab fa-linkedin' },
        { key: 'website', base: '', icon: 'fas fa-globe' }
    ];

    const socIcons = socialLinksConfig
        .filter(item => palhaco[item.key])
        .map(item => {
            const url = formatLink(item.base, palhaco[item.key]);
            return `<a href="${url}" target="_blank" rel="noreferrer"><i class="${item.icon}"></i></a>`;
        }).join('');
        
    let customLinksHTML = '';
    if (palhaco.customLinks && palhaco.customLinks.length) {
        customLinksHTML = `<div class="custom-links-indv">`;
        palhaco.customLinks.forEach(lk => { if (lk.title && lk.url) customLinksHTML += `<a href="${lk.url}" target="_blank" rel="noreferrer">${lk.title}</a>`; });
        customLinksHTML += '</div>';
    }

    let additionalImagesHTML = '';
    const images = (palhaco.additionalImages || []).filter(imgUrl => imgUrl);
    if (images.length > 0) {
        additionalImagesHTML = `<div class="indv-additional-images" id="image-carousel">
            <div class="carousel-track">
                ${images.map(imgUrl => `<img src="${imgUrl}" alt="Imagem adicional" onerror="this.style.display='none';" />`).join('')}
            </div>
            <button class="carousel-btn prev" id="carousel-prev"><i class="fa fa-chevron-left"></i></button>
            <button class="carousel-btn next" id="carousel-next"><i class="fa fa-chevron-right"></i></button>
        </div>`;
    }

    const sectionOrder = palhaco.sectionOrder || ['bio', 'social', 'images', 'links'];
    const sections = {
        bio: `<div class="indv-bio">${palhaco.bio ?? ''}</div>`,
        social: `<div class="soc-icons">${socIcons}</div>`,
        images: additionalImagesHTML,
        links: customLinksHTML
    };
    const cardBodyHTML = sectionOrder.map(id => sections[id] || '').join('');

    let backgroundStyle = '', nameColorStyle = '', roleColorStyle = '', photoBorderStyle = '';
    if (palhaco.color1 && palhaco.color2) {
        backgroundStyle = `style="background: linear-gradient(135deg, ${palhaco.color1} 60%, ${palhaco.color2} 100%)"`;
        nameColorStyle = `style="color: ${palhaco.color1}"`;
        roleColorStyle = `style="color: ${palhaco.color2}"`;
        photoBorderStyle = `style="background: linear-gradient(135deg, ${palhaco.color1}, ${palhaco.color2})"`;
    }

    return `<div class="center-card-indv" ${backgroundStyle}>
        <div class="indv-card">
            <div class="indv-photo-wrapper" ${photoBorderStyle}>
                <img src="${palhaco.photo}" alt="palhaço" class="indv-photo" onerror="this.src='https://i.imgur.com/wIxRvus.png';" />
            </div>
            <div class="indv-name" ${nameColorStyle}>${palhaco.name}</div>
            <div class="indv-role" ${roleColorStyle}>${palhaco.jobTitle ?? ''}</div>
            ${cardBodyHTML}
            <a href="https://instagram.com/narizesdeplantao_" target="_blank" rel="noreferrer" class="project-instagram-link">
                <i class="fab fa-instagram"></i> @narizesdeplantao_
            </a>
        </div>
    </div>`;
}

export const renderNotFound = () => `
    <div class="center-card-indv">
        <div class="notfound">Palhaço não encontrado!<br><a href="./" style="color:#fff;text-decoration:underline;">Voltar à lista</a></div>
    </div>`;

export const renderLogin = () => `
    <div class="container">
        <div class="header" style="margin-bottom:24px;">Painel de Administração</div>
        <form id="login-form" style="background:#fff;padding:26px 22px;border-radius:var(--radius);box-shadow:0 2px 18px #0001;">
            <div class="form-grp"><label>Email:</label><input id="luser" type="email" required /></div>
            <div class="form-grp"><label>Senha:</label><input id="lsenha" type="password" required autocomplete="current-password" /></div>
            <div style="margin:14px 0;"><button type="submit" class="btn">Entrar</button></div>
            <div id="login-error" style="color:#d00"></div>
        </form>
    </div>`;

export function renderAdmin(palhacos) {
    let list = '';
    if (palhacos.length === 0) {
        list = `<div style="text-align:center;color:#666;">Nenhum palhaço cadastrado.<br>Clique em <b>Adicionar Novo Palhaço</b> para começar!</div>`;
    } else {
        list = '<div class="card-list">';
        palhacos.forEach(p => {
            const shareLink = `${window.location.origin}${window.location.pathname}?id=${p.id}`;
            list += `<div class="admin-card" data-key="${p.key}" data-id="${p.id}">
                <img src="${p.photo}" class="card-photo" />
                <div class="card-info">
                    <div style="font-weight:700;color:var(--primary);font-size:1.07em">${p.name}</div>
                    <div style="font-size:0.96em;color:var(--secondary); margin-bottom: 8px;">${p.jobTitle ?? ''}</div>
                    <div class="card-link">${shareLink}</div>
                </div>
                <div class="card-actions">
                    <button class="btn copiar-link" data-link="${shareLink}"><i class="fa fa-copy"></i> Copiar Link</button>
                    <button class="btn accent" data-action="view"><i class="fa fa-eye"></i> Ver Cartão</button>
                    <button class="btn" style="background-color: #95a5a6;" data-action="qrcode"><i class="fa fa-qrcode"></i> QR Code</button>
                    <button class="btn secondary" data-action="edit"><i class="fa fa-pen"></i> Editar</button>
                    <button class="btn" style="background-color: #c0392b;" data-action="delete"><i class="fa fa-trash"></i> Excluir</button>
                </div>
            </div>`;
        });
        list += "</div>";
    }

    return `
        <div class="header">Painel de Administração</div>
        <div class="admin-container">
            <div class="admin-btns">
                <button class="btn accent" id="add-palhaco-btn">➕ Adicionar Novo Palhaço</button>
                <button class="btn logout" id="logout-btn"><i class="fa fa-sign-out"></i> Sair</button>
            </div>
            <div id="admin-card-list">${list}</div>
        </div>
    `;
}

export function renderQRCodeModal(url) {
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(url)}`;
    const palhacoId = new URL(url).searchParams.get('id') || 'cartao';
    const filename = `qrcode-${palhacoId}.png`;

    return `<div class="modal-box" style="text-align: center;">
        <button type="button" class="close-modal" data-action="close-modal">&times;</button>
        <div class="modal-title">Compartilhe o Cartão</div>
        <img src="${qrUrl}" alt="QR Code" style="border-radius: 10px; margin-bottom: 16px;" />
        <a href="${qrUrl}" download="${filename}" class="btn accent" style="display: inline-block; text-decoration: none; margin-bottom: 16px;">
            <i class="fa fa-download"></i> Baixar Imagem
        </a>
        <p style="font-size: 0.9em; color: #666; word-break: break-all;">${url}</p>
    </div>`;
}

export function renderModalForm(data, isEdit) {
    const sectionOrder = data.sectionOrder || ['bio', 'social', 'images', 'links'];

    const sectionsHTML = {
        bio: `<div class="form-grp form-section" data-section-id="bio" draggable="true">
                <div class="form-section-header"><i class="fa fa-grip-vertical"></i><label>Bio</label></div>
                <textarea id="f_bio">${data.bio || ""}</textarea>
              </div>`,
        social: `<div class="form-grp form-section" data-section-id="social" draggable="true">
                  <div class="form-section-header"><i class="fa fa-grip-vertical"></i><label>Redes Sociais</label></div>
                  <input id="f_instagram" placeholder="Instagram (somente username ou link)" value="${data.instagram || ""}" style="margin-bottom:6px;" />
                  <input id="f_facebook" placeholder="Facebook (somente username ou link)" value="${data.facebook || ""}" style="margin-bottom:6px;" />
                  <input id="f_twitter" placeholder="Twitter/X (somente username ou link)" value="${data.twitter || ""}" style="margin-bottom:6px;" />
                  <input id="f_linkedin" placeholder="LinkedIn (somente username ou link)" value="${data.linkedin || ""}" style="margin-bottom:6px;" />
                  <input id="f_website" placeholder="Site Pessoal (URL completo ou sem http)" value="${data.website || ""}" />
                </div>`,
        images: `<div class="form-grp form-section" data-section-id="images" draggable="true">
                  <div class="form-section-header"><i class="fa fa-grip-vertical"></i><label>Imagens Adicionais (até 4)</label></div>
                  <div id="additional-photos-container"></div>
                  <div style="font-size:0.9em;color:#888;margin-top:3px;">Arraste as imagens para reordená-las.</div>
                </div>`,
        links: `<div class="form-grp form-section" data-section-id="links" draggable="true">
                  <div class="form-section-header"><i class="fa fa-grip-vertical"></i><label>Links Personalizados</label></div>
                  <div class="custom-links" id="custom-links"></div>
                  <button type="button" class="btn accent" id="add-custom-link-btn" style="padding: 8px 16px; font-size: 0.9em; margin-top: 8px;">+ Adicionar Link</button>
                </div>`
    };

    const reorderableSections = sectionOrder.map(id => sectionsHTML[id] || '').join('');

    return `<div class="modal-box">
        <form id="palhaco-form" autocomplete="off" data-key="${data.key || ''}" data-is-edit="${isEdit}">
            <button type="button" class="close-modal" data-action="close-modal">&times;</button>
            <div class="modal-title">${isEdit ? "Editar Palhaço" : "Adicionar Novo Palhaço"}</div>
            
            <div class="form-grp"><label>Nome do Palhaço *</label>
                <input required id="f_nome" value="${data.name || ""}" />
            </div>
            <div class="form-grp"><label>ID Único *</label>
                <input required id="f_id" value="${data.id || ""}" pattern="[a-z0-9\\-]+" />
                <div style="font-size:0.9em;color:#888;margin-top:3px;">Link: <b>?id=${data.id || ""}</b> (letras minúsculas, números, hífen)</div>
            </div>
            <div class="form-grp"><label>Foto - Escolher arquivo ou URL *</label>
                <input type="file" id="f_photo_file" accept="image/*" style="display:none;" />
                <button type="button" id="f_photo_choose_btn" class="btn" style="padding: 5px 10px; font-size:0.8em; margin-bottom: 10px;">Escolher Arquivo</button>
                <input required id="f_photo" value="${data.photo || ""}" placeholder="URL da foto" />
                <img src="${data.photo || ''}" id="photo-preview" style="width:70px; height:70px; border-radius:50%; background:#eee; margin-top:7px; object-fit:cover; ${data.photo ? '' : 'display:none;'}" onerror="this.style.display='none';" />
            </div>
            <div class="form-grp"><label>Cargo/Função</label>
                <input id="f_role" value="${data.jobTitle || ""}" />
            </div>
            <div class="form-grp"><label>Cores do Fundo do Cartão</label>
                <div style="display:flex; gap: 15px; align-items:center; flex-wrap: wrap;">
                    <div>Cor 1: <input type="color" id="f_color1" value="${data.color1 || '#E74C3C'}"></div>
                    <div>Cor 2: <input type="color" id="f_color2" value="${data.color2 || '#F39C12'}"></div>
                    <div id="gradient-preview" style="width: 60px; height: 30px; border-radius: 8px; border: 1px solid #ccc; flex-shrink: 0;"></div>
                </div>
                <div style="font-size:0.9em;color:#888;margin-top:3px;">Deixe como está para usar o padrão laranja.</div>
            </div>
            
            <div id="reorderable-sections-container" style="display: flex; flex-direction: column; gap: 16px; margin-top: 16px;">
                ${reorderableSections}
            </div>

            <div style="margin-top:24px;display:flex;gap:12px;justify-content:flex-end;">
                <button type="button" class="btn secondary" data-action="close-modal">Cancelar</button>
                <button type="submit" class="btn" style="background:#27ae60;">Salvar</button>
            </div>
            <div id="form-err" style="color:#d00;margin-top:10px;"></div>
        </form>
    </div>`;
}

export const renderCustomLinkRow = (link = { title: "", url: "" }) => `
    <div class="custom-link-row">
        <input value="${link.title || ""}" placeholder="Título do Link" />
        <input value="${link.url || ""}" placeholder="URL completa (https://...)" />
        <button type="button" class="btn-icon btn-danger" data-action="remove-custom-link">×</button>
    </div>
`;

export const renderAdditionalPhotoRow = (photoUrl = '', index) => `
    <div class="additional-photo-row" draggable="true">
        <i class="fa fa-grip-vertical"></i>
        <img id="extra_photo_preview_${index}" src="${photoUrl}" style="${photoUrl ? '' : 'display:none;'}" onerror="this.style.display='none';" />
        <div class="upload-controls">
            <input type="file" id="f_extra_photo_file_${index}" data-index="${index}" accept="image/*" />
            <button type="button" class="btn" data-action="choose-extra-file" data-index="${index}">Escolher</button>
            <span class="upload-status" id="upload_status_${index}"></span>
            <input type="hidden" id="f_extra_photo_url_${index}" value="${photoUrl}" />
        </div>
        <button type="button" class="btn-icon" data-action="remove-extra-file" data-index="${index}">&times;</button>
    </div>
`;