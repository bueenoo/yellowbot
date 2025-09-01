
const {
  EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField
} = require('discord.js');
const cfg = require('../config.json');

async function enviarMensagemDeVerificacao(client) {
  const ch = await client.channels.fetch(cfg.verificationChannelId);
  if (!ch) throw new Error('Canal de verificação não encontrado');

  // Remove mensagens antigas do bot para não acumular
  const msgs = await ch.messages.fetch({ limit: 50 }).catch(()=>null);
  if (msgs) {
    const own = msgs.filter(m => m.author.id === client.user.id);
    for (const m of own.values()) {
      try { await m.delete(); } catch {}
    }
  }

  const embed = new EmbedBuilder()
    .setColor(0x2f3136)
    .setTitle('Selecione seu idioma • Selecciona tu idioma')
    .setDescription('Escolha abaixo para continuar a verificação no seu idioma.\nElige abajo para continuar la verificación en tu idioma.');

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('lang_pt').setLabel('🇧🇷 Português').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('lang_es').setLabel('🇪🇸 Español').setStyle(ButtonStyle.Secondary),
  );

  const m = await ch.send({ embeds: [embed], components: [row] });
  try { await m.pin(); } catch {}
}

module.exports = { enviarMensagemDeVerificacao };
