const { ChannelType, PermissionsBitField } = require('discord.js');

function ticketHandler(client) {
  client.on('interactionCreate', async interaction => {
    if (!interaction.isButton()) return;

    let tipo = '';
    if (interaction.customId === 'ticket_doacao') tipo = 'Doação';
    else if (interaction.customId === 'ticket_denuncia') tipo = 'Denúncia';
    else if (interaction.customId === 'ticket_suporte') tipo = 'Suporte Técnico';
    else return;

    const canal = await interaction.guild.channels.create({
      name: `🧾┃ticket-${interaction.user.username}`.toLowerCase(),
      type: ChannelType.GuildText,
      parent: interaction.channel.parentId,
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
        },
        {
          id: client.user.id,
          allow: [PermissionsBitField.Flags.ViewChannel]
        }
      ]
    });

    canal.send({
      content: `🎫 Olá ${interaction.user}, obrigado por abrir um ticket de **${tipo}**.
Em breve um membro da equipe responderá.`,
    });

    await interaction.reply({
      content: `✅ Seu ticket de **${tipo}** foi criado com sucesso!`,
      ephemeral: true
    });
  });
}

module.exports = ticketHandler;
