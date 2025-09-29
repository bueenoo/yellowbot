# Blackbot – WL RP + PvE (botão único) – Discord.js v14

Fluxo completo:
1) Mensagem de **idioma** (PT/ES).
2) Escolha **Servidor RolePlay** ou **Servidor PvE**.
   - **RP**: abre *modal* com Nome, Idade, Steam ID, Experiência e História; envia para canal de staff com **Aprovar/Reprovar**; notifica o jogador no canal de espera.
   - **PvE**: envia no canal de cadastro (config) um **botão de uso único** para o jogador. Ao clicar, abre *modal* para Steam ID; dá o cargo, registra no canal de log e desativa o botão.

## Requisitos
- Node 18+
- Permissões do bot: **Gerenciar Cargos**, ler/escrever nos canais configurados.

## Instalação
```bash
npm i
cp .env.example .env
# edite o .env com TOKEN, GUILD_ID e VERIFY_CHANNEL_ID
```

### Configure os IDs e nomes dentro do arquivo `index.js` na seção CONFIG.
IDs já preenchidos com os que o dono informou (edite se for preciso).

## Rodar
```bash
npm start
```

## Enviar a mensagem de idioma automaticamente
- Defina `VERIFY_CHANNEL_ID` no `.env` e rode:
```bash
npm run send:verify
```

## Estrutura
- `index.js` → handlers de botões, modals e aprovação da staff.
- `tools/sendLanguageMessage.js` → script simples para postar a mensagem de idioma no canal definido no `.env`.


---
## Deploy na Railway (sem expor o token)
1. **Suba o repositório no GitHub** (o arquivo `.env` NÃO vai, pois há `.gitignore` e usamos `.env.example`).
2. Na Railway, crie um novo projeto **a partir do seu repositório**.
3. Em *Variables* (variáveis de ambiente), adicione:
   - `TOKEN` = seu token do bot (NÃO publique no GitHub)
   - `GUILD_ID` = ID do seu servidor
   - `VERIFY_CHANNEL_ID` = canal onde quer enviar a mensagem de idioma (se usar o script `send:verify` localmente, pode ignorar).
4. Em *Deploy*, a Railway vai detectar Node e usar `npm start`.
5. Dê ao bot as permissões e role acima das roles **Sobrevivente RP/PVE**.
6. Se aparecer `TokenInvalid`, confira se a variável `TOKEN` está setada no serviço correto e **redeploy**.
