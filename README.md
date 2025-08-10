# BlackBot — Sem TOKEN local (Railway-only)

Este projeto foi configurado para **não precisar de TOKEN localmente**.
- Local: `npm run deploy` pula sem erro se não houver `TOKEN/CLIENT_ID/GUILD_ID`. `npm start` sai sem iniciar.
- Railway/produção: defina `TOKEN`, `CLIENT_ID` e `GUILD_ID` nas Variáveis do projeto e o bot sobe normalmente.

## Passos (Railway)
1. Configure as variáveis:
   - `TOKEN` = Token do Bot (Developer Portal → Bot → Reset Token)
   - `CLIENT_ID` = Application ID (General Information)
   - `GUILD_ID` = ID do servidor Discord
2. Deploy:
   - Build Command: `npm install && npm run deploy`
   - Start Command: `npm start`

## Comandos
- `/setup` (apenas @Staff — ID: 1401235779748892694): publica verificação e cadastro PVE.
- `/info` (restrito ao canal configurado): mostra RP **Offline** e PVE **189.127.165.165:2382**.

## Ajustes
- Edite `config.json` e preencha `cargoRP` e `cargoPVE` com IDs reais.
- Garanta que o cargo do bot esteja **acima** desses cargos na hierarquia.
