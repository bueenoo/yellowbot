require('dotenv').config();

const {
  Client, GatewayIntentBits, Partials,
  EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle,
  MessageFlags
} = require('discord.js');

const {
  canalVerificacao, rolePT, roleES,
  canalPT, canalES, canalWhitelist, canalCadastroPVE,
  canalEspera, canalWhitelistRespostas, canalWlReprovadoPT, canalWlReprovadoES,
  cargoRP
} = require('./config.json');

// Utils
const { enviarMensagemDeVerificacao } = require('./utils/verificacao');
const { ensureSendable } = require('./utils/check-perms');
const { buildPT } = require('./utils/verificacao-pt');
const { buildES } = require('./utils/verificacao-es');
const { startWL, handleStaffActions, handleModal } = require('./utils/wl');

const token = process.env.token;
if (!token) {
  console.error('[ERRO] Defina a variável "token" em Railway → Variables');
  process.exit(1);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Channel],
});

process.on('unhandledRejection', (reason) => console.error('[unhandledRejection]', reason));
process.on('uncaughtException', (err) => console.error('[uncaughtException]', err));
client.on('error', (e) => console.error('[client.error]', e));
client.on('warn', (w) => console.warn('[client.warn]', w));

client.once('clientReady', async () => {
  console.log(`✅ Bot iniciado como ${client.user.tag} (id: ${client.user.id})`);

  try {
    await client.user.setPresence({ activities: [{ name: 'Black • verificação' }], status: 'online' });
    console.log('🟢 Presença definida.');
  } catch (e) {
    console.warn('⚠️ Não foi possível definir presença:', e?.message);
  }

  // Pré-checagem de permissões no canal de verificação
  try {
    const ch = await client.channels.fetch(canalVerificacao);
    const check = await ensureSendable(ch);
    if (!check.ok) {
      console.error('❌ Permissões insuficientes no canal de verificação:', { canalId: ch?.id, missing: check.missing });
    } else {
      await enviarMensagemDeVerificacao(ch);
      console.log('📌 Mensagem de idioma enviada/fixada.');
    }
  } catch (e) {
    console.error('Falha ao enviar mensagem de idioma:', e);
  }
});

// ====== Interactions ======
client.on('interactionCreate', async (interaction) => {
  try {
    // Botões — seleção de idioma
    if (interaction.isButton()) {
      if (interaction.customId === 'lang_pt') {
        try {
          const role = interaction.guild.roles.cache.get(rolePT);
          if (role) await interaction.member.roles.add(role).catch(()=>{});
          const { embed, row } = buildPT();
          await interaction.update({ embeds: [embed], components: [row] });
        } catch (e) {
          console.error('Erro lang_pt:', e);
          if (!interaction.replied) await interaction.reply({ content: '❗ Não foi possível definir o idioma.', flags: MessageFlags.Ephemeral });
        }
        return;
      }

      if (interaction.customId === 'lang_es') {
        try {
          const role = interaction.guild.roles.cache.get(roleES);
          if (role) await interaction.member.roles.add(role).catch(()=>{});
          const { embed, row } = buildES();
          await interaction.update({ embeds: [embed], components: [row] });
        } catch (e) {
          console.error('Erro lang_es:', e);
          if (!interaction.replied) await interaction.reply({ content: '❗ No fue posible definir el idioma.', flags: MessageFlags.Ephemeral });
        }
        return;
      }

      // Fluxo PT
      if (interaction.customId === 'ver_pt_rp') {
        return startWL(interaction, 'pt', { canalEspera, canalWhitelistRespostas });
      }
      if (interaction.customId === 'ver_pt_pve') {
        return interaction.reply({
          content: `⚔️ Envie sua **Steam ID** em <#${canalCadastroPVE}>. Após validado, seu acesso será liberado.`,
          flags: MessageFlags.Ephemeral
        });
      }

      // Flujo ES
      if (interaction.customId === 'ver_es_rp') {
        return startWL(interaction, 'es', { canalEspera, canalWhitelistRespostas });
      }
      if (interaction.customId === 'ver_es_pve') {
        return interaction.reply({
          content: `⚔️ Envía tu **Steam ID** en <#${canalCadastroPVE}>. Tras validación, tu acceso será liberado.`,
          flags: MessageFlags.Ephemeral
        });
      }

      // Ações da staff (aprovar/reprovar) — wl.js centraliza
      const acted = await handleStaffActions(interaction, { canalWhitelistRespostas, canalWlReprovadoPT, canalWlReprovadoES }, cargoRP);
      if (acted) return;
    }

    // Modal (motivo reprovação)
    if (interaction.isModalSubmit()) {
      const done = await handleModal(interaction, { canalWlReprovadoPT, canalWlReprovadoES });
      if (done) return;
    }
  } catch (err) {
    console.error('[interactionCreate] erro:', err);
    if (interaction.isRepliable() && !interaction.replied) {
      await interaction.reply({ content: '❗ Ocorreu um erro ao processar sua ação.', flags: MessageFlags.Ephemeral }).catch(()=>{});
    }
  }
});

// ====== Login ======
(async () => {
  console.log('[LOGIN] Tentando logar...');
  try {
    await client.login(token);
    console.log('[LOGIN] Sucesso. Aguardando clientReady...');
  } catch (e) {
    console.error('[LOGIN ERRO]', e);
    process.exit(1);
  }
})();
