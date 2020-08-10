const { ipcRenderer } = require('electron');

let dataRecievedCallback;

function setConfigRevcievedCallback(cb) {
    dataRecievedCallback = cb;
}

ipcRenderer.on('config', (ev, msg) => {
    dataRecievedCallback(JSON.parse(msg));
});

function sendConfig(config) {
    ipcRenderer.send("config", JSON.stringify(config));
}

window.Bridge = {
    setConfigRevcievedCallback: setConfigRevcievedCallback,
    sendConfig: sendConfig
};