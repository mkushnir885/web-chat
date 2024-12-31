import EventEmitter from "./modules/event-emitter.js";
import formatDateFromTimestamp from "./modules/format-date.js";

const eventEmitter = new EventEmitter();

const elements = {
  chatMessages: document.querySelector(".chat-messages"),
  msgSending: document.querySelector(".msg-sending"),
  chatsHistory: document.querySelector(".chats-history"),
  chatRooms: document.querySelector(".chat-rooms"),
  msgToChooseRoom: document.querySelector(".no-room-msg"),
  btnSend: document.getElementById("send-msg"),
  msgInput: document.getElementById("write-msg"),
  bntAccount: document.getElementById("go-to-acc"),
  btnNewRoom: document.getElementById("btn-new-room"),
  searchPanel: document.querySelector(".search-room"),
  searchInput: document.getElementById("search-input"),
  searchButton: document.getElementById("search-btn"),
  modal: document.getElementById('get-group-name'),
  createGroupBtn: document.getElementById('createGroupBtn'),
};

const createMessageElement = ({ author, timestamp, body }, isOwnMessage) => {
  const msgContainer = document.createElement("div");
  const msgText = document.createElement("p");
  msgText.className = "msg-text";
  msgText.textContent = body;
  const msgAuthor = document.createElement("p");
  msgAuthor.className = "msg-author";
  msgAuthor.textContent = author;
  const msgTime = document.createElement("p");
  msgTime.className = "msg-time";
  msgTime.textContent = formatDateFromTimestamp(timestamp);
  msgContainer.append(msgAuthor, msgText, msgTime);
  msgContainer.className = isOwnMessage ? "own-message" : "other-message";
  elements.chatMessages.appendChild(msgContainer);
  elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
};

const outputMessage = (message, isOwnMessage) => createMessageElement(message, isOwnMessage);

