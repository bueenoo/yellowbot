require('dotenv').config();

const {
  Client,
  GatewayIntentBits,
  Partials,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require('discord.js');

const {
  canalWhitelistRespostas,
  cargoRP,
  canalVerificacao,
  rolePT,
  roleES,
  canalPT,
  canalES,
} = require('./config.json');

const token = process.env.token;
const WL_REPROVADOS_CHANNEL_ID = '1402206198668853299';
const CANAL_ESPERA_APROVACAO_ID = '1402205533272014858';

// ====== LOGS/DIAGNÓSTICOS ======
console.log('[BOOT] Iniciando… Node:', process.version);
if (!token) {
  console.error('[ERRO] Variável de ambiente "token" não encontrada. Defina em Railway → Variables → token');
  process.exit(1);
}
process.on('unhandledRejection', (reason) => console.error('[unhandledRejection]', reason));
process.on('uncaughtException', (err) => console.error('[uncaughtException]', err));

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,     // precisa do "Server Members Intent" ON no portal
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent,   // precisa do "Message Content Intent" ON no portal
  ],
  partials: [Partials.Channel],
});

client.on('error', (e) => console.error('[client.error]', e));
client.on('warn', (w) => console.warn('[client.warn]', w));
client.on('shardError', (e, id) => console.error(`[shardError#${id}]`, e));
client.on('shardDisconnect', (ev, id) => console.warn(`[shardDisconnect#${id}]`, ev?.code, ev?.reason));
client.on('shardReady', (id, unavailable) => console.log(`[shardReady#${id}] unavailable:`, unavailable?.size ?? 0));

const { enviarMensagemDeVerificacao } = require('./utils/verificacao');

client.once('ready', async () => {
  console.log(`✅ READY como ${client.user.tag} (id ${client.user.id})`);
  try {
    await client.user.setPresence({ activities: [{ name: 'Black • verificação' }], status: 'online' });
    console.log('🟢 Presença definida.');

    // Garante a mensagem fixa de seleção de idioma
    const ch = await client.channels.fetch(canalVerificacao);
    await enviarMensagemDeVerificacao(ch);
    console.log('📌 Mensagem de seleção de idioma enviada/afixada.');
  } catch (err) {
    console.error('[ready] Falha ao preparar verificação:', err);
  }
});

/* ================== TEXTOS PT/ES ================== */
function strings(locale) {
  if (locale === 'es') {
    return {
      verifyTitle: 'Black • Verificación de Acceso',
      verifyDesc: [
        'Elige abajo para continuar:',
        '• **Black RP**: iniciar whitelist por DM, basada en la lore del servidor.',
        '• **Black PVE**: registrar tu Steam ID y liberar acceso al PVE.',
      ].join('\n'),
      btnRP: '🕵️‍♂️ Black RP',
      btnPVE: '⚔️ Black PVE',
      rpStartNotice:
        '📬 Iniciamos tu whitelist por **DM**. Revisa tus mensajes directos (habilita DMs de miembros del servidor si están desactivados).',
      askName: '📛 **¿Cuál es tu nombre?**',
      askAge: '🎂 **¿Cuál es tu edad?**',
      askSteam: '🎮 **¿Cuál es tu Steam ID?** (solo números)',
      askExp: '🎭 **¿Tienes experiencia con RP?**',
      btnYes: 'Sí',
      btnNo: 'No',
      askStory:
        '📖 **Envía la historia de tu personaje (máx. 250 caracteres).**\n*Basada en la lore del servidor Black.*',
      storyTooLong:
        '⚠️ La historia debe tener **máximo 250 caracteres**. Intenta nuevamente.',
      rpSentToStaff:
        '✅ **Tu whitelist fue enviada al equipo.** Espera el análisis en el canal **💬・esperando-aprobación** del servidor.',
      rpDMError:
        '❗ Ocurrió un error al iniciar tu whitelist. Habilita DMs de miembros del servidor y vuelve a intentarlo.',
      pveMsg:
        '⚔️ Ve al canal <#1401951160629461002> y envía tu **Steam ID** para el registro.',
      staffApprovedUser: '✅ Usuario aprobado y rol aplicado.',
      staffUserNotFound: 'Usuario no encontrado.',
      staffRoleNotFound: 'Rol RP no encontrado.',
    };
  }
  // pt-BR
  return {
    verifyTitle: 'Black • Verificação de Acesso',
    verifyDesc: [
      'Escolha abaixo para continuar:',
      '• **Black RP**: iniciar whitelist por DM, baseada na lore do servidor.',
      '• **Black PVE**: cadastrar sua Steam ID e liberar acesso ao PVE.',
    ].join('\n'),
    btnRP: '🕵️‍♂️ Black RP',
    btnPVE: '⚔️ Black PVE',
    rpStartNotice:
      '📬 Iniciamos sua whitelist por **DM**. Verifique suas mensagens diretas (habilite DMs de membros do servidor se estiver desativado).',
    askName: '📛 **Qual é o seu nome?**',
    askAge: '🎂 **Qual sua idade?**',
    askSteam: '🎮 **Qual sua Steam ID?** (apenas números)',
    askExp: '🎭 **Você tem experiência com RP?**',
    btnYes: 'Sim',
    btnNo: 'Não',
    askStory:
      '📖 **Envie a história do seu personagem (máx. 250 caracteres).**\n*Baseie-se na lore do servidor Black.*',
    storyTooLong:
      '⚠️ A história deve ter **no máximo 250 caracteres**. Tente novamente.',
    rpSentToStaff:
      '✅ **Sua whitelist foi enviada para a equipe.** Aguarde análise no canal **💬・esperando-aprovação** do servidor.',
    rpDMError:
      '❗ Ocorreu um erro ao iniciar sua whitelist. Habilite DMs de membros do servidor e tente novamente.',
    pveMsg:
      '⚔️ Vá até o canal <#1401951160629461002> e envie sua **Steam ID** para cadastro.',
    staffApprovedUser: '✅ Usuário aprovado e cargo aplicado.',
    staffUserNotFound: 'Usuário não encontrado.',
    staffRoleNotFound: 'Cargo RP não encontrado.',
  };
}

