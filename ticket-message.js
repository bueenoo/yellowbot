const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

function enviarMensagemDeTicket(canal) {
  const embed = new EmbedBuilder()
    .setTitle('📑 Escolha o tipo de atendimento:')
    .setDescription('Clique em um dos botões abaixo para abrir um ticket.')
    .setColor('DarkButNotBlack');

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

  canal.send({ embeds: [embed], components: [row] });
}

module.exports = { enviarMensagemDeTicket };