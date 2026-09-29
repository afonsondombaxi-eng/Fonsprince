# Fonsprince One — Pacote Móvel (PWA)

## Conteúdo desta pasta
- `index.html` — a aplicação completa (React pré-compilado, autónoma, sem dependências externas em tempo de execução)
- `manifest.json` — manifesto da Progressive Web App (nome, ícones, atalhos)
- `sw.js` — service worker (cache offline)
- `icon-192.png`, `icon-512.png` — ícones da aplicação
- `apple-touch-icon*.png` — ícones para iOS
- `splash-*.png` — ecrãs de abertura para iOS

## Como publicar no GitHub Pages
1. Vá ao repositório `Fonsprince` no GitHub
2. Arraste **todos os ficheiros desta pasta** (não a pasta em si) para a raiz do repositório
3. Faça commit das alterações
4. Aguarde 1–2 minutos e reinstale/atualize a aplicação no telemóvel

## Notas
- A aplicação funciona offline depois da primeira visita (graças ao `sw.js`)
- Os dados ficam guardados no `localStorage` do dispositivo, com sincronização opcional via Firebase (configurada dentro da própria app, em Definições)
