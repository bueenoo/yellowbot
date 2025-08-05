const { ChannelType, PermissionsBitField } = require('discord.js');
const { categoriaTickets } = require('./config.json');

function ticketHandler(client) {
  client.on('interactionCreate', async interaction => {
    if (!interaction.isButton()) return;

    const tipos = {
      ticket_doacao: '💰・doação',
      ticket_denuncia: '🚨・denúncia',
      ticket_suporte: '⚙️・suporte'
    };

    const nomeCanal = tipos[interaction.customId];
    if (!nomeCanal) return;

    const canalExistente = interaction.guild.channels.cache.find(canal =>
      canal.name === `${nomeCanal}-${interaction.user.username.toLowerCase()}`
    );

    if (canalExistente) {
      return interaction.reply({ content: '❗ Você já possui um ticket aberto.', ephemeral: true });
    }

    try {
      const canal = await interaction.guild.channels.create({
        name: `${nomeCanal}-${interaction.user.username}`,
        type: ChannelType.GuildText,
        parent: categoriaTickets,
        permissionOverwrites: [
          {
            id: interaction.guild.roles.everyone,
            deny: [PermissionsBitField.Flags.ViewChannel]
          },
          {
            id: interaction.user.id,
            allow: [
              PermissionsBitField.Flags.ViewChannel,
              PermissionsBitField.Flags.SendMessages,
              PermissionsBitField.Flags.ReadMessageHistory
            ]
          }
        ]
      });

      await canal.send(`🎟️ Olá <@${interaction.user.id}>, em que podemos ajudar?`);
      await interaction.reply({ content: '✅ Ticket criado com sucesso.', ephemeral: true });
    } catch (error) {
      console.error('Erro ao criar ticket:', error);
      await interaction.reply({ content: '❗ Ocorreu um erro ao criar o ticket.', ephemeral: true });
    }
  });
}

module.exports = ticketHandler;