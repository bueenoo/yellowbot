
require('dotenv').config();
const {
  Client,
  GatewayIntentBits,
  Partials,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  ComponentType,
  PermissionsBitField,
} = require('discord.js');

const { canalWhitelistRespostas, cargoRP } = require('./config.json');

const token = process.env.TOKEN;

// Cria o client com intents e partials para DM
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Channel], // necessário para DM
});

client.once('ready', () => {
  console.log(`✅ Bot iniciado como ${client.user.tag}`);
});

/**
 * Helper para perguntar no DM e aguardar 1 mensagem do usuário.
 * timeMs padrão: 5 min.
 */
async function ask(dm, userId, text, timeMs = 5 * 60 * 1000) {
  await dm.send(text);
  const collected = await dm.awaitMessages({
    filter: (m) => m.author.id === userId,
    max: 1,
    time: timeMs,
  });
  if (!collected.size) throw new Error('Tempo esgotado');
  return collected.first().content?.trim() || '';
}

client.on('interactionCreate', async (interaction) => {
  try {
    // Botões gerais
    if (!interaction.isButton()) return;

    // Inicia fluxo RP (verificar_rp)
    if (interaction.customId === 'verificar_rp') {
      const user = interaction.user;

      // Resposta efêmera imediata
      await interaction.reply({
        content:
          '📬 Iniciamos sua whitelist no DM. Se o DM não chegar, verifique suas configurações de privacidade.',
        ephemeral: true,
      });

      // Abre DM
      const dm = await user.createDM();

      // Perguntas
      const nome = await ask(dm, user.id, 'Qual é o seu **nome**?');
      const idade = await ask(dm, user.id, 'Qual sua **idade**?');
      const steam = await ask(dm, user.id, 'Qual sua **Steam ID**?');

      // Pergunta de experiência com botões
      const expRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('exp_sim')
          .setLabel('Sim')
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId('exp_nao')
          .setLabel('Não')
          .setStyle(ButtonStyle.Danger)
      );

      await dm.send({
        content: 'Você tem **experiência com RP**?',
        components: [expRow],
      });

      const expInteraction = await dm.awaitMessageComponent({
        componentType: ComponentType.Button,
        filter: (i) => i.user.id === user.id,
        time: 5 * 60 * 1000,
      });

      const experiencia = expInteraction.customId === 'exp_sim' ? 'Sim' : 'Não';
      await expInteraction.update({
        content: `Experiência com RP: **${experiencia}**`,
        components: [],
      });

      // História até 200 chars
      let historia = '';
      while (true) {
        historia = await ask(
          dm,
          user.id,
          'Você pode escrever **até 200 caracteres**. Envie agora a **história do seu personagem**.'
        );
        if (historia.length <= 200) break;
        await dm.send(
          '⚠️ A história deve ter **no máximo 200 caracteres**. Tente novamente.'
        );
      }

      // Monta embed para staff
      const embed = new EmbedBuilder()
        .setColor('#000000')
        .setTitle('📥 Nova Whitelist (RP)')
        .addFields(
          { name: 'Usuário', value: `<@${user.id}>`, inline: false },
          { name: 'Nome', value: nome || '—', inline: true },
          { name: 'Idade', value: idade || '—', inline: true },
          { name: 'Steam ID', value: steam || '—', inline: false },
          { name: 'Experiência com RP', value: experiencia, inline: true },
          { name: 'História', value: historia || '—', inline: false }
        )
        .setTimestamp();

      // Linha de botões para staff
      const staffRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`wl_aprovar_${user.id}`)
          .setLabel('✅ Aprovar')
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId(`wl_reprovar_${user.id}`)
          .setLabel('❌ Reprovar')
          .setStyle(ButtonStyle.Danger)
      );

      // Envia ao canal da staff
      const staffChannel = await client.channels.fetch(canalWhitelistRespostas);
      await staffChannel.send({ embeds: [embed], components: [staffRow] });

      await dm.send(
        '✅ Suas respostas foram enviadas para análise da staff. Aguarde o resultado.'
      );
      return;
    }

    // Botão de Aprovar
    if (interaction.customId.startsWith('wl_aprovar_')) {
      const userId = interaction.customId.split('wl_aprovar_')[1];

      // Verificações de permissões
      if (
        !interaction.member.permissions.has(
          PermissionsBitField.Flags.ManageRoles
        )
      ) {
        await interaction.reply({
          content: '🚫 Você não tem permissão para aprovar.',
          ephemeral: true,
        });
        return;
      }

      const member = await interaction.guild.members
        .fetch(userId)
        .catch(() => null);

      if (member) {
        // Atribui cargo RP
        await member.roles.add(cargoRP).catch(console.error);
        await member
          .send('✅ Sua whitelist foi **aprovada**! Bem-vindo ao RP.')
          .catch(() => null);
      }

      await interaction.reply({
        content: 'Usuário aprovado.',
        ephemeral: true,
      });
      return;
    }

    // Botão de Reprovar
    if (interaction.customId.startsWith('wl_reprovar_')) {
      const userId = interaction.customId.split('wl_reprovar_')[1];

      // Verificações de permissões
      if (
        !interaction.member.permissions.has(
          PermissionsBitField.Flags.ManageRoles
        )
      ) {
        await interaction.reply({
          content: '🚫 Você não tem permissão para reprovar.',
          ephemeral: true,
        });
        return;
      }

      const member = await interaction.guild.members
        .fetch(userId)
        .catch(() => null);

      if (member) {
        await member
          .send('❌ Sua whitelist foi **reprovada**. Obrigado por participar!')
          .catch(() => null);
      }

      await interaction.reply({
        content: 'Usuário reprovado.',
        ephemeral: true,
      });
      return;
    }

    // Fluxo PVE (apenas linka instrução)
    if (interaction.customId === 'verificar_pve') {
      await interaction.reply({
        content:
          '⚔️ Vá até o canal <#1401951160629461002> e envie sua **Steam ID** para cadastro.',
        ephemeral: true,
      });
      return;
    }
  } catch (err) {
    console.error('Erro no interactionCreate:', err);
    // Tenta avisar o usuário se for uma interação de botão
    if (interaction?.isRepliable?.()) {
      try {
        await interaction.reply({
          content:
            '❌ Ocorreu um erro ao processar sua solicitação. Tente novamente.',
          ephemeral: true,
        });
      } catch {}
    }
  }
});

client.login(token);
