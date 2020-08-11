const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path');
const configmanager = require('./configmanager');
const { start } = require('repl');
const { isDate } = require('util');

let window;
let config = configmanager.loadConfig();
let isCollectionRunning = false;
let eventLoop;

function createWindow () {
  // Create the browser window.
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
        preload: path.join(app.getAppPath(), 'preload.js')
    },
    center: true,
    resizable: false
  })
  // and load the index.html of the app.
  win.loadFile('html/index.html')
  win.setMenu(null);

  //Initial config stuff
  let copyConfig = config;
  copyConfig.status = {};
  if(config.general.autostart) {
    copyConfig.status.datacollection = true;
    startDataCollection();
  }
  copyConfig.status.lcu = false;
  copyConfig.status.livedata = false;
  delete copyConfig.general.running;
  win.webContents.send("config", JSON.stringify(copyConfig));
  window = win;
}

app.whenReady().then(createWindow)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    configmanager.writeConfig(config);
    app.quit()
  }
})
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

//Testing communication
ipcMain.on("config", (ev, cfg) => {
    let newCfg = JSON.parse(cfg);
    if(newCfg.general.running != isCollectionRunning) {
      if(newCfg.general.running) {
        startDataCollection();
      } else {
        stopDataCollection();
      }
    }
    delete newCfg.general.running;
    config = newCfg;

    let sendConfig = newCfg;
    sendConfig.status = {};
    sendConfig.status.datacollection = isCollectionRunning;
    sendConfig.status.lcu = false;
    sendConfig.status.livedata = false;
    window.webContents.send("config", JSON.stringify(sendConfig));
});

function startDataCollection() {
  isCollectionRunning = true;
}

function endDataCollection() {
  isCollectionRunning = false;
}