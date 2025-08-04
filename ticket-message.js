const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

function enviarMensagemDeTicket(canal) {
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('ticket_doacao')
      .setLabel('💰 Doação')
      .setStyle(ButtonStyle.Success),

    new ButtonBuilder()
      .setCustomId('ticket_denuncia')
      .setLabel('🚨 Denúncia')
      .setStyle(ButtonStyle.Danger),

    new ButtonBuilder()
      .setCustomId('ticket_suporte')
      .setLabel('⚙️ Suporte Técnico')
      .setStyle(ButtonStyle.Primary)
  );

  canal.send({
    content: '🎫 **Escolha o tipo de atendimento:**',
    components: [row]
  });
}

module.exports = { enviarMensagemDeTicket };