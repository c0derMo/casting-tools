const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path');
const configmanager = require('./configmanager');
const lcucollector = require('./lcucollector');
const request = require('./request');

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

  win.webContents.openDevTools();

  setTimeout(() => {
    //Initial config stuff
    let copyConfig = config;
    copyConfig.status = {};
    if(config.general.autostart) {
      copyConfig.status.datacollection = true;
      startDataCollection();
    }
    copyConfig.status.lcu = false;
    copyConfig.status.livedata = false;
    win.webContents.send("config", JSON.stringify(copyConfig));
  }, 1000);

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
    let sendConfig = parseConfig(newCfg);
    window.webContents.send("config", JSON.stringify(sendConfig));
});

function startDataCollection() {
  isCollectionRunning = true;
  eventLoop = setInterval(fetchData, config.general.frequency)
}

function endDataCollection() {
  isCollectionRunning = false;
  clearInterval(eventLoop);
}

function parseConfig(newCfg) {
  if(newCfg.general.running != isCollectionRunning) {
    if(newCfg.general.running) {
      startDataCollection();
    } else {
      endDataCollection();
    }
  }

  let shouldLCURun = (newCfg.lcu.champselect || newCfg.lcu.names);
  if(shouldLCURun != lcucollector.isLCURunning()) {
    if(shouldLCURun) {
      lcucollector.startLCUCollection();
    } else {
      lcucollector.stopLCUCollection();
    }
  }

  delete newCfg.general.running;
  config = newCfg;

  let sendConfig = newCfg;
  sendConfig.status = {};
  sendConfig.status.datacollection = isCollectionRunning;
  sendConfig.status.lcu = lcucollector.isLCURunning();
  sendConfig.status.livedata = false;
  return sendConfig;
}

function fetchData() {
  if(config.lcu.champselect) {
    lcucollector.fetchChampselectData((champselectData) => {
      if(config.lcu.names) {
        lcucollector.fetchSummonerNames(champselectData, (newData) => {
          request.post(config.general.server + "/post-pnb-data", {someData: JSON.stringify(newData)});
        });
      } else {
        request.post(config.general.server + "/post-pnb-data", {someData: JSON.stringify(champselectData)});
      }
    })
  }
}