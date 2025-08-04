
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

function enviarMensagemDeVerificacao(channel) {
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('verificar_entrada')
      .setLabel('✅ Entrar no Yellowstone')
      .setStyle(ButtonStyle.Success)
  );

  const texto = `🌄 **Bem-vindo ao Yellowstone!**

Nosso servidor é uma experiência única de sobrevivência.  
Clique no botão abaixo para liberar seu acesso e entrar para nossa comunidade.

Seja respeitoso, leia as regras e divirta-se!

🟡 *Ao clicar, você receberá acesso aos canais principais.*`;

  channel.send({
    content: texto,
    components: [row]
  });
}

module.exports = { enviarMensagemDeVerificacao };
