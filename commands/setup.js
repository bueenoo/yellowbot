const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const { enviarMensagemDeVerificacao } = require('../verificacao');
const { publicarCadastroPVE } = require('../pve_message');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setup')
    .setDescription('Publica as mensagens iniciais de verificação e cadastro PVE.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
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
        .setDescription('Canal para postar a verificação (opcional, usa o padrão do config se vazio)')
        .addChannelTypes(ChannelType.GuildText)
    )
    .addChannelOption(opt =>
      opt.setName('canal_pve')
        .setDescription('Canal para postar o cadastro PVE (opcional, usa o padrão do config se vazio)')
        .addChannelTypes(ChannelType.GuildText)
    ),
  async execute(interaction) {
    const STAFF_ROLE_ID = '1401235779748892694';
    if (!interaction.member.roles.cache.has(STAFF_ROLE_ID)) {
      return interaction.reply({
        content: '🚫 Apenas membros com o cargo @Staff podem usar este comando.',
        ephemeral: true,
      });
    }
    const acao = interaction.options.getString('acao');
    const chVer = interaction.options.getChannel('canal_verificacao');
    const chPve = interaction.options.getChannel('canal_pve');

    await interaction.deferReply({ ephemeral: true });

    try {
      if (acao === 'verificacao' || acao === 'ambos') {
        await enviarMensagemDeVerificacao(interaction.client, chVer?.id || null);
      }
      if (acao === 'pve' || acao === 'ambos') {
        await publicarCadastroPVE(interaction.client, chPve?.id || null);
      }
      await interaction.editReply('✅ Setup concluído.');
    } catch (e) {
      console.error(e);
      await interaction.editReply('❌ Falha ao publicar. Verifique permissões e IDs dos canais.');
    }
  },
};