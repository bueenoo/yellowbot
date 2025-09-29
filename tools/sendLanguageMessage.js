import 'dotenv/config';
import { Client, GatewayIntentBits } from 'discord.js';
import { sendLanguageMessage } from '../utils/lang.js';

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once('ready', async () => {
  const chId = process.env.VERIFY_CHANNEL_ID;
  if (!chId) {
    console.error('Defina VERIFY_CHANNEL_ID no .env');
    process.exit(1);
  }
  const ch = await client.channels.fetch(chId).catch(() => null);
  if (!ch) {
    console.error('Canal não encontrado. Verifique o ID.');
    process.exit(1);
  }
  await sendLanguageMessage(ch);
  console.log('✅ Mensagem de idioma enviada.');
  process.exit(0);
});

client.login(process.env.TOKEN);
