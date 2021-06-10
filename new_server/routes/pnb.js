const express = require('express');
const pnbParser = require('../lib/pnb-parser')
const router = express.Router();

//
// Router Functions
//

router.all('*', (req, res) => {
    res.send("U accessed pnb: " + req.path);
});


//
// Pick & Ban API
//

let pnbData = {};
let teamNames = {
    "red": "",
    "blue": ""
};
let teamAbreviations = {
    "red": "",
    "blue": ""
};

function postPnbData(newData) {
    pnbData = newData;
}

function getPnbData(raw = false) {
    if(raw) {
        return pnbData;
    } else {
        return pnbParser.createGamestate(pnbData);
    }
}

function reset() {
    pnbData = {};
}

function setTeamName(team, name) {
    teamNames[team] = name;
}

function getTeamNames() {
    return teamNames;
}

function setTeamAbreviations(team, abr) {
    teamAbreviations[team] = abr;
}

function getTeamAbreviations() {
    return teamAbreviations;
}

function swapTeams() {
    let tmp = teamNames.blue;
    teamNames.blue = teamNames.red;
    teamNames.red = tmp;

    tmp = teamAbreviations.blue;
    teamAbreviations.blue = teamAbreviations.red;
    teamAbreviations.red = tmp;
}

module.exports = router;