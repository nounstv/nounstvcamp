# Nouns TV Camp

Cliente de governança da Nouns DAO, continuação do [Nouns Camp](https://www.nouns.camp/)
(Obvious, Inc.), encerrado em 30/09/2026 depois que a prop 996 (custos operacionais,
USD 8.500 / 18 meses) não passou. Mantido pela Nouns TV com custo de infraestrutura zero.

Base: fork [modrovsky/nouns-camp](https://github.com/modrovsky/nouns-camp) (Farcaster
removido, RPC customizado), que vem de
[obvious-inc/nouns-camp-monorepo](https://github.com/obvious-inc/nouns-camp-monorepo).
Licença GPL-3.0, mantida. Histórico Git completo preservado (remotes `upstream` e `obvious`).

## O que mudou em relação ao Camp original

- Sem Vercel Edge Config, Vercel Analytics e Sentry. Erros vão para o console; eventos são no-op.
- Contas canary/beta vêm de `CAMP_CANARY_ACCOUNTS` / `CAMP_BETA_ACCOUNTS` (lista de endereços).
- WalletConnect é opcional: sem `NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID` o conector não é registrado.
- Subgraph sem URL (ex.: `FLOWS_SUBGRAPH_URL`) não gera rewrite.
- `BUILD_ID` sai do `git rev-parse` quando não está na Vercel.
- Tema Nouns TV em `apps/nouns-camp/src/theme.js`: Londrina Solid em títulos, Inter no resto
  (via `next/font`), vermelho da marca (`#e40536`, hue 347) como primária, fundo escuro `#0a0a0a`.
- Navegação: noggles Nouns TV + "Camp · by Nouns TV" em todas as páginas; botão de tema claro/escuro na barra.
- Menu: Nouns TV e Nouns TV News em "External"; GitHub aponta para nounstv/nounstvcamp.
- Ícones, apple-icon e OG/Twitter image (1200×630) com a marca Nouns TV. Título/OG: "Nouns TV Camp".
- Banner de sunset removido.
- Página da proposta mostra o **resumo em áudio** gerado pela Nouns TV News
  (`/api/news-summary/[proposalId]` faz proxy de `newsapi.nounstv.com`, cache 10 min;
  player em `components/proposal-audio-summary.jsx`). `NOUNS_TV_NEWS_API_URL` opcional.
- Flows (flows.wtf) removido.

## Infra necessária (tudo free tier)

| Dependência | Origem |
|---|---|
| Subgraphs `nouns-mainnet` e `nouns-propdates` | Goldsky, públicos (já no `.env.template`) |
| RPC Ethereum | `NEXT_PUBLIC_RPC_URL` (publicnode no dev) ou Alchemy free |
| WalletConnect | Reown Cloud project ID (opcional) |
| Etherscan / Tenderly | opcionais: decodificação de contratos / simulação de props |
| Hospedagem | Vercel Hobby (Next.js 15, Node ≥ 22) |

## Desenvolvimento

```bash
pnpm install
cp apps/nouns-camp/.env.template apps/nouns-camp/.env.local   # preencher SESSION_SEAL_SECRET
pnpm build                       # builda packages/common, packages/ui-web e o app (turbo)
pnpm -F nouns-camp dev -- -p 3100
```

`APP_HOST` precisa bater com o host do browser (`localhost:3100` no dev) por causa do SIWE.
No workspace, `.claude/launch.json` tem a configuração `camp` na porta 3100.

Pendências conhecidas (herdadas do upstream): warnings de hidratação em dev, `preventFocusOnPress`
no DOM, erro de `buildSVG` para alguns seeds no feed, CORS do ipfs.io em propdates.

## Deploy

Projeto Vercel próprio com root directory `apps/nouns-camp` e as variáveis do `.env.template`
(`APP_HOST` = domínio final, ex. `camp.nounstv.com` ou `nounstv.camp`). Nada aqui toca a Nouns TV.
