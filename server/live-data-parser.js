let playersWithBaronBuff = [];
let playersWithElderBuff = [];
let lastBaronKillID = 0;
let lastElderKillID = 0;
let baronExpiresIn = -1;
let elderExpiresIn = -1;
let teamWithBaron = 0;
let teamWithElder = 0;

function parseLiveData(allPlayerData, eventData, gameData, internalData) {
    //TODO: Fix internal element types!!!!
    try {
        allPlayerData = JSON.parse(allPlayerData);
        eventData = JSON.parse(eventData);
        gameData = JSON.parse(gameData);
    } catch(e) {
        return;
    }
    if(allPlayerData == {} || eventData == {} || gameData == {} || internalData == {}) return;
    let liveData = {
        "blueTeamPlayers": [
            {}, {}, {}, {}, {}
        ],
        "redTeamPlayers": [
            {}, {}, {}, {}, {}
        ],
        "otherFeatures": {
        }
    };

    //Read secondary summoner spells & items
    let rTI = 0;
    let bTI = 0;
    allPlayerData.forEach(function(player) {
        let runeTree = "";
        let items = []
        player.items.forEach(elem => {
            items.push(elem.itemID);
        });

        if(player.runes != null) {
            switch(player.runes.secondaryRuneTree.id) {
                case 8000:
                    runeTree = "precision";
                    break;
                case 8100:
                    runeTree = "domination";
                    break;
                case 8200:
                    runeTree = "sorcery";
                    break;
                case 8300:
                    runeTree = "inspiration";
                    break;
                case 8400:
                    runeTree = "resolve";
                    break;
            }
            if(player.team == "ORDER") {
                //Blue Team
                liveData.blueTeamPlayers[bTI].secondaryRuneTree = runeTree;
                liveData.blueTeamPlayers[bTI].items = items;
                bTI++;
            } else if(player.team == "CHAOS") {
                //Red Team
                liveData.redTeamPlayers[rTI].secondaryRuneTree = runeTree;
                liveData.redTeamPlayers[rTI].items = items;
                rTI++;
            }
        } else {
            if(player.team == "ORDER") {
                //Blue Team
                liveData.blueTeamPlayers[bTI].items = items;
                bTI++;
            } else if(player.team == "CHAOS") {
                //Red Team
                liveData.redTeamPlayers[rTI].items = items;
                rTI++;
            }
        }
    });


    //Inhibtimers
    let inhibTimers = {
        "blue": {
            "top": -1,
            "mid": -1,
            "bot": -1,
            "show": false
        },
        "red": {
            "top": -1,
            "mid": -1,
            "bot": -1,
            "show": false
        }
    };
    eventData.Events.forEach(function(element) {
        if(element.EventTime > gameData.gameTime) return;
        if(element.EventName == "InhibKilled" && (gameData.gameTime - element.EventTime) < 300) {
            let timeUntilInhibRespawned = Math.floor(300 - (gameData.gameTime - element.EventTime));
            switch(element.InhibKilled) {
                case "Barracks_T1_C1":
                    inhibTimers.blue.mid = timeUntilInhibRespawned;
                    inhibTimers.blue.show = true;
                    break;
                case "Barracks_T1_L1":
                    inhibTimers.blue.top = timeUntilInhibRespawned;
                    inhibTimers.blue.show = true;
                    break;
                case "Barracks_T1_R1":
                    inhibTimers.blue.bot = timeUntilInhibRespawned;
                    inhibTimers.blue.show = true;
                    break;
                case "Barracks_T2_C1":
                    inhibTimers.red.mid = timeUntilInhibRespawned;
                    inhibTimers.red.show = true;
                    break;
                case "Barracks_T2_R1":
                    inhibTimers.red.bot = timeUntilInhibRespawned;
                    inhibTimers.red.show = true;
                    break;
                case "Barracks_T2_L1":
                    inhibTimers.red.top = timeUntilInhibRespawned;
                    inhibTimers.red.show = true;
                    break;
            }
        }
    });

    liveData.otherFeatures.inhibTimers = inhibTimers;


    //Drake & Baron Timers
    let objectiveTimers = {
        "baronTimer": -1,
        "drakeTimer": {
            "type": internalData.drakeType,
            "timer": -1
        }
    }
    let drakeNormalTimer = internalData.drakeTimer;
    eventData.Events.forEach(function(element) {
        if(element.EventTime > gameData.gameTime) return;
        //Dragon
        if((element.EventName == "GameStart" || element.EventName == "DragonKill") && (gameData.gameTime - element.EventTime) < drakeNormalTimer) {
            objectiveTimers.drakeTimer.timer = Math.floor(drakeNormalTimer - (gameData.gameTime - element.EventTime));
        }

        //Baron
        if(element.EventName == "GameStart" && (gameData.gameTime - element.EventTime) < 1200) {
            //Baron initial spawn
            objectiveTimers.baronTimer = Math.floor(1200 - (gameData.gameTime - element.EventTime));
        } else if(element.EventName == "BaronKill" && (gameData.gameTime - element.EventTime) < 360) {
            //Baron respawn
            objectiveTimers.baronTimer = Math.floor(360 - (gameData.gameTime - element.EventTime));
        }
    });

    liveData.otherFeatures.objectiveTimers = objectiveTimers;


    //Update who has which buffs
    eventData.Events.forEach(function(element) {
        if(element.EventTime > gameData.gameTime) return;
        if(element.EventName == "BaronKill" && lastBaronKillID < element.EventID) {
            //We got a new baron
            lastBaronKillID = element.EventID;
            baronExpiresIn = gameData.gameTime + 180;

            //Lets check which team killed it
            let team = "";
            allPlayerData.forEach(function(element2) {
                if(element2.summonerName == element.KillerName) {
                    team = element2.team;
                }
            });
            if(team == "ORDER") {
                teamWithBaron = 1;
            } else {
                teamWithBaron = 2;
            }

            //Alrighty, let's check who's alive in that team
            allPlayerData.forEach(function(element2) {
                if(element2.team == team) {
                    if(!element2.isDead) {
                        playersWithBaronBuff.push(element2.summonerName);
                    }
                }
            });
        }
        if(element.EventName == "DragonKill" && element.DragonType == "Elder" && lastElderKillID < element.EventID) {
            //We got a new elder
            lastElderKillID = element.EventID;
            elderExpiresIn = gameData.gameTime + 150;

            //Lets check which team killed it
            let team = "";
            allPlayerData.forEach(function(element2) {
                if(element2.summonerName == element.KillerName) {
                    team = element2.team;
                }
            });
            if(team == "ORDER") {
                teamWithElder = 1;
            } else {
                teamWithElder = 2;
            }
            
            //Alrighty, let's check who's alive in that team
            allPlayerData.forEach(function(element2) {
                if(element2.team == team) {
                    if(!element2.isDead) {
                        playersWithElderBuff.push(element2.summonerName);
                    }
                }
            });
        }
        if(playersWithElderBuff.length > 0 && element.EventID > lastElderKillID && element.EventName == "ChampionKill") {
            //Lets see if he had elder buff
            if(playersWithElderBuff.includes(element.VictimName)) {
                playersWithElderBuff.splice(playersWithElderBuff.indexOf(element.VictimName), 1);
            }
        }
        if(playersWithBaronBuff.length > 0 && element.EventName == "ChampionKill" && element.EventID > lastBaronKillID) {
            //Lets see if he had baron buff
            if(playersWithBaronBuff.includes(element.VictimName)) {
                //He had, lets remove it
                playersWithBaronBuff.splice(playersWithBaronBuff.indexOf(element.VictimName), 1);
            }
        }
    })
    //Actually, did any of the buffs expire?
    if(baronExpiresIn > 0 && gameData.gameTime > baronExpiresIn) {
        //Baron expired
        playersWithBaronBuff = [];
        baronExpiresIn = -1;
        teamWithBaron = 0;
    }
    if(elderExpiresIn > 0 && gameData.gameTime > elderExpiresIn) {
        //Elder expired
        playersWithElderBuff = [];
        elderExpiresIn = -1;
        teamWithElder = 0;
    }

    //Now lets pack that into the livedata
    let buffs = {
        "baronBuff": {},
        "elderBuff": {}
    };
    if(playersWithBaronBuff.length > 0) {
        buffs.baronBuff.active = true;
        buffs.baronBuff.team = teamWithBaron;
        buffs.baronBuff.members = playersWithBaronBuff.length;
        buffs.baronBuff.remainingTime = Math.floor(baronExpiresIn - gameData.gameTime);
    } else {
        buffs.baronBuff.active = false;
    }

    if(playersWithElderBuff.length > 0) {
        buffs.elderBuff.active = true;
        buffs.elderBuff.team = teamWithElder;
        buffs.elderBuff.members = playersWithElderBuff.length;
        buffs.elderBuff.remainingTime = Math.floor(elderExpiresIn - gameData.gameTime);
    } else {
        buffs.elderBuff.active = false;
    }
    liveData.otherFeatures.buffs = buffs;

    return liveData;
}

module.exports = {
    parseLiveData: parseLiveData
}