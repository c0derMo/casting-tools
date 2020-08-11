const { ipcRenderer } = require('electron');

let dataRecievedCallback;
let stuffToSend = [];

function setConfigRevcievedCallback(cb) {
    dataRecievedCallback = cb;
    stuffToSend.forEach(function(element) {
        cb(stuffToSend);
    });
    stuffToSend = [];
}

ipcRenderer.on('config', (ev, msg) => {
    try {
        dataRecievedCallback(JSON.parse(msg));   
    } catch (error) {
        stuffToSend.push(msg);
    }
});

function sendConfig(config) {
    ipcRenderer.send("config", JSON.stringify(config));
}

window.Bridge = {
    setConfigRevcievedCallback: setConfigRevcievedCallback,
    sendConfig: sendConfig
};