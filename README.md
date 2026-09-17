# Fonsprince One — Pacote Móvel (PWA)

## O que está aqui
- `index.html` — a app completa, pronta a publicar
- `manifest.json` — configuração da PWA (nome, ícone, atalhos)
- `sw.js` — service worker (funcionamento offline + verificação em segundo plano no Android)
- `icon-*.png`, `apple-touch-icon*.png`, `splash-*.png` — ícones e ecrãs de arranque

## Como publicar / atualizar (GitHub Pages)
1. Vá ao repositório `Fonsprince` no GitHub
2. Para atualizar apenas a app: "Add file" → "Upload files" → arraste o `index.html` novo → Commit
3. Para a primeira publicação, envie todos os ficheiros desta pasta mantendo os nomes exatos
4. Ative o GitHub Pages nas definições do repositório, se ainda não estiver ativo

## Como instalar no telemóvel
- **iPhone**: abra o link no Safari → botão Partilhar → "Adicionar ao ecrã principal"
- **Android**: abra o link no Chrome → menu → "Adicionar ao ecrã principal" (ou vai aparecer um aviso automático)

Isto dá um ícone próprio, sem a barra de endereço do navegador — a experiência mais próxima de uma app nativa que uma PWA permite.

## Importante: isto NÃO é publicável diretamente na App Store da Apple
Esta é uma PWA (aplicação web instalável), não uma app nativa. A Apple rejeita "web wrappers" sem funcionalidade nativa (Guideline 4.2 da App Store Review). Para publicar na App Store é necessário embrulhar este projeto com uma ferramenta como o **Capacitor**, compilar num Mac com Xcode, e assinar com uma conta de programador Apple (99 USD/ano).
