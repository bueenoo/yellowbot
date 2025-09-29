// index.js
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

// CONFIG IDs fixos
const CONFIG = {
  GUILD_ID: process.env.GUILD_ID,
  CH_WL_RP: '1401950755031748628',
  CH_WAIT_RP: '1402205533272014858',
  CH_STAFF_WL: '1401951752055427152',
  CH_REJECTED: '1402206198668853299',
  CH_PVE_STEAM: '1401951160629461002',
  CH_PVE_LOG: '1402195335048204298',
  ROLE_RP_NAME: 'Sobrevivente RP',
  ROLE_PVE_NAME: 'Sobrevivente PVE'
};

client.once(Events.ClientReady, () => {
  console.log(`✅ Bot online como ${client.user.tag}`);
});

function serverChoiceRow(lang='pt') {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('choose_rp').setLabel('Servidor RolePlay').setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId('choose_pve').setLabel('Servidor PvE').setStyle(ButtonStyle.Primary),
  );
}

client.on(Events.InteractionCreate, async (interaction) => {
  try {
    if (interaction.isButton()) {
      const id = interaction.customId;

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
    }
  } catch (err) {
    console.error(err);
  }
});

client.login(process.env.TOKEN);
