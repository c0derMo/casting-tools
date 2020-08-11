const LCUConnector = require('lcu-connector');
const connector = new LCUConnector();
const tiny = require('tiny-json-http');

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
    tiny.get({url: "https://" + data.username + ":" + data.password + "@127.0.0.1:" + data.port + "/lol-champ-select/v1/session", rejectUnauthorized: false}).then(body => {
        cb(JSON.parse(body.body));
    });
}

function fetchSummonerNames(champselectData, cb) {
    if(!isConnected) return champselectData;
    let promises = [];
    champselectData.myTeam.forEach(function(element, index) {
        promises.push(tiny.get({url:"https://" + data.username + ":" + data.password + "@127.0.0.1:" + data.port + "/lol-summoner/v1/summoners/" + element.summonerId,rejectUnauthorized:false}).then(val => {champselectData.myTeam[index].name = JSON.parse(val.body).displayName}));
    });
    champselectData.theirTeam.forEach(function(element, index) {
        promises.push(tiny.get({url:"https://" + data.username + ":" + data.password + "@127.0.0.1:" + data.port + "/lol-summoner/v1/summoners/" + element.summonerId,rejectUnauthorized:false}).then(val => {champselectData.theirTeam[index].name = JSON.parse(val.body).displayName}));
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