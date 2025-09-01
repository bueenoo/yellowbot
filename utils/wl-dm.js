
const {
  EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle
} = require('discord.js');
const cfg = require('../config.json');

async function ask(dm, userId, question, timeMs = 300000) {
  await dm.send({ content: question });
  const collected = await dm.awaitMessages({ max: 1, time: timeMs, errors: ['time'] }).catch(()=>null);
  if (!collected || !collected.first()) throw new Error('timeout');
  return collected.first().content.trim();
}

async function askExp(dm, lang) {
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('exp_yes').setLabel(lang==='PT'?'Sim':'Sí').setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId('exp_no').setLabel(lang==='PT'?'Não':'No').setStyle(ButtonStyle.Danger),
  );
  const q = lang==='PT' ? 'Você tem experiência prévia com RP?' : '¿Tienes experiencia previa con RP?';
  const msg = await dm.send({ content: q, components: [row] });
  const i = await msg.awaitMessageComponent({ time: 300000 }).catch(()=>null);
  if (!i) throw new Error('timeout');
  await i.update({ content: `${q}\n> ${i.customId==='exp_yes'?(lang==='PT'?'Sim':'Sí'):(lang==='PT'?'Não':'No')}`, components: [] });
  return i.customId === 'exp_yes' ? (lang==='PT'?'Sim':'Sí') : (lang==='PT'?'Não':'No');
}

async function iniciarFluxoWL(client, user, guild, lang='PT') {
  const intro = lang==='PT'
    ? 'Iniciando whitelist. Responda às perguntas abaixo.'
    : 'Iniciando whitelist. Responde las preguntas abajo.';

  const dm = await user.createDM();
  await dm.send(intro).catch(()=>{});

  const nome = await ask(dm, user.id, lang==='PT'?'Qual é o seu **Nome**?':'¿Cuál es tu **Nombre**?');
  const idade = await ask(dm, user.id, lang==='PT'?'Qual é a sua **Idade**?':'¿Cuál es tu **Edad**?');
  const discordId = user.id;
  const steam = await ask(dm, user.id, lang==='PT'?'Qual é sua **Steam ID**? (17 dígitos ou URL /profiles)':'¿Cuál es tu **Steam ID**? (17 dígitos o URL /profiles)');
  const experiencia = await askExp(dm, lang);

  let historia = '';
  while (true) {
    historia = await ask(dm, user.id, lang==='PT'
      ? 'Escreva agora a **história do personagem** (máx. 600 caracteres).'
      : 'Escribe ahora la **historia del personaje** (máx. 600 caracteres).'
    );
    if (historia.length <= 600) break;
    await dm.send(lang==='PT'?'⚠️ A história ultrapassou 600 caracteres. Tente novamente.':'⚠️ La historia superó 600 caracteres. Inténtalo otra vez.');
  }

  // Envia ficha para canal interno com botões Aprovar/Reprovar
  const staffCh = await client.channels.fetch(cfg.staffWhitelistReviewChannelId).catch(()=>null);
  if (staffCh) {
    const embed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setTitle(lang==='PT'?'Nova WL • PT':'Nueva WL • ES')
      .addFields(
        { name: 'Usuário', value: `<@${user.id}> (\`${user.id}\`)`, inline: false },
        { name: lang==='PT'?'Nome':'Nombre', value: nome, inline: true },
        { name: lang==='PT'?'Idade':'Edad', value: idade, inline: true },
        { name: 'Discord ID', value: discordId, inline: true },
        { name: 'Steam ID', value: steam, inline: false },
        { name: lang==='PT'?'Experiência RP':'Experiencia RP', value: experiencia, inline: true },
        { name: lang==='PT'?'História':'Historia', value: historia || '—', inline: false },
      )
      .setFooter({ text: `Lang=${lang}` });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId(`wl_approve:${user.id}:${lang}`).setLabel('✅ Aprovar').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId(`wl_reject:${user.id}:${lang}`).setLabel('❌ Reprovar').setStyle(ButtonStyle.Danger),
    );

    await staffCh.send({ embeds: [embed], components: [row] }).catch(()=>{});
  }

  // Aviso no canal de espera
  const waitCh = await guild.channels.fetch(cfg.waitingChannelId).catch(()=>null);
  if (waitCh) {
    await waitCh.send({
      content: lang==='PT'
        ? `⏳ <@${user.id}> enviou a whitelist e aguarda análise da staff.`
        : `⏳ <@${user.id}> envió la whitelist y espera revisión del staff.`
    }).catch(()=>{});
  }

  await dm.send(lang==='PT'
    ? '✅ Suas respostas foram enviadas para análise. Acompanhe o canal de **espera** no servidor.'
    : '✅ Tus respuestas fueron enviadas para revisión. Revisa el canal de **espera** en el servidor.'
  ).catch(()=>{});
}

module.exports = { iniciarFluxoWL };
