// utils/verificacao.js
const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');

async function enviarMensagemDeVerificacao(canal) {
  if (!canal) return;

  // opcional: deixar canal só leitura para @everyone (sem quebrar perms existentes)
  try {
    const everyone = canal.guild.roles.everyone;
    const current = canal.permissionOverwrites.cache.get(everyone.id);
    if (!current) {
      await canal.permissionOverwrites.edit(everyone, {
        SendMessages: false,
        AddReactions: false,
      }).catch(() => {});
    }
  } catch (_) {}

  const embed = new EmbedBuilder()
    .setColor('#000000')
    .setTitle('🌐 Selecione seu idioma • Selecciona tu idioma')
    .setDescription([
      'Escolha abaixo para continuar a verificação no seu idioma.',
      'Elige abajo para continuar la verificación en tu idioma.',
    ].join('\n'));

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('lang_pt').setLabel('🇧🇷 Português').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('lang_es').setLabel('🇪🇸 Español').setStyle(ButtonStyle.Secondary),
  );

  // evita duplicar: se já existe uma mensagem fixada do bot, atualiza
  try {
    const fetched = await canal.messages.fetch({ limit: 20 }).catch(() => null);
    const antiga = fetched?.find(m =>
      m.pinned &&
      m.author?.bot &&
      m.embeds?.[0]?.title?.includes('Selecione seu idioma')
    );
    if (antiga) {
      await antiga.edit({ embeds: [embed], components: [row] }).catch(() => {});
      return;
    }
  } catch (_) {}

  const msg = await canal.send({ embeds: [embed], components: [row] });
  try { await msg.pin(); } catch (_) {}
}

module.exports = { enviarMensagemDeVerificacao };
