const memoryjs = require('memoryjs');
const os = require('os');
const fs = require('fs');

let champions = ["Aatrox","Ahri","Akali","Alistar","Amumu","Anivia","Annie","Aphelios","Ashe","AurelionSol","Azir","Bard","Blitzcrank","Brand","Braum","Caitlyn","Camille","Cassiopeia","Chogath","Corki","Darius","Diana","Draven","DrMundo","Ekko","Elise","Evelynn","Ezreal","Fiddlesticks","Fiora","Fizz","Galio","Gangplank","Garen","Gnar","Gragas","Graves","Gwen","Hecarim","Heimerdinger","Illaoi","Irelia","Ivern","Janna","JarvanIV","Jax","Jayce","Jhin","Jinx","Kaisa","Kalista","Karma","Karthus","Kassadin","Katarina","Kayle","Kayn","Kennen","Khazix","Kindred","Kled","KogMaw","Leblanc","LeeSin","Leona","Lillia","Lissandra","Lucian","Lulu","Lux","Malphite","Malzahar","Maokai","MasterYi","MissFortune","MonkeyKing","Mordekaiser","Morgana","Nami","Nasus","Nautilus","Neeko","Nidalee","Nocturne","Nunu","Olaf","Orianna","Ornn","Pantheon","Poppy","Pyke","Qiyana","Quinn","Rakan","Rammus","RekSai","Rell","Renekton","Rengar","Riven","Rumble","Ryze","Samira","Sejuani","Senna","Seraphine","Sett","Shaco","Shen","Shyvana","Singed","Sion","Sivir","Skarner","Sona","Soraka","Swain","Sylas","Syndra","TahmKench","Taliyah","Talon","Taric","Teemo","Thresh","Tristana","Trundle","Tryndamere","TwistedFate","Twitch","Udyr","Urgot","Varus","Vayne","Veigar","Velkoz","Vi","Viego","Viktor","Vladimir","Volibear","Warwick","Xayah","Xerath","XinZhao","Yasuo","Yone","Yorick","Yuumi","Zac","Zed","Ziggs","Zilean","Zoe","Zyra"]

let offset_manager = 24246296;
let offset_maproot = 40;
let offset_mapnodenetid = 16;
let offset_mapnodeobject = 20;
let offset_networkid = 204;

let team1Gold = 0;
let team2Gold = 0;

let dumpID = 0;

fs.mkdir("memoryDumps/" + dumpID, () => {});

function convert(Uint8Arr, offset, length) {
    let buffer = Buffer.from(Uint8Arr);
    if (os.endianness() == "BE") {
        var result = buffer.readUIntBE(offset, length);
    } else {
        var result = buffer.readUIntLE(offset, length);
    }

    return result;
}


function decodeAscii(buffer) {
    let count = buffer.indexOf(0);
    if (count < 0) count = buffer.length;
    return buffer.toString("ascii", 0, count);
}


const process = memoryjs.openProcess("League of Legends.exe")
console.log(process);

// ger some GameManager
const mngrVal = memoryjs.readMemory(process.handle, process.modBaseAddr + offset_manager, "int32")
console.log(mngrVal);

// Some list-head kinda thing
const arr = Uint8Array.from(memoryjs.readBuffer(process.handle, mngrVal, 100))
console.log(arr);

console.log(convert(arr, offset_maproot, 4));


// Getting all mapobjects
var queue = [];
var visited = [];
let read = 0;
let objNr = 0;
let pointers = new Array(500);
queue.push(convert(arr, 40, 4));

while (queue.length > 0 && read < 500) {
    let toRead = queue.shift();
    if (!visited.includes(toRead)) {
        read++;
        visited.push(toRead);

        let buff = Uint8Array.from(memoryjs.readBuffer(process.handle, toRead, 48));
        queue.push(convert(buff, 0, 4));
        queue.push(convert(buff, 4, 4));
        queue.push(convert(buff, 8, 4));

        if (convert(buff, offset_mapnodenetid, 4) - 1073741824 <= 1048576) {
            if (convert(buff, offset_mapnodeobject, 4) != 0) {
                pointers[objNr++] = convert(buff, 20, 4);
            }
        }

    }
}

