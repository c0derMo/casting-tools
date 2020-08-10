const request = require('request');

const postURI = "currymaker.net:3000";

console.log("Querying playerdata & eventdata every second...")
setInterval(() => {
    request("https://localhost:2999/liveclientdata/playerlist", {strictSSL: false}, (err, res, b) => {
        if(err) {
            if(err.code != "ECONNREFUSED") {
                console.log(err);
            }
            return;
        };
        request.post(`http://${postURI}/overlay/playerdata`, {json: {playerdata: b}}, (err, res, b) => {});
    });
    request("https://localhost:2999/liveclientdata/eventdata", {strictSSL: false}, (err, res, b) => {
        if(err) {
            if(err.code != "ECONNREFUSED") {
                console.log(err);
            }
            return;
        };
        request.post(`http://${postURI}/overlay/eventdata`, {json: {eventdata: b}}, (err, res, b) => {});
    });
    request("https://localhost:2999/liveclientdata/gamestats", {strictSSL: false}, (err, res, b) => {
        if(err) {
            if(err.code != "ECONNREFUSED") {
                console.log(err);
            }
            return;
        };
        request.post(`http://${postURI}/overlay/gamedata`, {json: {gamedata: b}}, (err, res, b) => {});
    });
}, 1000);