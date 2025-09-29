# Blackbot – WL RP + PvE (botão único) – Discord.js v14

Fluxo completo:
1. Mensagem de **idioma** (PT/ES).
2. Escolha **Servidor RolePlay** ou **Servidor PvE**.
   - **RP**: abre *modal* com Nome, Idade, Steam ID, Experiência e História; envia para canal de staff com **Aprovar/Reprovar**; notifica o jogador no canal de espera.
   - **PvE**: envia no canal de cadastro um **botão de uso único** para o jogador. Ao clicar, abre *modal* para Steam ID; dá o cargo, registra no canal de log e desativa o botão.

## Instalação
```bash
npm i
cp .env.example .env
# edite o .env com TOKEN, GUILD_ID e VERIFY_CHANNEL_ID
```
