// Модуль C6. API браузера. C6.6. Event Source, WebSocket

// Задание 3
// Реализовать чат на основе эхо-сервера wss://echo-ws-service.herokuapp.com.
// Добавить в чат механизм отправки геолокации

// url эхо-сервера
const wsUri = "wss://echo-ws-service.herokuapp.com";
// url сервера геолокации
const geoUri = "https://www.openstreetmap.org/#map=18";

const sendText = document.getElementById("send-text");
const btnSendMsg = document.querySelector('.j-btn-send-msg');
const btnSendGeo = document.querySelector('.j-btn-send-geo');
const msgBlockNode = document.getElementById("msg_block")

let websocket;

let isGeo = false;

function writeToScreen(message, fromServer) {
  let div = document.createElement("div");
  let a = document.createAttribute("class");
  a.value = fromServer ? "msg msg-server" : "msg msg-client";
  div.setAttributeNode(a);
  div.innerHTML = message;

  msgBlockNode.appendChild(div);
  msgBlockNode.lastChild.scrollIntoView();
}

window.addEventListener('load', () => {
  service_message(wsUri);
  websocket = new WebSocket(wsUri);
  websocket.onopen = function(evt) {
    service_message("CONNECTED");
  };
  websocket.onclose = function(evt) {
    service_message("DISCONNECTED");
    alert("Соединение с сервером прервано. Обновите страницу.");
  };
  websocket.onmessage = function(evt) {
    if (!isGeo){
      // false, если НЕ сообщение для гео-сервера - выводим на экран
      writeToScreen('Сообщение от сервера: ' + evt.data, true);
    }else{
      isGeo = false; // если сообщение для гео-сервера - не выводим на экран и меняем флаг
    }
  };
  websocket.onerror = function(evt) {
    service_message("ERROR: " + evt.data);
  };
});


btnSendMsg.addEventListener('click', () => {
  const message = sendText.value;
  if(message.trim() == ""){
    alert("Введите сообщение для отправки");
    sendText.focus();
    return;
  } 
  writeToScreen("Сообщение отправителя: " + message, false);
  websocket.send(message);
  sendText.value = "";
  sendText.focus();
});

function service_message(message){
  // можно выводить служебные сообщения на экран, в лог и т.п.
  console.log(message);
}

// Функция, срабатывающая при ошибке геолокации
const errorGeo = () => {
  service_message('Невозможно получить ваше местоположение');
}

// Функция, срабатывающая при успешном получении геолокации
const successGeo = (position) => {
  const latitude  = position.coords.latitude;
  const longitude = position.coords.longitude;

  service_message(`Широта: ${latitude} °, Долгота: ${longitude} °`);
  let href = `${geoUri}/${latitude}/${longitude}`;
  
  isGeo = true; // устанавливаем флаг, чтобы при получении сообщения от эхо-сервера обработать его и не выводить сообщение на экран
  websocket.send(href);

  let div = document.createElement("div");
  let a = document.createAttribute("class");
  a.value = "msg msg-client";
  div.setAttributeNode(a);
  div.innerHTML = `<a href = ${href} id = "map-link" target="_blank">Гео-локация</a>`;
  msgBlockNode.appendChild(div);
  msgBlockNode.lastChild.scrollIntoView();
}

btnSendGeo.addEventListener('click', () => {  
  if (!navigator.geolocation) {
    service_message('Geolocation не поддерживается вашим браузером');
    alert('Geolocation не поддерживается вашим браузером'); //стоит сообщить об этом пользователю
  } else {
    service_message('Определение местоположения…');
    navigator.geolocation.getCurrentPosition(successGeo, errorGeo);
  }
});
