const fs = require('fs');

function loadConfig() {
    let data;
    try {
        data = JSON.parse(fs.readFileSync("config.json", {encoding: 'utf8'}))
    } catch (error) {
        if(error.code == 'ENOENT') {
            //Config does not exist
            data = {
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
        }   
    }
    return data;
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