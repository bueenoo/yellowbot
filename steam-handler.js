module.exports = async function(client, message) {
  if (message.channelId !== "1401951160629461002") return;
  if (!/\d{17}/.test(message.content)) return;

  const steamId = message.content.match(/\d{17}/)[0];
  const role = message.guild.roles.cache.get("1401248503987962028");
  const canalLog = await message.guild.channels.fetch("1402195335048204298");

  try {
    await message.member.roles.add(role);
    const logMsg = `✅ Novo cadastro PVE\n👤 Usuário: ${message.author.tag} (${message.author.id})\n🎮 SteamID: ${steamId}\n🕒 Data: ${new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })}`;
    await canalLog.send(logMsg);
    await message.react('✅');
  } catch (err) {
    console.error("Erro no cadastro Steam ID:", err);
    await message.reply("❗ Não foi possível completar o cadastro.");
  }
}
