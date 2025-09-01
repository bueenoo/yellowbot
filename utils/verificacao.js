const {
  EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle,
} = require('discord.js');

async function enviarMensagemDeVerificacao(canal) {
  if (!canal) return;
  const embed = new EmbedBuilder()
    .setColor('#000000')
    .setTitle('🌐 Selecione seu idioma • Selecciona tu idioma')
    .setDescription('Escolha abaixo para continuar a verificação no seu idioma.\nElige abajo para continuar la verificación en tu idioma.');

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('lang_pt').setLabel('🇧🇷 Português').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('lang_es').setLabel('🇪🇸 Español').setStyle(ButtonStyle.Secondary),
  );

  try {
    const fetched = await canal.messages.fetch({ limit: 20 }).catch(() => null);
    const antiga = fetched?.find(m => m.pinned && m.author?.bot && m.embeds?.[0]?.title?.includes('Selecione seu idioma'));
    if (antiga) {
      await antiga.edit({ embeds: [embed], components: [row] });
      return;
    }
  } catch {}

  const msg = await canal.send({ embeds: [embed], components: [row] });
  try { await msg.pin(); } catch {}
}

module.exports = { enviarMensagemDeVerificacao };