/* ================== INTERAÇÕES ================== */
client.on('interactionCreate', async (interaction) => {
  // 1) Seleção de idioma: aplica cargo PT/ES, libera canal PT/ES e envia verificação no idioma (efêmero)
  if (interaction.isButton() && (interaction.customId === 'lang_pt' || interaction.customId === 'lang_es'))) {
    const isPT = interaction.customId === 'lang_pt';
    const locale = isPT ? 'pt' : 'es';
    const t = strings(locale);

    // cargo de idioma
    try {
      const member = await interaction.guild.members.fetch(interaction.user.id);
      const roleId = isPT ? rolePT : roleES;
      if (roleId) await member.roles.add(roleId).catch(() => {});
      console.log(`[LANG] Cargo aplicado: ${isPT ? 'PT' : 'ES'} para ${interaction.user.id}`);
    } catch (e) { console.error('[LANG] Erro ao aplicar cargo:', e); }

    // liberar canal por idioma (visualização)
    try {
      const channelId = isPT ? canalPT : canalES;
      if (channelId) {
        const ch = await client.channels.fetch(channelId);
        await ch.permissionOverwrites.edit(interaction.user.id, {
          ViewChannel: true,
          ReadMessageHistory: true,
          SendMessages: false,
        }).catch(() => {});
      }
    } catch (e) { console.error('[LANG] Erro ao liberar canal:', e); }

    // verificação RP/PVE no idioma
    const embed = new EmbedBuilder()
      .setColor('#000000')
      .setTitle(t.verifyTitle)
      .setDescription(t.verifyDesc);

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId(`verificar_rp:${locale}`).setLabel(t.btnRP).setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId(`verificar_pve:${locale}`).setLabel(t.btnPVE).setStyle(ButtonStyle.Secondary),
    );

    await interaction.reply({ embeds: [embed], components: [row], flags: 64 });
    return;
  }

  // 2) Black RP (inicia WL por DM no idioma)
  if (interaction.isButton() && interaction.customId.startsWith('verificar_rp:')) {
    const locale = interaction.customId.split(':')[1] || 'pt';
    const t = strings(locale);
    const user = interaction.user;

    try {
      await interaction.reply({ content: t.rpStartNotice, flags: 64 });

      const dm = await user.createDM();
      const ask = async (text) => {
        await dm.send(text);
        const collected = await dm.awaitMessages({
          filter: (m) => m.author.id === user.id,
          max: 1,
          time: 5 * 60 * 1000,
        });
        if (!collected.size) throw new Error('Tempo esgotado ao responder.');
        return collected.first().content.trim();
      };

      const nome = await ask(strings(locale).askName);
      const idade = await ask(strings(locale).askAge);
      const steamId = await ask(strings(locale).askSteam);

      const expRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('exp_sim').setLabel(strings(locale).btnYes).setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId('exp_nao').setLabel(strings(locale).btnNo).setStyle(ButtonStyle.Danger),
      );
      const perguntaExp = await dm.send({ content: strings(locale).askExp, components: [expRow] });
      const expInteraction = await perguntaExp.awaitMessageComponent({
        filter: (i) => i.user.id === user.id,
        time: 5 * 60 * 1000,
      });
      const experiencia = expInteraction.customId === 'exp_sim' ? strings(locale).btnYes : strings(locale).btnNo;
      await expInteraction.update({
        content: `🎭 ${strings(locale).askExp.replace(/\*\*/g, '')} **${experiencia}**`,
        components: [],
      });

      let historia = '';
      while (true) {
        historia = await ask(strings(locale).askStory);
        if (historia.length <= 250) break;
        await dm.send(strings(locale).storyTooLong);
      }

      const embed = new EmbedBuilder()
        .setColor('#000000')
        .setTitle('📥 Whitelist - Black RP')
        .addFields(
          { name: 'Usuário / Usuario', value: `<@${user.id}>`, inline: false },
          { name: 'ID Discord', value: user.id, inline: true },
          { name: 'Nome / Nombre', value: nome || '—', inline: true },
          { name: 'Idade / Edad', value: idade || '—', inline: true },
          { name: 'Steam ID', value: steamId || '—', inline: false },
          { name: 'Experiência RP / Experiencia RP', value: experiencia, inline: true },
          { name: 'História / Historia', value: historia || '—', inline: false },
        )
        .setTimestamp();

      const staffRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId(`wl_aprovar_${user.id}`).setLabel('✅ Aprovar').setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId(`wl_reprovar_${user.id}`).setLabel('❌ Reprovar').setStyle(ButtonStyle.Danger),
      );

      const staffChannel = await client.channels.fetch(canalWhitelistRespostas);
      await staffChannel.send({ embeds: [embed], components: [staffRow] });

      try {
        const ch = await client.channels.fetch(CANAL_ESPERA_APROVACAO_ID);
        await ch.permissionOverwrites.edit(user.id, {
          ViewChannel: true,
          ReadMessageHistory: true,
          SendMessages: false,
        }).catch(() => {});
      } catch {}

      await dm.send(strings(locale).rpSentToStaff);
    } catch (err) {
      console.error('[WL] Erro no fluxo RP:', err);
      if (!interaction.replied) {
        await interaction.reply({ content: strings(locale).rpDMError, flags: 64 });
      } else {
        try { await interaction.user.send(strings(locale).rpDMError); } catch {}
      }
    }
    return;
  }

  // 3) Black PVE (resposta no idioma)
  if (interaction.isButton() && interaction.customId.startsWith('verificar_pve:')) {
    const locale = interaction.customId.split(':')[1] || 'pt';
    try {
      await interaction.reply({ content: strings(locale).pveMsg, flags: 64 });
    } catch (err) { console.error('[PVE] Erro:', err); }
    return;
  }

  // 4) STAFF: Aprovar WL
  if (interaction.isButton() && interaction.customId.startsWith('wl_aprovar_')) {
    try {
      const userId = interaction.customId.split('wl_aprovar_')[1];
      const member = await interaction.guild.members.fetch(userId).catch(() => null);
      if (!member) return interaction.reply({ content: 'Usuário não encontrado.', flags: 64 });

      const role = interaction.guild.roles.cache.get(cargoRP);
      if (!role) return interaction.reply({ content: 'Cargo RP não encontrado.', flags: 64 });

      await member.roles.add(role).catch(() => {});
      await interaction.reply({ content: '✅ Usuário aprovado e cargo aplicado.', flags: 64 });
      try { await member.send('✅ Sua whitelist/whitelist fue aprobada!'); } catch {}
    } catch (err) {
      console.error('[WL] Erro ao aprovar:', err);
      if (!interaction.replied) await interaction.reply({ content: 'Erro ao aprovar.', flags: 64 });
    }
    return;
  }

  // 5) STAFF: Reprovar WL (modal)
  if (interaction.isButton() && interaction.customId.startsWith('wl_reprovar_')) {
    const userId = interaction.customId.split('wl_reprovar_')[1];

    const modal = new ModalBuilder()
      .setCustomId(`modal_reprovar_${userId}`)
      .setTitle('Motivo / Motivo');

    const input = new TextInputBuilder()
      .setCustomId('motivo_reprovacao')
      .setLabel('Explique o motivo / Explica el motivo')
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true)
      .setMaxLength(500);

    const row = new ActionRowBuilder().addComponents(input);
    modal.addComponents(row);

    await interaction.showModal(modal);
    return;
  }

  // 6) STAFF: Submit do modal de reprovação
  if (interaction.isModalSubmit() && interaction.customId.startsWith('modal_reprovar_')) {
    try {
      const userId = interaction.customId.split('modal_reprovar_')[1];
      const reason = interaction.fields.getTextInputValue('motivo_reprovacao');

      const member = await interaction.guild.members.fetch(userId).catch(() => null);
      if (!member) return interaction.reply({ content: 'Usuário não encontrado.', flags: 64 });

      try {
        const ch = await client.channels.fetch(WL_REPROVADOS_CHANNEL_ID);
        await ch.send(
          `❌ **Whitelist Reprovada/Denegada**\n👤 <@${userId}> (${userId})\n📝 ${reason}`
        );
      } catch {}

      try { await member.send(`❌ Sua whitelist/whitelist foi reprovada/denegada.\n📝 ${reason}`); } catch {}
      await interaction.reply({ content: 'Reprovação registrada.', flags: 64 });
    } catch (err) {
      console.error('[WL] Erro ao registrar reprovação:', err);
      if (!interaction.replied) await interaction.reply({ content: 'Erro ao registrar.', flags: 64 });
    }
    return;
  }
});

// ====== LOGIN ======
(async () => {
  console.log('[LOGIN] Chamando client.login()…');
  try {
    await client.login(token);
    console.log('[LOGIN] client.login() resolvido (aguardando READY)…');
  } catch (e) {
    console.error('[LOGIN ERRO] Não foi possível logar:', e);
    process.exit(1);
  }
})();
