// utils/verificacao.js
const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionFlagsBits,
} = require('discord.js');

/**
 * Envia (ou reenvia) a mensagem fixa de seleção de idioma no canal de verificação.
 * - Mostra dois botões: 🇧🇷 Português (lang_pt) e 🇪🇸 Español (lang_es)
 * - Tenta fixar (pin) a mensagem; se faltar permissão, apenas ignora.
 * - Opcionalmente bloqueia o canal para evitar conversas (só leitura).
 */
async function enviarMensagemDeVerificacao(canal) {
  if (!canal) return;

  // (opcional) Deixar o canal somente leitura para @everyone
  try {
    const everyone = canal.guild.roles.everyone;
    // Não mexe se já existir overwrite; evita sobrescrever configs manuais
    const current = canal.permissionOverwrites.cache.get(everyone.id);
    if (!current) {
      await canal.permissionOverwrites.edit(everyone, {
        SendMessages: false,
        AddReactions: false,
      }).catch(() => {});
    }
  } catch (e) {
    // silencioso para não travar o boot
  }

  const embed = new EmbedBuilder()
    .setColor('#000000')
    .setTitle('🌐 Selecione seu idioma • Selecciona tu idioma')
    .setDescription(
      [
        'Escolha abaixo para continuar a verificação no seu idioma.',
        'Elige abajo para continuar la verificación en tu idioma.',
      ].join('\n')
    );

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('lang_pt')
      .setLabel('🇧🇷 Português')
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId('lang_es')
      .setLabel('🇪🇸 Español')
      .setStyle(ButtonStyle.Secondary)
  );

  // Para evitar duplicatas, tenta encontrar uma mensagem fixa anterior do bot
  try {
    const fetched = await canal.messages.fetch({ limit: 20 }).catch(() => null);
    const antiga = fetched?.find(m =>
      m.pinned &&
      m.author?.bot &&
      m.embeds?.[0]?.title?.includes('Selecione seu idioma')
    );
    if (antiga) {
      // Atualiza componentes/embeds se quiser
      await antiga.edit({ embeds: [embed], components: [row] }).catch(() => {});
      return;
    }
  } catch (_) {}

  const msg = await canal.send({ embeds: [embed], components: [row] });
  try { await msg.pin(); } catch (_) {}
}

module.exports = { enviarMensagemDeVerificacao };
