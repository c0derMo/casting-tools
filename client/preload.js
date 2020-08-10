const { ipcRenderer } = require('electron');

console.log("PRELOADED");

ipcRenderer.on('test', (ev, msg) => {
    console.log("Got something in renderer");
    console.log(ev);
    console.log(msg);
});

window.Bridge = {
    sendSomething: sendSomething
};

function sendSomething(msg) {
    ipcRenderer.send("test", msg);
}