# Fonsprince One — servidor de IA

Faz com que a caixa **"Pergunte ao seu dinheiro"** entenda frases livres
("quanto gastei em comida no mês passado?", "compara este mês com o anterior", "onde gasto mais?").

## Como funciona (e porque é seguro)
1. A app envia **só** a pergunta, o idioma, a data de hoje e os **nomes** das categorias.
   Nunca envia valores, saldos, descrições nem nomes de contas.
2. Este servidor pede ao Claude (Haiku) um **plano de consulta** em JSON (período, categoria, tipo de resposta).
3. A app executa o plano **no seu dispositivo**, com os seus dados, e mostra a resposta.

A chave da Anthropic fica **só aqui**, em variável de ambiente. Como o repositório da app é público,
**nunca** a coloque no código da app.

Proteções: sessão Firebase obrigatória (só utilizadores da sua app), origem (CORS) restrita,
limite por utilizador/hora, teto diário global, corpo máximo de 8 KB, validação do plano devolvido.
Se este servidor falhar ou não estiver configurado, a app continua a funcionar com o modo básico (palavras-chave).

## Instalar
Precisa de Node 18+ e de uma chave em https://console.anthropic.com/.

```bash
cp .env.example .env     # preencha ANTHROPIC_API_KEY, FIREBASE_PROJECT_ID, ALLOWED_ORIGINS
export $(grep -v '^#' .env | xargs)
npm start                # http://localhost:8787  (GET /health para verificar)
npm test                 # 13 testes locais (sem gastar créditos)
```

- `FIREBASE_PROJECT_ID`: o "projectId" do FIREBASE_CONFIG da app (Firebase → Definições do projeto).
- `ALLOWED_ORIGINS`: o endereço exato onde a app está publicada, ex.: `https://fonsprince.pages.dev`.

### Publicar (qualquer alojamento Node serve)
Render, Railway, Fly.io ou um VPS: crie um serviço Node a partir desta pasta, comando de arranque
`npm start`, e defina as variáveis do `.env.example` no painel do serviço (não envie o ficheiro `.env`).
No Render, o plano gratuito adormece após inatividade: a primeira pergunta pode demorar uns segundos
(a app espera 12 s e depois usa o modo básico).

## Ligar à app
Em `controlo-financeiro.html`, preencha no topo do script:

```js
const AI_PROXY_URL = "https://o-seu-servico.onrender.com";
```

Ou, sem reconstruir nada: na caixa "Pergunte ao seu dinheiro", toque em "Ativar IA" e cole o endereço
(fica guardado só nesse dispositivo).

## Custo
Cada pergunta usa uns ~400 tokens de entrada e ~150 de saída no Haiku — frações de cêntimo.
`RATE_PER_HOUR` e `DAILY_CAP` limitam o gasto máximo.
