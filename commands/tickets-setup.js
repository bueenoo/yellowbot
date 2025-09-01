
const { SlashCommandBuilder } = require('discord.js');
const { enviarMensagemDeTickets } = require('../utils/tickets');
module.exports = {
  data: new SlashCommandBuilder().setName('tickets-setup').setDescription('Publica a mensagem de tickets no canal atual.'),
  async execute(interaction) {
    await enviarMensagemDeTickets(interaction.channel);
    await interaction.reply({ content: '✅ Mensagem de tickets publicada.', ephemeral: true });
  }
}
