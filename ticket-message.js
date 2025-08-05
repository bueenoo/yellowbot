const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');

function enviarMensagemDeTicket(canal) {
  const embed = new EmbedBuilder()
    .setColor('#2c2f33')
    .setTitle('📑 Escolha o tipo de atendimento:')
    .setDescription('Clique em um dos botões abaixo para abrir um ticket.');

  const row = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder().setCustomId('doacao').setLabel('💰 Doação').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId('denuncia').setLabel('🚨 Denúncia').setStyle(ButtonStyle.Danger),
      new ButtonBuilder().setCustomId('suporte').setLabel('⚙️ Suporte Técnico').setStyle(ButtonStyle.Primary)
    );

  canal.send({ embeds: [embed], components: [row] });
}

module.exports = { enviarMensagemDeTicket };
