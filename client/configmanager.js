const fs = require('fs');

function loadConfig() {
    fs.readFile("config.json", {encoding: 'utf8'}, (err, data) => {
        if(err.code == 'ENOENT') {
            //Config does not exist
            let config = {
                general: {
                    server: '',
                    frequency: 1000,
                    autostart: false
                },
                lcu: {
                    champselect: false,
                    names: false
                },
                lcd: {
                    playerlist: false,
                    eventdata: false,
                    gamestats: false
                }
            }
            return config;
        }

        return JSON.parse(data);
    });
}

function writeConfig(cfg) {
    fs.writeFile("config.json", JSON.stringify(cfg), (err) => {
        if(err) throw err;
    });
}

module.exports = {
    loadConfig: loadConfig,
    writeConfig: writeConfig
}