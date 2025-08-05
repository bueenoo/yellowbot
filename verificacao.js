const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField } = require('discord.js');

async function enviarMensagemDeVerificacao(canal) {
  try {
    const mensagens = await canal.messages.fetch();
    if (mensagens.size > 0) return;

    const embed = new EmbedBuilder()
      .setTitle('🌄 Bem-vindo ao Yellowstone!')
      .setDescription(`Nosso servidor é uma experiência única de sobrevivência.
Clique no botão abaixo para liberar seu acesso e entrar para nossa comunidade.

Seja respeitoso, leia as regras e divirta-se!

🟡 *Ao clicar, você receberá acesso aos canais principais.*`)
      .setColor('DarkGreen');

    const botao = new ButtonBuilder()
      .setCustomId('verificar_entrada')
      .setLabel('✅ Entrar no Yellowstone')
      .setStyle(ButtonStyle.Success);

    const row = new ActionRowBuilder().addComponents(botao);

    const msg = await canal.send({ embeds: [embed], components: [row] });
    await msg.pin();
  } catch (error) {
    console.error('Erro ao enviar mensagem de verificação:', error);
  }
}

module.exports = { enviarMensagemDeVerificacao };
