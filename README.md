# Fonsprince — versão telemóvel

Esta pasta é a mesma aplicação Fonsprince, com todas as funcionalidades atuais
(Contas, Movimentos, Orçamento, Metas, Dívidas, Câmbio, Previsão, Relatório,
Planeamento, Alertas) e o visual empresarial mais recente — mas adaptada para
funcionar bem num ecrã de telemóvel e para ser instalada como app.

## O que muda no telemóvel

- A barra lateral desaparece; em vez disso, uma **barra de navegação inferior**
  dá acesso rápido a Geral, Contas, Movimentos e Dívidas, com um botão **"Mais"**
  para as restantes secções (Orçamento, Metas, Câmbio, Previsão, Relatório,
  Planeamento, Alertas).
- A barra superior mantém-se (nome da página atual, sino de alertas, avatar),
  agora respeitando o entalhe/Dynamic Island do iPhone.
- Campos de formulário com letra maior o suficiente para o Safari não fazer
  zoom automático ao tocar neles.
- Ecrã de arranque e ícone próprios ao instalar.

## Porque precisa de alojar isto (não basta abrir o ficheiro)

O `manifest.json` e o service worker (as duas peças que tornam isto
"instalável") só funcionam em páginas servidas por **HTTPS** ou em
`localhost` — não em `file://` (duplo-clique local).

**Mais rápido:** arraste esta pasta inteira para o
[Netlify Drop](https://app.netlify.com/drop) — fica online em segundos, com
um link para abrir no telemóvel.

## Instalar

**Android (Chrome):** abra o link → menu (⋮) → "Adicionar ao ecrã principal".

**iPhone (tem de ser Safari):** abra o link → ícone de partilha (□↑) →
"Adicionar ao Ecrã Principal".

## Ficheiros

- `index.html` — a aplicação.
- `manifest.json`, `sw.js` — tornam-na instalável e capaz de abrir offline.
- `icon-192.png`, `icon-512.png`, `apple-touch-icon*.png` — ícones.
- `splash-*.png` — ecrãs de arranque para os tamanhos de iPhone mais comuns.

## Os dados no telemóvel

Os dados ficam no armazenamento local do navegador do telemóvel — só nesse
aparelho, não sincronizados com o computador. Use "Exportar dados" (na app,
no fundo do menu) num dispositivo e "Importar dados" no outro para levar os
mesmos dados consigo.
