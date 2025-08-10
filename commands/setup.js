const { SlashCommandBuilder, ChannelType } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setup')
    .setDescription('Publica mensagens iniciais (Apenas Staff)')
    .addStringOption(opt =>
      opt.setName('acao')
        .setDescription('O que publicar')
        .setRequired(true)
        .addChoices(
          { name: 'verificacao', value: 'verificacao' },
          { name: 'pve', value: 'pve' },
          { name: 'ambos', value: 'ambos' }
        )
    )
    .addChannelOption(opt =>
      opt.setName('canal_verificacao')
        .setDescription('Canal para verificação')
        .addChannelTypes(ChannelType.GuildText)
    )
    .addChannelOption(opt =>
      opt.setName('canal_pve')
        .setDescription('Canal para PVE')
        .addChannelTypes(ChannelType.GuildText)
    ),
  async execute(interaction) {
    return interaction.reply({ content: '🛠 Comando de setup executado.', ephemeral: true });
  },
};
