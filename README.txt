# Black • Tickets (PT/ES)

Este pacote contém:
- `utils/tickets.js` → envia e fixa a mensagem de abertura de tickets (PT/ES) no canal configurado.
- `commands/tickets-setup.js` → comando `/tickets-setup` para republicar a mensagem quando você quiser.

## 1) `config.json`
Adicione (ou confira) estes campos:

```json
{
  "canalAbrirTicket": "1401951493539758152",
  "categoriaTickets": "1401951450078117959",
  "canalLogTickets": "1402195335048204298",
  "staffRoles": ["<ID_DO_CARGO_STAFF>"]
}
```

> Dê ao bot permissões no canal: **Ver Canal, Enviar Mensagens, Inserir Links, Ler Histórico e Gerenciar Mensagens**.

## 2) `index.js`
- Importe e chame no `ready`:

```js
const { canalAbrirTicket } = require('./config.json');
const { enviarMensagemDeTickets } = require('./utils/tickets');

client.once('clientReady', async () => {
  try {
    const abrir = await client.channels.fetch(canalAbrirTicket);
    await enviarMensagemDeTickets(abrir);
    console.log('📌 Mensagem de tickets enviada/fixada.');
  } catch (e) {
    console.error('Falha ao enviar mensagem de tickets:', e);
  }
});
```

- Capture os botões ao criar tickets (IDs usados):

```
ticket_doacoes
ticket_denuncia
ticket_suporte
```

Se você já tem um `tickets.js` que abre canais, apenas garanta que trate esses `customId`s.

## 3) Registrar o comando
Execute seu script de deploy de slash commands ou o processo que você já usa para registrar comandos. O comando é `/tickets-setup`.

## 4) Usar
- Rode `/tickets-setup` para repostar/firmar a mensagem quando desejar.
- A mensagem não duplica porque o utilitário apaga mensagens anteriores do **bot** no canal.