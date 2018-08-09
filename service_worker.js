var port;
var ws = null;
var peers = [];

self.addEventListener('install', (event) => {
    console.log('Установлен');
    // Activate worker immediately
    // event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
    console.log('Активирован');
    // Become available to all pages
    event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
    // console.log('Происходит запрос на сервер');
});

self.addEventListener('message', function (evt) {
    if (evt.data.cmd === 'start') {

        peers.push(evt.ports[0]);

        var d = new Date();
        var n = d.getTime();

        if (ws === null) {
            // Socket init
            ws = new WebSocket('ws://curex.ll:8880');
            console.log("Create new socket: " + n);
        } else {
            console.log("Use old socket: " + n);
        }

        ws.onopen = function () {
            // console.log("Open");
            return true;
        };

        // On message receive
        ws.onmessage = function (event) {
            console.log("Message receive " + event.data);
            send_data(event.data);
        };

        // On error connection
        ws.onerror = function (error) {
            // console.log("Error " + error.message);
        };

        // On close connection
        ws.onclose = function (event) {
            if (event.wasClean) {
                // console.log('clean closed');

            } else {
                // console.log('broken connection');
            }
            console.log('Code: ' + event.code + ' reason: ' + event.reason);
        };

        // Отправляем данные клиенту
        function send_data(data) {
            peers.forEach(function (port) {
                port.postMessage(data);
            });
        }

    } else {
        // Инитим объект и запускаем опрос
        if (ws !== null && ws.readyState === 1)
            ws.send(evt.data);
    }
});