const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

async function enviarMensagemDeVerificacao(client, channelId) {
  const channel = await client.channels.fetch(channelId).catch(() => null);
  if (!channel) throw new Error('Canal de verificação não encontrado.');

  const embed = new EmbedBuilder()
    .setColor('#000000')
    .setTitle('🌐 Selecione seu idioma • Selecciona tu idioma')
    .setDescription('Escolha abaixo para continuar (PT) • Elige abajo para continuar (ES).');

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('lang_pt').setLabel('🇧🇷 Português').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('lang_es').setLabel('🇪🇸 Español').setStyle(ButtonStyle.Secondary),
  );

  await channel.send({ embeds: [embed], components: [row] });
}

module.exports = { enviarMensagemDeVerificacao };
