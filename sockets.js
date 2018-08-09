/**
 * Метод опрашивания данных
 * @param send_data - Отправляемые данные
 * @param need_repeat - Нужно ли повторять запрос
 */
function getData(send_data, need_repeat) {

    // Если вкладка не активная, не делаем на нее запросы
    if (document.hidden || document.msHidden || document.webkitHidden || document.mozHidden) {
        setTimeout(function () {
            if (need_repeat) {
                getData(send_data, need_repeat);
            }
        }, 2000);

    } else {
        setTimeout(function () {

            var msg = new MessageChannel();
            msg.port1.onmessage = function(event){
                //Response received from SW
                console.log('Receive response from server: ' + event.data);
                $('[name=data]').html(event.data);
            };

            navigator.serviceWorker.controller.postMessage(send_data, [msg.port2]);

            if (need_repeat) {
                getData(send_data, need_repeat);
            }

        }, 2000);
    }
}

// Инитим и запускаем опрос
function run () {
    // Send message to SW
    // Start command Shared Worker
    getData({'cmd': 'start'}, false);

    // Запускаем опрос
    getData('569908768654', true);
}

if ('serviceWorker' in navigator) {

    // Если уже есть СервисВоркер подключаем новую вкладку к существующему
    if (navigator.serviceWorker.controller !== null) {
        run();
    } else {

        window.addEventListener('load', function () {

            console.log(navigator.serviceWorker);
            navigator.serviceWorker.register('service_worker.js?version=2', {scope: './'}).then(function (reg) {
                reg.onupdatefound = function () {
                    var installingWorker = reg.installing;

                    installingWorker.onstatechange = function () {

                        switch (installingWorker.state) {
                            case 'activated':
                                if (navigator.serviceWorker.controller) {
                                    console.log('New or updated content is available.');

                                    run();

                                } else {
                                    // At this point, everything has been precached.
                                    // It's the perfect time to display a "Content is cached for offline use." message.
                                    console.log('Content is now available offline!');
                                }
                                break;

                            case 'redundant':
                                console.error('The installing service worker became redundant.');
                                break;
                        }
                    };
                };
            }).catch(function (e) {
                console.error('Error during service worker registration:', e);
            });
        });
    }
}