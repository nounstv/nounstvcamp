# Client incentives da Nouns DAO — registro do Nouns TV Camp

Contrato: **Nouns Client Incentives Rewards** (proxy)
`0x883860178F95d0C82413eDc1D6De530cB4771d55` — implementação `0xaaF173E6b65aa4473C830EDB402D26B7A33c5E94`.

Carteira dona do client: `0x72396daD00b9ED4591bE8F829EB62997eD16608c` (Nouns TV).
Simulado em 04/11/2026: `registerClient` cunha o **clientId 41** (~200 k gas, sem valor).

## 1. Registrar (uma vez, assinado pela carteira da Nouns TV)

**Pela Etherscan:** `https://etherscan.io/address/0x883860178F95d0C82413eDc1D6De530cB4771d55#writeProxyContract`
→ Connect to Web3 com `0x7239…608c` → `registerClient`:

- `name`: `Nouns TV Camp`
- `description`: `Nouns DAO governance client by Nouns TV - https://camp.nounstv.com`

**Ou enviando a transação crua** (MetaMask/Rabby "hex data"):

```
to:    0x883860178F95d0C82413eDc1D6De530cB4771d55
value: 0
data:  0x4364d97300000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000000d4e6f756e732054562043616d700000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000424e6f756e732044414f20676f7665726e616e636520636c69656e74206279204e6f756e73205456202d2068747470733a2f2f63616d702e6e6f756e7374762e636f6d000000000000000000000000000000000000000000000000000000000000
```

O evento `ClientRegistered` da transação confirma o id. O NFT do client fica na carteira; só o dono saca.

## 2. Ligar o id no Camp

Vercel › nounstvcamp › Environment Variables: `NEXT_PUBLIC_CAMP_CLIENT_ID=41` (production, preview, development) e redeploy.
A partir daí votos, propostas e lances enviados pelo Camp carregam o id.

## 3. Como as recompensas acumulam (parâmetros lidos na chain em 04/11/2026)

| Fonte | Fatia da receita de leilões | Condição |
|---|---|---|
| Propostas criadas | 2,5 % | prop com ≥ 10 % de quórum; período fecha a cada 30 dias ou 10 props |
| Votos | 2,5 % | proporcional aos votos enviados pelo client |
| Leilões | 5 % do lance vencedor | client usado pelo vencedor; atualização a cada ≥ 7 leilões |

Qualquer um pode chamar `updateRewardsForProposalWritingAndVoting` / `updateRewardsForAuctions`.
Saldo: `clientBalance(41)`. Saque: `withdrawClientBalance(41, para, valor)` pela carteira dona.

Aprovação formal (`setClientApproval`) só a DAO dá por proposta; na prática clientes não aprovados
também acumulam e sacam (ex.: ANouns, Prop Launchpad). Vale pedir depois, por visibilidade.
