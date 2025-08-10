# BlackBot (DayZ) — Whitelist RP & Cadastro PVE + /setup

Bot Discord para gerenciar whitelist do **Black RP** por DM e cadastro de **Steam ID para o Black PVE** por botão/modal.
Inclui o comando **/setup** para publicar as mensagens iniciais.

## Requisitos
- Node.js 18+
- `discord.js` v14
- Token do bot, Application ID e Guild ID

## Instalação
```bash
npm i
```

Crie um arquivo `.env` na raiz (ou configure as envs no host):
```env
TOKEN=SEU_TOKEN_DO_BOT
CLIENT_ID=ID_DA_APLICACAO
GUILD_ID=ID_DO_SERVIDOR
```

Edite `config.json` com os IDs dos canais/cargos.

## Registrar comandos
```bash
npm run deploy
```

## Iniciar o bot
```bash
npm start
```

## /setup
Publica as mensagens iniciais.
- `acao`: `verificacao` | `pve` | `ambos`
- `canal_verificacao`: (opcional) canal alvo da mensagem de verificação
- `canal_pve`: (opcional) canal alvo da mensagem de cadastro PVE

Exemplos:
- `/setup acao:ambos` (usa canais do `config.json`)
- `/setup acao:verificacao canal_verificacao:#verificação`
- `/setup acao:pve canal_pve:#cadastro-pve`

## /info
Mostra:
- RP: Offline — em construção
- PVE: IP 189.127.165.165, Porta 2382
Restringido ao canal `allowedInfoChannel` em `config.json`.

## Observações
- Garanta que o cargo do bot esteja ACIMA de `cargoRP` e `cargoPVE` para conseguir atribuir.
- Ative os intents necessários no Developer Portal: *Server Members* e *Message Content*.
- Convite do bot deve ter os scopes `bot` e `applications.commands`.
