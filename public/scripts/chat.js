import formatDateFromTimestamp from '../utils/dateUtils.js';

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

// TODO: Replace with actual user
const generateUser = () => {
  const letters = 'abcdefghijklmnopqrstuvwxyz';
  const nameLength = 10;
  let name = '';
  for (let i = 0; i < nameLength; i += 1) {
    const index = Math.floor(Math.random() * letters.length);
    name += letters[index];
  }
  const maxUserId = 100;
  const id = Math.floor(Math.random() * maxUserId) + 1;
  return { name, id };
};

const ws = new WebSocket('ws://localhost:8090');

const user = generateUser();
ws.addEventListener('open', () => {
  ws.send(JSON.stringify({ event: 'USER_ONLINE', user }));
});

ws.addEventListener('message', (obj) => {
  const str = obj.data;
  const data = JSON.parse(str);

  const { event } = data;
  if (event === 'CHAT_MESSAGE') {
    const { message } = data;
    if (message.author === user.name) outputMyMessage(message);
    else outputSomeoneMessage(message);
  }
  // TODO: handle the chat history fetch event
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
