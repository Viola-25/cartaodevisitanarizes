Visualizador de Trajetórias — Cartões de Narizes

Como usar

- Abra `index.html` no navegador.
- No cartão individual, clique em "Abrir Trajetória (PDF)" para abrir o visualizador.
- O visualizador abre num modal embutido (desktop/mobile) usando `viewer.html` via `iframe`.

Notas

- O visualizador usa PDF.js (CDN). Se o PDF estiver hospedado num bucket com CORS restrito, ajuste as regras ou torne o arquivo público.
- Atalhos: ← e → para navegar entre páginas; +/- para zoom; Esc fecha o modal (use o botão de fechar).

Arquivos relevantes

- `index.html` — interface principal e painel administrativo.
- `viewer.html` — visualizador de PDF (páginas, zoom, teclado).

Quer que eu integre animação de virada de página 3D ou altere o modal para ocupar a tela inteira por padrão?