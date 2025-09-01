
// utils/check-perms.js
const { PermissionsBitField } = require('discord.js');

// Permissões mínimas necessárias para mandar a mensagem de verificação
const REQUIRED = [
  PermissionsBitField.Flags.ViewChannel,
  PermissionsBitField.Flags.SendMessages,
  PermissionsBitField.Flags.EmbedLinks,
  PermissionsBitField.Flags.ReadMessageHistory,
  // Se quiser fixar mensagens, adicione também:
  PermissionsBitField.Flags.ManageMessages,
];

function listMissing(perms) {
  const misses = [];
  for (const need of REQUIRED) {
    if (!perms.has(need)) misses.push(need);
  }
  return misses;
}

async function ensureSendable(channel) {
  try {
    const me = channel.guild.members.me;
    if (!me) return { ok: false, missing: ['(bot not in guild cache)'] };

    const perms = channel.permissionsFor(me);
    if (!perms) return { ok: false, missing: ['(no permissions object)'] };

    const missing = listMissing(perms);
    return { ok: missing.length === 0, missing };
  } catch (e) {
    return { ok: false, error: e };
  }
}

module.exports = { ensureSendable };
