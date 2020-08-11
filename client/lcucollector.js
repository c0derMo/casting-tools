const LCUConnector = require('lcu-connector');
const connector = new LCUConnector();
const https = require('https');
const request = require('./request');

let isConnected = false;
let connectionCredentials = {};

connector.on('connect', (data) => {
    connectionCredentials = data;
    isConnected = true;
});

connector.on('disconnect', () => {
    connectionCredentials = {};
    isConnected = false;
})

function startLCUCollection() {
    connector.start();
}

function stopLCUCollection() {
    connector.stop();
}

function fetchChampselectData(cb) {
    if(!isConnected) return {};
    request.gets("https://" + connectionCredentials.username + ":" + connectionCredentials.password + "@127.0.0.1:" + connectionCredentials.port + "/lol-champ-select/v1/session", {rejectUnauthorized: false}).then((data) => {
        cb(JSON.parse(data.body));
    });
}

function fetchSummonerNames(champselectData, cb) {
    if(!isConnected) return champselectData;
    let promises = [];
    champselectData.myTeam.forEach(function(element, index) {
        // promises.push(tiny.get({rejectUnauthorized:false}).then(val => {champselectData.myTeam[index].name = JSON.parse(val.body).displayName}));
        promises.push(requests.gets("https://" + connectionCredentials.username + ":" + connectionCredentials.password + "@127.0.0.1:" + connectionCredentials.port + "/lol-summoner/v1/summoners/" + element.summonerId, {rejectUnauthorized:false}).then((data) => {champselectData.myTeam[index].name = JSON.parse(data.body).displayName}));
    });
    champselectData.theirTeam.forEach(function(element, index) {
        // promises.push(tiny.get({url:"https://" + connectionCredentials.username + ":" + connectionCredentials.password + "@127.0.0.1:" + connectionCredentials.port + "/lol-summoner/v1/summoners/" + element.summonerId,rejectUnauthorized:false}).then(val => {champselectData.theirTeam[index].name = JSON.parse(val.body).displayName}));
        promises.push(requests.gets("https://" + connectionCredentials.username + ":" + connectionCredentials.password + "@127.0.0.1:" + connectionCredentials.port + "/lol-summoner/v1/summoners/" + element.summonerId, {rejectUnauthorized:false}).then((data) => {champselectData.theirTeam[index].name = JSON.parse(data.body).displayName}));
    });

    Promise.all(promises).then((val) => {
        cb(champselectData);
    });
}

function isLCURunning() {
    return isConnected;
}

module.exports = {
    startLCUCollection: startLCUCollection,
    stopLCUCollection: stopLCUCollection,
    fetchChampselectData: fetchChampselectData,
    fetchSummonerNames: fetchSummonerNames,
    isLCURunning: isLCURunning
}


// TESTING CODE BELOW
// testConn = new LCUConnector()
// testConn.on('connect',  (data) => {
//     https.get("https://" + data.username + ":" + data.password + "@127.0.0.1:" + data.port + "/lol-champ-select/v1/session", {rejectUnauthorized: false}, (res) => {
//         res.on('data', (d) => {
//             console.log(d.toString());
//         });
//         res.on('end', () => {
//             console.log("end")
//         });
//     });
// });
// testConn.start()