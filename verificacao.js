const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');

function enviarMensagemDeVerificacao(channel) {
  const embed = new EmbedBuilder()
    .setTitle('👋 Bem-vindo ao Black!')
    .setDescription(
      'Nosso servidor é uma experiência única de sobrevivência.\n\n' +
      'Clique em um dos botões abaixo para escolher seu modo de jogo e liberar o acesso:\n\n' +
      '🎭 **Black RP**: Servidor com whitelist e história\n' +
      '⚔️ **Black PVE**: Servidor PVE com cadastro via Steam\n\n' +
      '📜 Seja respeitoso, leia as regras e divirta-se!'
    )
    .setColor('#000000')
    .setFooter({ text: 'Servidor Black • DayZ RP e PVE' });

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('entrar_rp')
      .setLabel('🎭 Black RP')
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId('entrar_pve')
      .setLabel('⚔️ Black PVE')
      .setStyle(ButtonStyle.Secondary)
  );

  channel.send({ embeds: [embed], components: [row] });
}

module.exports = { enviarMensagemDeVerificacao };
