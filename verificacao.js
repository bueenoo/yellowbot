const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');

function enviarMensagemDeVerificacao(canal) {
  const embed = new EmbedBuilder()
    .setColor('#000000')
    .setTitle('👋 Bem-vindo ao Black!')
    .setDescription(
      'Nosso servidor é uma experiência única de sobrevivência.\n\n' +
      'Clique em um dos botões abaixo para escolher seu modo de jogo e liberar o acesso:\n\n' +
      '🕵️‍♂️ **Black RP:** Servidor com whitelist e história\n' +
      '⚔️ **Black PVE:** Servidor PVE com cadastro via Steam\n\n' +
      '📜 Seja respeitoso, leia as regras e divirta-se!\n\n' +
      'Servidor Black • DayZ RP e PVE'
    );

  const row = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder().setCustomId('verificar_rp').setLabel('🕵️‍♂️ Black RP').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('verificar_pve').setLabel('⚔️ Black PVE').setStyle(ButtonStyle.Secondary)
    );

  canal.send({ embeds: [embed], components: [row] });
}

module.exports = { enviarMensagemDeVerificacao };
