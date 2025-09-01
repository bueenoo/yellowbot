
require('dotenv').config();
const {
  Client, GatewayIntentBits, Partials,
  EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle,
  ModalBuilder, TextInputBuilder, TextInputStyle, PermissionsBitField, ChannelType
} = require('discord.js');
const cfg = require('./config.json');
const { enviarMensagemDeVerificacao } = require('./utils/verificacao');
const { iniciarFluxoWL } = require('./utils/wl-dm');
const { handlePVEMessage } = require('./utils/pve-handler');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages
  ],
  partials: [Partials.Channel, Partials.Message, Partials.User]
});

const TOKEN = process.env.token;

// ====== READY ======
client.once('clientReady', async (c) => {
  console.log(`✅ Bot iniciado como ${c.user.tag} (id: ${c.user.id})`);
  try {
    await enviarMensagemDeVerificacao(c);
    console.log('📌 Mensagem de verificação enviada/fixada.');
  } catch (e) {
    console.error('Falha ao enviar mensagem de idioma:', e);
  }
});

// ====== INTERAÇÕES ======
client.on('interactionCreate', async (interaction) => {
  try {
    if (interaction.isButton()) {
      // Seleção de idioma
      if (interaction.customId === 'lang_pt' || interaction.customId === 'lang_es') {
        const isPT = interaction.customId === 'lang_pt';
        const roleToAdd = isPT ? cfg.rolePT : cfg.roleES;
        const roleToRemove = isPT ? cfg.roleES : cfg.rolePT;
        const member = await interaction.guild.members.fetch(interaction.user.id).catch(() => null);
        if (member) {
          if (roleToRemove && member.roles.cache.has(roleToRemove)) {
            await member.roles.remove(roleToRemove).catch(()=>{});
          }
          if (roleToAdd && !member.roles.cache.has(roleToAdd)) {
            await member.roles.add(roleToAdd).catch(()=>{});
          }
        }

        // Opções RP/PVE (efêmero)
        const embed = new EmbedBuilder()
          .setColor(isPT ? 0x2f3136 : 0x2f3136)
          .setTitle(isPT ? 'Black • Verificação de Acesso (PT)' : 'Black • Verificación de Acceso (ES)')
          .setDescription(isPT
            ? 'Escolha abaixo para continuar:\n• **Black RP**: iniciar whitelist baseada na lore.\n• **Black PVE**: cadastrar sua Steam ID e liberar acesso ao PVE.'
            : 'Elige abajo para continuar:\n• **Black RP**: iniciar whitelist basada en la lore.\n• **Black PVE**: registrar tu Steam ID y liberar acceso al PVE.'
          );

        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId(isPT ? 'rp_pt' : 'rp_es').setLabel(isPT ? '🕵️ Black RP' : '🕵️ Black RP').setStyle(ButtonStyle.Primary),
          new ButtonBuilder().setCustomId(isPT ? 'pve_pt' : 'pve_es').setLabel(isPT ? '⚔️ Black PVE' : '⚔️ Black PVE').setStyle(ButtonStyle.Secondary),
        );

        // ephemeral via flags
        await interaction.reply({ embeds: [embed], components: [row], flags: 64 });
        return;
      }

      // RP: iniciar WL por DM
      if (interaction.customId === 'rp_pt' || interaction.customId === 'rp_es') {
        const lang = interaction.customId.endsWith('_pt') ? 'PT' : 'ES';
        await interaction.reply({
          content: lang === 'PT'
            ? '📬 Iniciaremos sua whitelist no privado (DM). Verifique sua DM e responda às perguntas.'
            : '📬 Iniciaremos tu whitelist por privado (DM). Revisa tu DM y responde a las preguntas.',
          flags: 64
        });
        await iniciarFluxoWL(client, interaction.user, interaction.guild, lang);
        return;
      }

      // PVE: instrução simples + canal
      if (interaction.customId === 'pve_pt' || interaction.customId === 'pve_es') {
        const lang = interaction.customId.endsWith('_pt') ? 'PT' : 'ES';
        const channelMention = `<#${cfg.pveRegisterChannelId}>`;
        const msg = lang === 'PT'
          ? `⚔️ Para PVE, envie sua **Steam ID** em ${channelMention}. Após validado pela staff, seu acesso será liberado.`
          : `⚔️ Para PVE, envía tu **Steam ID** en ${channelMention}. Tras validación del staff, se te liberará el acceso.`;
        await interaction.reply({ content: msg, flags: 64 });
        return;
      }

      // Aprovar WL (staff)
      if (interaction.customId.startsWith('wl_approve:')) {
        const [ , userId, lang ] = interaction.customId.split(':');
        const member = await interaction.guild.members.fetch(userId).catch(()=>null);
        if (member) {
          await member.roles.add(cfg.roleRP).catch(()=>{});
          await member.send(lang === 'PT'
            ? '✅ Sua whitelist foi **aprovada**! Bem-vindo ao RP.'
            : '✅ Tu whitelist fue **aprobada**! Bienvenido al RP.'
          ).catch(()=>{});
        }
        await interaction.reply({ content: '✅ Aprovado.', flags: 64 });
        return;
      }

      // Reprovar WL -> abre modal
      if (interaction.customId.startsWith('wl_reject:')) {
        const [ , userId, lang ] = interaction.customId.split(':');
        const modal = new ModalBuilder()
          .setCustomId(`modal_reject:${userId}:${lang}`)
          .setTitle(lang === 'PT' ? 'Motivo da reprovação' : 'Motivo de la desaprobación');

        const reason = new TextInputBuilder()
          .setCustomId('reason')
          .setLabel(lang === 'PT' ? 'Explique o motivo' : 'Explica el motivo')
          .setStyle(TextInputStyle.Paragraph)
          .setMaxLength(1000)
          .setRequired(true);

        modal.addComponents(new ActionRowBuilder().addComponents(reason));
        await interaction.showModal(modal);
        return;
      }
    }

    // Modal submit: reprovação WL
    if (interaction.isModalSubmit() && interaction.customId.startsWith('modal_reject:')) {
      const [ , userId, lang ] = interaction.customId.split(':');
      const reason = interaction.fields.getTextInputValue('reason');

      const member = await interaction.guild.members.fetch(userId).catch(()=>null);
      if (member) {
        await member.send(lang === 'PT'
          ? `❌ Sua whitelist foi **reprovada**.\n**Motivo:** ${reason}`
          : `❌ Tu whitelist fue **rechazada**.\n**Motivo:** ${reason}`
        ).catch(()=>{});
      }

      const channelId = lang === 'PT' ? cfg.wlRejectedPTChannelId : cfg.wlRejectedESChannelId;
      const logCh = await client.channels.fetch(channelId).catch(()=>null);
      if (logCh) {
        await logCh.send({
          embeds: [
            new EmbedBuilder()
              .setColor(0xff0000)
              .setTitle(lang === 'PT' ? 'WL Reprovada' : 'WL Rechazada')
              .setDescription(lang === 'PT'
                ? `Usuário: <@${userId}>\nDiscord ID: \`${userId}\`\nMotivo: ${reason}`
                : `Usuario: <@${userId}>\nDiscord ID: \`${userId}\`\nMotivo: ${reason}`
              )
          ]
        }).catch(()=>{});
      }

      await interaction.reply({ content: '❌ Reprovado com motivo registrado.', flags: 64 });
      return;
    }

  } catch (err) {
    console.error('Erro em interactionCreate:', err);
  }
});

