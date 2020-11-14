const fs = require('fs');
const express = require("express");
const cors = require('cors');
const app = express();

app.use(cors());

function createGamestate(data) {
    //Create some neccessary objects
    let gamestate = {
        "blueTeam": {
            "players": [],
            "bans": []
        },
        "redTeam": {
            "players": [],
            "bans": []
        },
        "phase": {}
    }

    //2 = red side, 1 = blue side
    let localTeamIndex = data.myTeam[0].team;

    //Get basic player info
    let localTeam = [];
    let localTeamCellIds = [];
    data.myTeam.forEach(function (element) {
        let player = {};
        if (element.name != undefined || element.name != "" || element.name != null) {
            player.name = element.name;
        } else {
            player.name = "";
        }
        player.championId = element.championId;
        localTeamCellIds.push(element.cellId);
        player.cellId = element.cellId;
        localTeam.push(player);
    });

    let otherTeam = [];
    data.theirTeam.forEach(function (element) {
        let player = {};
        if (element.name != undefined || element.name != "" || element.name != null) {
            player.name = element.name;
        } else {
            player.name = "";
        }
        player.championId = element.championId;
        player.cellId = element.cellId;
        otherTeam.push(player);
    });


    let localTeamBans = [];
    let enemyTeamBans = [];

    //Parse actions & bans
    data.actions.forEach(function (element) {
        element.forEach(function (e) {
            if (e.type == "ban") {
                if (e.isInProgress || e.completed) {
                    let ban = {};
                    ban.championId = e.championId;
                    if (!e.completed) {
                        ban.picking = true;
                    }
                    if (localTeamCellIds.includes(e.actorCellId)) {
                        localTeamBans.push(ban);
                    } else {
                        enemyTeamBans.push(ban);
                    }
                }
            } else if (e.type == "pick") {
                if (e.isInProgress && !e.completed) {
                    let local = localTeam.find((elem) => {
                        return elem.cellId == e.actorCellId;
                    });
                    let other = otherTeam.find((elem) => {
                        return elem.cellId == e.actorCellId;
                    });
                    if(local != undefined || other != undefined) {
                        if(local == undefined) {
                            let index = otherTeam.indexOf(other);
                            other.picking = true;
                            otherTeam[index] = other;
                        } else {
                            let index = localTeam.indexOf(local);
                            local.picking = true;
                            localTeam[index] = local;
                        }
                    }
                }
            }
        });
    });


    //Put info in the correct spaces
    if (localTeamIndex == 1) {
        gamestate.blueTeam.players = localTeam;
        gamestate.blueTeam.bans = localTeamBans;
        gamestate.redTeam.players = otherTeam;
        gamestate.redTeam.bans = enemyTeamBans;
    } else {
        gamestate.blueTeam.players = otherTeam;
        gamestate.blueTeam.bans = enemyTeamBans;
        gamestate.redTeam.players = localTeam;
        gamestate.redTeam.bans = localTeamBans;
    }


    //Calculating phase
    let phase = "swap";
    let team;
    if(localTeam == 1) {
        team = 2;
    } else {
        team = 1;
    }
    data.actions.forEach(function(element) {
        element.forEach(function(e) {
            if(e.isInProgress != true) return;
            if(e.type == "pick") {
                phase = "pick";
                if(localTeamCellIds.includes(e.actorCellId)) {
                    team = localTeamIndex;
                }
            } else if(e.type == "ban") {
                phase = "ban";
                if(localTeamCellIds.includes(e.actorCellId)) {
                    team = localTeamIndex;
                }
            } else if(e.type == "phase_transition") {
                phase = "transition";
            }
        });
    });

    
    //Calculating timer
    let startOfPhase = data.timer.internalNowInEpochMs;
    let expectedEndOfPhase = startOfPhase + data.timer.adjustedTimeLeftInPhase;

    let countdown = expectedEndOfPhase - new Date().getTime();
    let countdownSec = Math.floor(countdown / 1000) + 5;


    //Putting phase data in correct spots
    gamestate.phase.phase = phase;
    gamestate.phase.actingTeam = team;
    gamestate.phase.timer = countdownSec;


    return gamestate;
}


function parseFile(i) {
    let currentFile = fs.readFileSync("capture/" + i + ".json");
    let data = JSON.parse(currentFile);
    
    let gamestate = createGamestate(data);
    return gamestate;
}

module.exports = {
    createGamestate: createGamestate
};