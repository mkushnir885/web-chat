import EventEmitter from "./modules/event-emitter.js";
import formatDateFromTimestamp from "./modules/format-date.js";

const eventEmitter = new EventEmitter();

const chatMessages = document.querySelector(".chat-messages");
const msgSending = document.querySelector(".msg-sending");
const chatRooms = document.querySelector(".chat-rooms");
const msgToChooseRoom = document.querySelector(".no-room-msg");
const btnSend = document.getElementById("send-msg");
const input = document.getElementById("write-msg");
const bntAccount = document.getElementById("go-to-acc");
const btnNewRoom = document.getElementById("btn-new-room");

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
  msgContainer.append(msgText, msgAuthor, msgTime);
  msgContainer.className = isOwnMessage ? "own-message" : "other-message";
  chatMessages.appendChild(msgContainer);
  chatMessages.scrollTop = chatMessages.scrollHeight;
};

const outputMyMessage = (message) => createMessageElement(message, true);

const outputSomeoneMessage = (message) => createMessageElement(message, false);

fetch("/chat/server")
  .then((res) => res.text())
  .then((url) => {
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
        chatCell.className = "room";
        chatRooms.appendChild(chatCell);
      });
    });

    eventEmitter.onEvent("CHAT_MESSAGE", (data) => {
      const { message } = data;
      chats[message.chatId].messages.push(message);
      if (message.chatId === currentChatId) {
        if (message.author === user.name) outputMyMessage(message);
        else outputSomeoneMessage(message);
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

    chatRooms.addEventListener("click", (event) => {
      if (event.target && event.target.classList.contains("room")) {
        console.log(event.target.id);
        if (!currentChatId) {
          msgToChooseRoom.style.setProperty("display", "none");
          msgSending.style.setProperty("visibility", "visible");
        }
        currentChatId = parseInt(event.target.id, 10);
        chatMessages.innerHTML = "";
        const { messages } = chats[event.target.id];
        messages.forEach((message) => {
          if (message.author === user.name) outputMyMessage(message);
          else outputSomeoneMessage(message);
        });
      }
    });

    btnSend.addEventListener("click", () => {
      const body = input.value;
      if (body) {
        ws.send(
          JSON.stringify({
            event: "NEW_MESSAGE",
            message: { body, chatId: currentChatId },
          }),
        );
        input.value = "";
      }
    });

    bntAccount.addEventListener("click", () => {
      ws.close();
      window.location.href = "/account";
    });

    btnNewRoom.addEventListener("click", () => {
      const newRoom = document.createElement("div");
      const newRoomName = prompt("Enter a room name");
      newRoom.textContent = newRoomName;
      newRoom.className = "room";
      chatRooms.appendChild(newRoom);
      fetch(`/chat/create?chatName=${newRoomName}`, {
        method: "POST",
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          newRoom.id = data.chatId;
          chats[newRoom.id] = {};
          chats[newRoom.id].messages = [];
          ws.send(JSON.stringify({ event: "NEW_CHAT", user }));
          console.log(data.message);
        })
        .catch((error) => {
          console.error(error);
        });
    });
  });
