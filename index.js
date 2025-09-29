
// index.js — COMPLETO (idioma -> RP/PvE; WL RP; PvE botão único + desativação)
import 'dotenv/config';
import {
  Client, GatewayIntentBits, Partials,
  ActionRowBuilder, ButtonBuilder, ButtonStyle,
  ModalBuilder, TextInputBuilder, TextInputStyle,
  EmbedBuilder, Events
} from 'discord.js';
import { sendLanguageMessage } from './utils/lang.js';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages
  ],
  partials: [Partials.Channel]
});

// ==================== CONFIG ====================
const CONFIG = {
  GUILD_ID: process.env.GUILD_ID,
  // Canais
  CH_WL_RP:       '1401950755031748628',   // (opcional) canal WL RP
  CH_WAIT_RP:     '1402205533272014858',
  CH_STAFF_WL:    '1401951752055427152',
  CH_REJECTED:    '1402206198668853299',
  CH_PVE_STEAM:   '1401951160629461002',
  CH_PVE_LOG:     '1402195335048204298',
  // Cargos (nome exato)
  ROLE_RP_NAME:   'Sobrevivente RP',
  ROLE_PVE_NAME:  'Sobrevivente PVE'
};
// =================================================

client.once(Events.ClientReady, async () => {
  console.log(`✅ Bot online como ${client.user.tag}`);
});

function serverChoiceRow(lang='pt') {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('choose_rp').setLabel('Servidor RolePlay').setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId('choose_pve').setLabel('Servidor PvE').setStyle(ButtonStyle.Primary),
  );
}

function randomToken(len=6) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s=''; for (let i=0;i<len;i++) s += chars[Math.floor(Math.random()*chars.length)];
  return s;
}