//console.log(pointers)

// Getting info about the objects
let i = 0;
while (i < objNr) {
    let buf = memoryjs.readBuffer(process.handle, pointers[i], 13824);

    let offset_id = 32;
    let offset_team = 76;
    let offset_position = 240;
    let offset_health = 3480;
    let offset_maxhealth = 3496;
    let offset_mana = 664;
    let offset_maxmana = 680;
    let offset_networkid = 204;
    let offset_name = 11196;
    let offset_currentGold = 7040;
    let offset_totalGold = 7056;
    let offset_EXP = 13108;

    let ID;
    let Team;
    let positionX;
    let positionY;
    let positionZ;
    let health;
    let maxHealth;
    let mana;
    let maxmana;
    let networkID;
    let nName;

    if (os.endianness() == "BE") {
        ID = buf.readUInt16BE(offset_id);
        Team = buf.readUInt16BE(offset_team);
        positionX = buf.readFloatBE(offset_position);
        positionY = buf.readFloatBE(offset_position + 4);
        positionZ = buf.readFloatBE(offset_position + 8);
        health = buf.readFloatBE(offset_health);
        maxHealth = buf.readFloatBE(offset_maxhealth);
        mana = buf.readFloatBE(offset_mana);
        maxmana = buf.readFloatBE(offset_maxmana);
        networkID = buf.readUInt32BE(offset_networkid);
        nName = decodeAscii(memoryjs.readBuffer(process.handle, memoryjs.readMemory(process.handle, pointers[i] + offset_name, "int32"), 50));
    } else {
        ID = buf.readUInt16LE(offset_id);
        Team = buf.readUInt16LE(offset_team);
        positionX = buf.readFloatLE(offset_position);
        positionY = buf.readFloatLE(offset_position + 4);
        positionZ = buf.readFloatLE(offset_position + 8);
        health = buf.readFloatLE(offset_health);
        maxHealth = buf.readFloatLE(offset_maxhealth);
        mana = buf.readFloatLE(offset_mana);
        maxmana = buf.readFloatLE(offset_maxmana);
        networkID = buf.readUInt32LE(offset_networkid);        
        nName = decodeAscii(memoryjs.readBuffer(process.handle, memoryjs.readMemory(process.handle, pointers[i] + offset_name, "int32"), 50));
    }

    // Checking for champ name
    if (champions.includes(nName)) {
        let cGold, tGold, EXP;

        if (os.endianness() == "BE") {
            cGold = buf.readFloatBE(offset_currentGold);
            tGold = buf.readFloatBE(offset_totalGold);
            EXP = buf.readFloatBE(offset_EXP);
        } else {
            cGold = buf.readFloatLE(offset_currentGold);
            tGold = buf.readFloatLE(offset_totalGold);
            EXP = buf.readFloatLE(offset_EXP);
        }

        console.log("==== [" + pointers[i] + "] ; [" + (pointers[i]-process.modBaseAddr) + "]");
        console.log(ID + " - " + Team + " - " + networkID + " - " + nName.replace(/[^\x00-\x7F]/g, ""));
        console.log(positionX + "|" + positionY + "|" + positionZ);
        console.log(health + "/" + maxHealth);
        console.log(mana + "/" + maxmana);
        console.log(cGold + " (" + tGold + ")");

        if (Team == 100) {
            team1Gold += tGold;
        } else {
            team2Gold += tGold;
        }

        fs.writeFile("./memoryDumps/" + dumpID + "/" + nName, JSON.stringify(Array.from(buf)), () => { });

    }

    i++;
}

console.log("Team 1 Gold: " + team1Gold);
console.log("Team 2 Gold: " + team2Gold);