// Validar SteamID simples quando usuário postar no canal de cadastro PVE
client.on('messageCreate', async (msg) => {
  try {
    if (msg.author.bot) return;
    if (msg.channelId !== cfg.pveRegisterChannelId) return;

    // Aceita 17 dígitos ou URL da Steam contendo /profiles/XXXXXXXXXXXXXXX
    const content = msg.content.trim();
    const idMatch = content.match(/\b\d{17}\b/);
    const urlMatch = content.match(/https?:\/\/steamcommunity\.com\/profiles\/(\d{17})/i);
    const steamId = idMatch ? idMatch[0] : (urlMatch ? urlMatch[1] : null);

    if (!steamId) {
      await msg.reply('❗ Formato inválido. Envie **apenas** sua Steam ID (17 dígitos) ou a URL do seu perfil /profiles/XXXXXXXXXXXXXXX.').catch(()=>{});
      return;
    }

    const member = await msg.guild.members.fetch(msg.author.id).catch(()=>null);
    if (member) {
      await member.roles.add(cfg.rolePVE).catch(()=>{});
    }

    const log = await client.channels.fetch(cfg.staffPVELogChannelId).catch(()=>null);
    if (log) {
      await log.send({
        embeds: [
          new EmbedBuilder()
            .setColor(0x57F287)
            .setTitle('Novo cadastro PVE')
            .addFields(
              { name: 'Usuário', value: `<@${msg.author.id}> (${msg.author.id})`, inline: false },
              { name: 'Steam ID', value: steamId, inline: true },
              { name: 'Mensagem', value: content.slice(0, 1000), inline: false }
            )
        ]
      }).catch(()=>{});
    }

    await msg.reply('✅ Steam ID registrada. A staff validará e seu acesso ao PVE já foi liberado.').catch(()=>{});
  } catch (e) {
    console.error('Erro em messageCreate:', e);
  }
});

client.login(TOKEN).then(()=>{
  console.log('[LOGIN] Tentando logar...');
}).catch((e)=>{
  console.error('Falha no login:', e);
});
