# Blackbot (PT/ES)

Bot de verificação com seleção de idioma (PT/ES), whitelist por DM (RP) e cadastro PVE (SteamID).

- Mensagem fixa no canal de verificação com botões de idioma.
- Ao escolher idioma, o usuário recebe automaticamente o cargo @PT ou @ES e vê as opções RP / PVE em **mensagem efêmera**.
- RP: perguntas por DM (nome, idade, Discord ID, Steam ID, experiência com RP [sim/não] e história até 600 caracteres). Envio para canal interno com botões **Aprovar** / **Reprovar** (com motivo via modal) e logs em canais de reprovados (PT/ES).
- PVE: instruções efêmeras para enviar SteamID no canal configurado (validação básica de ID/URL).

## Configuração
Crie variáveis no Railway (ou arquivo `.env` local):
```
token=SEU_TOKEN
```

Edite `config.json` com seus IDs (servidor, canais, cargos).

## Executar
```
npm i
npm start
```
