const request = require('./request');
const { stat } = require('fs');

let isLiveConnected = false;
let stateChangeListener = [];

function fetchPlayerlist(cb) {
    request.get('https://localhost:2999/liveclientdata/playerlist', {rejectUnauthorized: false}).then((data) => {
        isLiveConnected = true;
        if(!isLiveConnected) {
            _callAllListeners();
        }
        cb(data.body);
    }).catch((err) => {
        isLiveConnected = false;
        if(isLiveConnected) {
            _callAllListeners();
        }
        cb({});
    });
}

function fetchEventdata(cb) {
    request.get('https://localhost:2999/liveclientdata/eventdata', {rejectUnauthorized: false}).then((data) => {
        isLiveConnected = true;
        if(!isLiveConnected) {
            _callAllListeners();
        }
        cb(data.body);
    }).catch((err) => {
        isLiveConnected = false;
        if(isLiveConnected) {
            _callAllListeners();
        }
        cb({});
    });
}

function fetchGamestats(cb) {
    request.get('https://localhost:2999/liveclientdata/gamestats', {rejectUnauthorized: false}).then((data) => {
        isLiveConnected = true;
        if(!isLiveConnected) {
            _callAllListeners();
        }
        cb(data.body);
    }).catch((err) => {
        isLiveConnected = false;
        if(isLiveConnected) {
            _callAllListeners();
        }
        cb({});
    });
}

function _callAllListeners() {
    stateChangeListener.forEach(function(elem) {
        elem();
    });
}

function isConnected() {
    return isLiveConnected;
}

function addStateChangeListener(fnc) {
    stateChangeListener.push(fnc);
}

function removeStateChangeListener(fnc) {
    stateChangeListener = stateChangeListener.filter((elem) => {
        return elem != fnc;
    });
}

module.exports = {
    fetchPlayerlist: fetchPlayerlist,
    fetchEventdata: fetchEventdata,
    fetchGamestats: fetchGamestats,
    isConnected: isConnected,
    addStateChangeListener: addStateChangeListener,
    removeStateChangeListener: removeStateChangeListener
}