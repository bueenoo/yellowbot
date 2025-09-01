const { PermissionsBitField, MessageFlags } = require('discord.js');
const { buildPT, buildES } = require('./whitelist-guides');

async function ensureGuideInChannel(client, channelId, lang) {
  const chan = await client.channels.fetch(channelId).catch(() => null);
  if (!chan) return;
  // If last 50 messages don't contain our guide title, post/pin new one
  const msgs = await chan.messages.fetch({ limit: 20 }).catch(() => null);
  const already = msgs?.find(m => m.author.id === client.user.id && m.embeds?.[0]?.title?.includes('Whitelist'));
  if (already) return;

  const kit = lang === 'pt' ? buildPT() : buildES();
  const sent = await chan.send({ embeds: [kit.embed], components: [kit.row] }).catch(() => null);
  if (sent) {
    await sent.pin().catch(() => {});
  }
}

async function giveLangRoleAndGuide(interaction, lang, cfg) {
  const roleId = lang === 'pt' ? cfg.rolePT : cfg.roleES;
  const channelGuideId = lang === 'pt' ? cfg.canalGuiaPT : cfg.canalGuiaES;

  const role = interaction.guild.roles.cache.get(roleId) || await interaction.guild.roles.fetch(roleId).catch(()=>null);
  if (!role) {
    return interaction.reply({ content: '❗ Cargo de idioma não encontrado. Avise um administrador.', flags: MessageFlags.Ephemeral });
  }

  // Add role
  await interaction.member.roles.add(role).catch(() => {});

  // Ensure guide message exists in guide channel (PT or ES)
  await ensureGuideInChannel(interaction.client, channelGuideId, lang);

  // Confirm to user
  const mention = `<#${channelGuideId}>`;
  const msg = lang === 'pt'
    ? `✅ Idioma definido: **PT**. Acesse ${mention} para ver as instruções.`
    : `✅ Idioma establecido: **ES**. Accede a ${mention} para ver las instrucciones.`;
  await interaction.reply({ content: msg, flags: MessageFlags.Ephemeral }).catch(() => {});
}

module.exports = { giveLangRoleAndGuide, ensureGuideInChannel };
