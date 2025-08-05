// verificacao-pve.js
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, Events, ChannelType, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');
const logChannelId = "1402195335048204298"; // Canal da staff
const pveRoleId = "1401248503987962028";

module.exports = (client) => {
  client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isButton()) return;

    if (interaction.customId === 'pve_verificar') {
      const existing = interaction.guild.channels.cache.find(c =>
        c.name === `verificacao-${interaction.user.id}` &&
        c.parentId === "1401951160629461002"
      );

      if (existing) {
        return interaction.reply({
          content: 'Você já iniciou a verificação.',
          ephemeral: true
        });
      }

      const channel = await interaction.guild.channels.create({
        name: `verificacao-${interaction.user.id}`,
        type: ChannelType.GuildText,
        parent: "1401951160629461002",
        permissionOverwrites: [
          {
            id: interaction.guild.id,
            deny: [PermissionFlagsBits.ViewChannel]
          },
          {
            id: interaction.user.id,
            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]
          }
        ]
      });

      await interaction.reply({
        content: `✅ Verificação iniciada! Vá para o canal ${channel} para inserir sua Steam ID.`,
        ephemeral: true
      });

      const confirmButton = new ButtonBuilder()
        .setCustomId('confirmar_steamid')
        .setLabel('Enviar Steam ID')
        .setStyle(ButtonStyle.Success);

      const row = new ActionRowBuilder().addComponents(confirmButton);

      await channel.send({
        content: 'Por favor, envie sua Steam ID abaixo **(apenas números)** e clique no botão para confirmar.',
        components: [row]
      });
    }

    if (interaction.customId === 'confirmar_steamid') {
      const messages = await interaction.channel.messages.fetch({ limit: 10 });
      const userMessage = messages.find(m => m.author.id === interaction.user.id && /^\d+$/.test(m.content.trim()));

      if (!userMessage) {
        return interaction.reply({ content: '❗ Envie sua Steam ID antes de clicar no botão.', ephemeral: true });
      }

      const steamId = userMessage.content.trim();

      try {
        const role = interaction.guild.roles.cache.get(pveRoleId);
        await interaction.member.roles.add(role);

        const logChannel = await client.channels.fetch(logChannelId);
        await logChannel.send(
          `📥 Novo registro PVE:\n👤 Usuário: ${interaction.user.tag} (${interaction.user.id})\n🎮 Steam ID: ${steamId}\n📅 Data: ${new Date().toLocaleString("pt-BR")}`
        );

        await interaction.reply({ content: '✅ Verificação concluída! Acesso liberado.', ephemeral: true });
      } catch (err) {
        console.error(err);
        await interaction.reply({ content: '❗ Ocorreu um erro ao atribuir o cargo.', ephemeral: true });
      }
    }
  });
};
