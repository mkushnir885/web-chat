import EventEmitter from '../utils/event-emitter.js';
import formatDateFromTimestamp from '../utils/dateUtils.js';

const eventEmitter = new EventEmitter();

const createMessageElement = ({ author, timestamp, body }, isOwnMessage) => {
  const msgContainer = document.createElement('div');
  msgContainer.classList.add('chat-message');

  if (!isOwnMessage) {
    msgContainer.style.textAlign = 'end';
    const msgHeader = document.createElement('p');
    const headerAuthor = `<span class="msg-author">${author}</span>`;
    const msgTime = formatDateFromTimestamp(timestamp);
    const headerTime = `<span class="msg-time">${msgTime}</span>`;
    msgHeader.innerHTML = `${headerAuthor}<br/>${headerTime}`;
    msgContainer.appendChild(msgHeader);
  }

  const msgBody = document.createElement('p');
  msgBody.textContent = body;
  msgContainer.appendChild(msgBody);

  document.querySelector('.chat-messages').appendChild(msgContainer);
};

const outputMyMessage = (message) => createMessageElement(message, true);

const outputSomeoneMessage = (message) => createMessageElement(message, false);

fetch('/chat/server')
  .then((res) => res.text())
  .then((url) => {
    const [server, query] = url.split('?');
    const user = Object.fromEntries(new URLSearchParams(query));
    const ws = new WebSocket(server);

    ws.addEventListener('open', () => {
      ws.send(JSON.stringify({ event: 'USER_ONLINE', user }));
    });

    eventEmitter.onEvent('CHAT_HISTORY', (data) => {
      const { messages } = data;

      console.log(messages);

      messages.forEach((message) => {
        if (message.author === user.name) outputMyMessage(message);
        else outputSomeoneMessage(message);
      });
    });

    eventEmitter.onEvent('CHAT_MESSAGE', (data) => {
      const { message } = data;
      if (message.author === user.name) outputMyMessage(message);
      else outputSomeoneMessage(message);
    });

    ws.addEventListener('message', (obj) => {
      const str = obj.data;
      const data = JSON.parse(str);

      const { event } = data;
      eventEmitter.emitEvent(event, data);
    });

    const btnSend = document.getElementById('send-msg');
    btnSend.addEventListener('click', () => {
      const input = document.getElementById('write-msg');
      const body = input.value;

      if (body) {
        ws.send(JSON.stringify({ event: 'CHAT_MESSAGE', body }));
        input.value = '';
      }
    });

    const bntAccount = document.getElementById('go-to-acc');
    bntAccount.addEventListener('click', () => {
      ws.close();
      window.location.href = '/account';
    });
  });
