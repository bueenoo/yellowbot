
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

function enviarMensagemDeTicket(channel) {
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('ticket_doacao').setLabel('💰 Doações').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('ticket_denuncia').setLabel('🚨 Denúncia').setStyle(ButtonStyle.Danger),
    new ButtonBuilder().setCustomId('ticket_suporte').setLabel('⚙️ Suporte Técnico').setStyle(ButtonStyle.Primary)
  );

  channel.send({
    content: '📬 Selecione uma das opções abaixo para abrir um ticket:',
    components: [row]
  });
}

module.exports = { enviarMensagemDeTicket };
