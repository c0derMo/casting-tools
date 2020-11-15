const LCUConnector = require('lcu-connector');
const connector = new LCUConnector();
const request = require('./request');

let isConnected = false;
let connectionCredentials = {};
let stateChangeListener = [];

connector.on('connect', (data) => {
    connectionCredentials = data;
    isConnected = true;
    stateChangeListener.forEach(elem => {
        elem();
    })
});

connector.on('disconnect', () => {
    connectionCredentials = {};
    isConnected = false;
    stateChangeListener.forEach(elem => {
        elem();
    })
})

function startLCUCollection() {
    connector.start();
}

function stopLCUCollection() {
    connector.stop();
    connectionCredentials = {};
    isConnected = false;
    stateChangeListener.forEach(elem => {
        elem();
    })
}

function fetchChampselectData(cb) {
    if(!isConnected) return {};
    request.get("https://" + connectionCredentials.username + ":" + connectionCredentials.password + "@127.0.0.1:" + connectionCredentials.port + "/lol-champ-select/v1/session", {rejectUnauthorized: false}).then((data) => {
        cb(JSON.parse(data.body));
    });
}

function fetchSummonerNames(champselectData, cb) {
    if(!isConnected) return champselectData;
    let promises = [];
    champselectData.myTeam.forEach(function(element, index) {
        promises.push(request.get("https://" + connectionCredentials.username + ":" + connectionCredentials.password + "@127.0.0.1:" + connectionCredentials.port + "/lol-summoner/v1/summoners/" + element.summonerId, {rejectUnauthorized:false}).then((data) => {champselectData.myTeam[index].name = JSON.parse(data.body).displayName}));
    });
    champselectData.theirTeam.forEach(function(element, index) {
        promises.push(request.get("https://" + connectionCredentials.username + ":" + connectionCredentials.password + "@127.0.0.1:" + connectionCredentials.port + "/lol-summoner/v1/summoners/" + element.summonerId, {rejectUnauthorized:false}).then((data) => {champselectData.theirTeam[index].name = JSON.parse(data.body).displayName}));
    });

    Promise.all(promises).then((val) => {
        cb(champselectData);
    });
}

function isLCURunning() {
    return isConnected;
}

function addStateChangeListener(fnc) {
    stateChangeListener.push(fnc);
}

function removeStateChangeListener(fnc) {
    stateChangeListener = stateChangeListener.filter(elem => {
        return elem != fnc;
    })
}

function executeACE(rq, cb) {
    if(!isConnected) return {};
    request.get("https://" + connectionCredentials.username + ":" + connectionCredentials.password + "@127.0.0.1:" + connectionCredentials.port + rq, {rejectUnauthorized: false}).then((data) => {cb(data.body)});
}

module.exports = {
    startLCUCollection: startLCUCollection,
    stopLCUCollection: stopLCUCollection,
    fetchChampselectData: fetchChampselectData,
    fetchSummonerNames: fetchSummonerNames,
    isLCURunning: isLCURunning,
    addStateChangeListener: addStateChangeListener,
    removeStateChangeListener: removeStateChangeListener,
    executeACE: executeACE
}
