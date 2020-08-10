const LCUConnector = require('lcu-connector')
const request = require('request')
const connector = new LCUConnector();

const postURI = "currymaker.net:3000";

let sometingLol = null;

connector.on('connect', (data) => {
    console.log(data);
    //connect via data.protocol://data.username:data.password@data.address:data.port
    console.log("every second GET https://" + data.username + ":" + data.password + "@127.0.0.1:" + data.port + "/lol-champ-select/v1/session");
    sometingLol = setInterval(() => {
        request("https://" + data.username + ":" + data.password + "@127.0.0.1:" + data.port + "/lol-champ-select/v1/session", {strictSSL: false},  (err, res, body2) => {
            if (err) { return console.log(err); }
            //console.log(body2)
            let data2 = JSON.parse(body2);
            if(data2.httpStatus != 404) {
                data2.myTeam.forEach(function(element, index) {
                    request("https://" + data.username + ":" + data.password + "@127.0.0.1:" + data.port + "/lol-summoner/v1/summoners/" + element.summonerId, {strictSSL: false},  (errT, resT, bodyT) => {
                        data2.myTeam[index].name = JSON.parse(bodyT).displayName;
                    });
                });
                data2.theirTeam.forEach(function(element, index) {
                    request("https://" + data.username + ":" + data.password + "@127.0.0.1:" + data.port + "/lol-summoner/v1/summoners/" + element.summonerId, {strictSSL: false},  (errT, resT, bodyT) => {
                        data2.theirTeam[index].name = JSON.parse(bodyT).displayName;
                    });
                });
            }
            setTimeout(() => {request.post(`http://${postURI}/post-pnb-data`, {json: {someData: JSON.stringify(data2)}}, (err, res, b) => {});}, 5000);
        });
    }, 1000);
});

connector.on('disconnect', () => {
    clearInterval(sometingLol)
});

module.exports = function() {
    connector.start();
}