(async () => {
  try {
    const res = await fetch("/chat/server");
    const url = await res.text();
    const [server, query] = url.split("?");
    const user = Object.fromEntries(new URLSearchParams(query));
    const ws = new WebSocket(server);
    let chats;
    let currentChatId;

    ws.addEventListener("open", () => {
      ws.send(JSON.stringify({ event: "USER_ONLINE", user }));
    });

    eventEmitter.onEvent("CHATS_HISTORY", (data) => {
      const { rooms } = data;
      chats = rooms;
      Object.keys(chats).forEach((id) => {
        const chat = chats[id];
        const chatCell = document.createElement("div");
        chatCell.id = id;
        chatCell.textContent = chat.chatName;
        chatCell.classList.add("room", "in-room");
        elements.chatRooms.appendChild(chatCell);
        chatCell.addEventListener("click", () => showMessagesFromRoom(chatCell));
      });
    });

    eventEmitter.onEvent("CHAT_HISTORY", (data) => {
      const { history } = data;
      const { chatId, messages } = history;
      chats[chatId].messages = messages;
      messages.forEach((message) => outputMessage(message, message.author === user.name));
    });

    eventEmitter.onEvent("CHAT_MESSAGE", (data) => {
      const { message } = data;
      chats[message.chatId].messages.push(message);
      if (message.chatId === currentChatId) {
        outputMessage(message, message.author === user.name);
      }
    });

    ws.addEventListener("message", (obj) => {
      const str = obj.data;
      const data = JSON.parse(str);

      const { event } = data;
      eventEmitter.emitEvent(event, data);
    });

    ws.addEventListener("close", (obj) => {
      alert(obj.reason);
    });

    elements.btnSend.addEventListener("click", () => {
      const body = elements.msgInput.value;
      if (body) {
        ws.send(
          JSON.stringify({
            event: "NEW_MESSAGE",
            message: { body, chatId: currentChatId },
          })
        );
        elements.msgInput.value = "";
      }
    });

    elements.bntAccount.addEventListener("click", () => {
      ws.close();
      window.location.href = "/account";
    });

    const showMessagesFromRoom = (room) => {
      if (!currentChatId) {
        elements.msgToChooseRoom.style.setProperty("display", "none");
        elements.msgSending.style.setProperty("visibility", "visible");
      }
      currentChatId = parseInt(room.id, 10);
      elements.chatMessages.innerHTML = "";
      const { messages } = chats[room.id];
      messages.forEach((message) => outputMessage(message, message.author === user.name));
    };

    elements.btnNewRoom.addEventListener("click", async () => {
      try {
        const newRoomName = await getGroupName();
        const newRoom = document.createElement("div");
        newRoom.textContent = newRoomName;
        newRoom.classList.add('room', 'in-room');
        elements.chatRooms.appendChild(newRoom);
        newRoom.addEventListener("click", () => showMessagesFromRoom(newRoom));
        const response = await fetch(`/chat/create?chatName=${newRoomName}`, {
          method: "POST",
        });
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        newRoom.id = data.chatId;
        chats[newRoom.id] = {};
        chats[newRoom.id].messages = [];
        ws.send(JSON.stringify({ event: "NEW_CHAT", chat: { chatId: data.chatId } }));
        console.log(data.message);
      } catch (error) {
        console.error(error);
      }
    });

    elements.searchButton.addEventListener("click", async () => {
      const roomName = elements.searchInput.value;
      await startRoomSearch(roomName);
    });

    const startRoomSearch = async (roomName) => {
      try {
        const response = await fetch(`/chat/search?chatName=${roomName}`, {
          method: "GET",
        });
        if (!response.ok) {
          alert('There is no room with this name');
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        handleFindPressed();
        const availableRooms = document.querySelectorAll('.in-room');
        availableRooms.forEach(room => {
          room.style.setProperty('display', 'none');
        });
        const reminder = document.createElement('p');
        if (data.chatId in chats) {
          const room = document.getElementById(data.chatId);
          room.style.setProperty('display', 'flex');
          reminder.textContent = "You're already in";
          room.appendChild(reminder);
        } else {
          let room = document.createElement("div");
          room.textContent = roomName;
          room.classList.add('room', 'not-in-room');
          reminder.textContent = "You can join";
          room.appendChild(reminder);
          elements.chatRooms.appendChild(room);
          room.addEventListener("click", () => {
            room.remove();
            handleRoomJoining(roomName, data.chatId);
          });
        }
        console.log(data.message);
      } catch (error) {
        console.error(error);
      }
    };

    const handleRoomJoining = (roomName, roomId) => {
      const room = document.createElement("div");
      room.textContent = roomName;
      room.classList.add('room', 'in-room');
      elements.chatRooms.appendChild(room);
      const availableRooms = document.querySelectorAll('.in-room');
      availableRooms.forEach(room => {
        room.style.setProperty('display', 'flex');
      });
      if (!currentChatId) {
        elements.msgToChooseRoom.style.setProperty("display", "none");
        elements.msgSending.style.setProperty("visibility", "visible");
      }
      fetchChatJoining(room, roomId);
      room.addEventListener("click", () => showMessagesFromRoom(room));
      elements.chatMessages.innerHTML = "";
    };

    const fetchChatJoining = async (roomEl, roomId) => {
      try {
        const response = await fetch(`/chat/join?chatId=${roomId}`, {
          method: "POST",
        });
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const res = await response.json();
        roomEl.id = roomId;
        chats[roomEl.id] = { messages: [] };
        currentChatId = parseInt(roomId, 10);
        ws.send(JSON.stringify({ event: "CHAT_JOINING", chat: { chatId: roomId } }));
        console.log(res.message);
      } catch (error) {
        console.error(error);
      }
    };
  } catch (error) {
    console.error(error);
  }
})();

const handleFindPressed = () => {
  elements.searchPanel.style.setProperty("display", "none");
  const backBtn = document.createElement("button");
  backBtn.className = "back-btn";
  backBtn.textContent = "< Back";
  elements.chatsHistory.prepend(backBtn);
  backBtn.addEventListener("click", () => {
    elements.searchPanel.style.setProperty("display", "flex");
    backBtn.remove();
    const notInRoom = document.querySelector('.not-in-room');
    if (notInRoom) notInRoom.remove();
    const reminder = document.querySelector('.in-room p');
    if (reminder) reminder.remove();
    const inRooms = document.querySelectorAll('.in-room');
    inRooms.forEach(room => {
      room.style.setProperty('display', 'flex');
    });
  });
};

const getGroupName = () => {
  return new Promise((resolve, reject) => {
    elements.modal.style.display = 'flex';
    window.onclick = (event) => {
      if (event.target == elements.modal) {
        elements.modal.style.display = 'none';
        reject('Window is closed');
      }
    };
    elements.createGroupBtn.addEventListener("click", () => {
      const groupName = document.getElementById('groupName').value;
      if (groupName) {
        elements.modal.style.display = 'none';
        resolve(groupName);
      }
    });
  });
};
