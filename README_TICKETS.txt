# Sistema de Tickets PT/ES

## Configuração no config.json
```json
{
  "canalAbrirTicket": "ID_CANAL_ABRIR_TICKET",
  "canalLogTickets": "1401951493539758152",
  "categoriaTickets": "1401951450078117959",
  "staffRoles": ["ID_ROLE_STAFF_1", "ID_ROLE_STAFF_2"]
}
```

## Ajuste no index.js
```js
const { setupTickets, handleTicketInteraction, fecharTicket } = require('./utils/tickets');
const { canalAbrirTicket, canalLogTickets, categoriaTickets, staffRoles } = require('./config.json');

client.once('clientReady', async () => {
  await setupTickets(client, canalAbrirTicket);
  console.log("📌 Mensagem de abrir-ticket configurada.");
});

client.on('interactionCreate', async interaction => {
  if (await handleTicketInteraction(interaction, client, { canalLogTickets, categoriaTickets, staffRoles })) return;
  if (await fecharTicket(interaction, client, { canalLogTickets })) return;
});
```
