// Envia mensagem multilíngue PT/ES com botões de idioma
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');

async function enviarMensagemDeVerificacao(client, canalId) {
  const canal = await client.channels.fetch(canalId);
  if (!canal) throw new Error('Canal de verificação não encontrado.');

  const embed = new EmbedBuilder()
    .setColor('#000000')
    .setTitle('🌍 Escolha seu idioma / Elige tu idioma')
    .setDescription('Selecione abaixo para continuar / Selecciona abajo para continuar:');

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('lang_pt').setLabel('🇧🇷 Português').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('lang_es').setLabel('🇪🇸 Español').setStyle(ButtonStyle.Secondary)
  );

  const sent = await canal.send({ embeds: [embed], components: [row] });
  await sent.pin();
}

async function onInteraction(interaction, client) {
  if (!interaction.isButton()) return false;

  if (interaction.customId === 'lang_pt') {
    const role = interaction.guild.roles.cache.get('1411977536388468799');
    if (role) await interaction.member.roles.add(role).catch(() => null);
    await interaction.reply({ content: '✅ Você selecionou **Português**. Acesse o canal <#1401950359106355321>.', ephemeral: true });
    return true;
  }

  if (interaction.customId === 'lang_es') {
    const role = interaction.guild.roles.cache.get('1411977277914353767');
    if (role) await interaction.member.roles.add(role).catch(() => null);
    await interaction.reply({ content: '✅ Has seleccionado **Español**. Accede al canal <#1411982536405418154>.', ephemeral: true });
    return true;
  }

  return false;
}

module.exports = { enviarMensagemDeVerificacao, onInteraction };