client.on(Events.InteractionCreate, async (interaction) => {
  try {
    // ====== Botões ======
    if (interaction.isButton()) {
      const id = interaction.customId;

      // Idioma -> já envia com botões RP/PvE (um único reply)
      if (id === 'lang_pt') {
        return interaction.reply({
          content: '✅ Você selecionou **Português**.\nEscolha o servidor:',
          components: [serverChoiceRow('pt')],
          ephemeral: true
        });
      }
      if (id === 'lang_es') {
        return interaction.reply({
          content: '✅ Has seleccionado **Español**.\nElige tu servidor:',
          components: [serverChoiceRow('es')],
          ephemeral: true
        });
      }

      // RP -> modal WL
      if (id === 'choose_rp') {
        const modal = new ModalBuilder().setCustomId('modal_wl_rp').setTitle('Whitelist — Black RP');
        const iNome  = new TextInputBuilder().setCustomId('wl_nome').setLabel('Nome').setStyle(TextInputStyle.Short).setRequired(true);
        const iIdade = new TextInputBuilder().setCustomId('wl_idade').setLabel('Idade').setStyle(TextInputStyle.Short).setRequired(true);
        const iSteam = new TextInputBuilder().setCustomId('wl_steam').setLabel('Steam ID (17 dígitos)').setStyle(TextInputStyle.Short).setRequired(true);
        const iExp   = new TextInputBuilder().setCustomId('wl_exp').setLabel('Experiência com RP (Sim/Não)').setStyle(TextInputStyle.Short).setRequired(true);
        const iHist  = new TextInputBuilder().setCustomId('wl_hist').setLabel('História do personagem (até 250)').setMaxLength(250).setStyle(TextInputStyle.Paragraph).setRequired(true);
        modal.addComponents(
          new ActionRowBuilder().addComponents(iNome),
          new ActionRowBuilder().addComponents(iIdade),
          new ActionRowBuilder().addComponents(iSteam),
          new ActionRowBuilder().addComponents(iExp),
          new ActionRowBuilder().addComponents(iHist),
        );
        return interaction.showModal(modal);
      }

      // PvE -> cria botão de uso único no canal PVE
      if (id === 'choose_pve') {
        const pveChannel = await client.channels.fetch(CONFIG.CH_PVE_STEAM).catch(() => null);
        if (!pveChannel) {
          return interaction.reply({ content: '⚠️ Canal PvE não encontrado. Avise a administração.', ephemeral: true });
        }
        const token = randomToken();
        const uniqueId = `pve_btn_${interaction.user.id}_${token}`;
        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId(uniqueId).setLabel('⚔️ Black PvE — Registrar Steam ID').setStyle(ButtonStyle.Primary)
        );
        await pveChannel.send({
          content: `👤 ${interaction.user} clique no botão abaixo para **registrar sua Steam ID** (uso único).`,
          components: [row]
        });
        await interaction.reply({ content: `✅ Vá até <#${CONFIG.CH_PVE_STEAM}> e clique no botão que acabei de criar para você.`, ephemeral: true });
        return;
      }

      // Staff aprova/reprova WL
      if (id.startsWith('wl_approve_')) {
        await interaction.deferUpdate();
        const userId = id.split('wl_approve_')[1];
        const guild = await client.guilds.fetch(CONFIG.GUILD_ID);
        const member = await guild.members.fetch(userId).catch(() => null);
        const role = guild.roles.cache.find(r => r.name === CONFIG.ROLE_RP_NAME);
        if (member && role) await member.roles.add(role).catch(() => null);
        const waitCh = await client.channels.fetch(CONFIG.CH_WAIT_RP).catch(() => null);
        if (waitCh) waitCh.send(`✅ <@${userId}> aprovado na WL RP. Aguarde instruções.`).catch(() => null);
        return interaction.message.edit({ components: [] });
      }
      if (id.startsWith('wl_reject_')) {
        await interaction.deferUpdate();
        const userId = id.split('wl_reject_')[1];
        const rejectedCh = await client.channels.fetch(CONFIG.CH_REJECTED).catch(() => null);
        if (rejectedCh) rejectedCh.send(`❌ <@${userId}> foi **reprovado** na WL RP.`).catch(() => null);
        return interaction.message.edit({ components: [] });
      }

      // Botão único PvE
      if (id.startsWith('pve_btn_')) {
        const parts = id.split('_'); // pve, btn, userId, token
        const ownerId = parts[2];
        if (interaction.user.id !== ownerId) {
          return interaction.reply({ content: 'Este botão é de uso único e não pertence a você.', ephemeral: true });
        }
        // Abre modal e leva o ID da mensagem para desabilitar depois
        const modal = new ModalBuilder().setCustomId(`modal_pve_${ownerId}_${interaction.message.id}`).setTitle('Cadastro PvE — Steam ID');
        const input = new TextInputBuilder()
          .setCustomId('pve_steam')
          .setLabel('Informe sua Steam ID (17 dígitos)')
          .setStyle(TextInputStyle.Short)
          .setRequired(true);
        modal.addComponents(new ActionRowBuilder().addComponents(input));
        return interaction.showModal(modal);
      }
    }

    // ====== Submissões de Modal ======
    if (interaction.isModalSubmit()) {
      // WL RP
      if (interaction.customId === 'modal_wl_rp') {
        const nome  = interaction.fields.getTextInputValue('wl_nome');
        const idade = interaction.fields.getTextInputValue('wl_idade');
        const steam = interaction.fields.getTextInputValue('wl_steam');
        const exp   = interaction.fields.getTextInputValue('wl_exp');
        const hist  = interaction.fields.getTextInputValue('wl_hist');

        const staffCh = await client.channels.fetch(CONFIG.CH_STAFF_WL);
        const embed = new EmbedBuilder()
          .setTitle('📝 Nova Whitelist — RP')
          .setColor(0x5865F2)
          .addFields(
            { name: 'Player', value: `<@${interaction.user.id}> (${interaction.user.tag})`, inline: false },
            { name: 'Nome', value: nome, inline: true },
            { name: 'Idade', value: idade, inline: true },
            { name: 'Steam ID', value: steam, inline: false },
            { name: 'Experiência com RP', value: exp, inline: true },
            { name: 'História', value: hist || '—', inline: false },
          )
          .setTimestamp();

        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId(`wl_approve_${interaction.user.id}`).setLabel('Aprovar').setStyle(ButtonStyle.Success),
          new ButtonBuilder().setCustomId(`wl_reject_${interaction.user.id}`).setLabel('Reprovar').setStyle(ButtonStyle.Danger),
        );

        await staffCh.send({ embeds: [embed], components: [row] });

        await interaction.reply({
          content: `✅ WL enviada! Vá para <#${CONFIG.CH_WAIT_RP}> e aguarde a análise da staff.`,
          ephemeral: true
        });
        return;
      }

      // PvE — Steam ID
      if (interaction.customId.startsWith('modal_pve_')) {
        const parts = interaction.customId.split('modal_pve_')[1].split('_');
        const userId = parts[0];
        const messageId = parts[1];
        const steam = interaction.fields.getTextInputValue('pve_steam');

        // Tenta dar o cargo
        const guild = await client.guilds.fetch(CONFIG.GUILD_ID);
        const member = await guild.members.fetch(userId).catch(() => null);
        const role = guild.roles.cache.find(r => r.name === CONFIG.ROLE_PVE_NAME);
        if (member && role) {
          await member.roles.add(role).catch(() => null);
        }

        // Log
        const logCh = await client.channels.fetch(CONFIG.CH_PVE_LOG).catch(() => null);
        if (logCh) {
          const when = new Date().toLocaleString();
          await logCh.send(`🟢 **PvE Registro** — <@${userId}> | Steam ID: \`${steam}\` | ${when}`);
        }

        // Desabilita o botão de uso único
        try {
          const ch = await client.channels.fetch(CONFIG.CH_PVE_STEAM);
          const msg = await ch.messages.fetch(messageId);
          if (msg) {
            const disabledRow = new ActionRowBuilder().addComponents(
              ButtonBuilder.from(msg.components[0].components[0]).setDisabled(true)
            );
            await msg.edit({ components: [disabledRow] });
          }
        } catch {}

        await interaction.reply({
          content: `✅ Registro PvE concluído! Seu cargo **${CONFIG.ROLE_PVE_NAME}** foi aplicado (se o bot tiver permissão).`,
          ephemeral: true
        });
        return;
      }
    }
  } catch (err) {
    console.error('[INTERACTION ERROR]', err);
    if (interaction.isRepliable()) {
      try { await interaction.reply({ content: '⚠️ Ocorreu um erro. Tente novamente.', ephemeral: true }); } catch {}
    }
  }
});

client.login(process.env.TOKEN);
