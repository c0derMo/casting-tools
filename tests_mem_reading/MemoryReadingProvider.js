const memoryjs = require('memoryjs');
const os = require('os');

// Outsorce this to external file
let Offsets = {
    GameManager: 24246296,
    MapNodeNetID: 16,
    MapNodeObject: 20,
    PlayerObject: {
        Name: 11196,
        ID: 32,
        Team: 76,
        Position: 240,
        Health: 3480,
        MaxHealth: 3496,
        Mana: 664,
        MaxMana: 680,
        NetworkID: 204,
        CurrentGold: 7040,
        TotalGold: 7056,
        EXP: 13108
    }
};

let champions = ["Aatrox","Ahri","Akali","Alistar","Amumu","Anivia","Annie","Aphelios","Ashe","AurelionSol","Azir","Bard","Blitzcrank","Brand","Braum","Caitlyn","Camille","Cassiopeia","Chogath","Corki","Darius","Diana","Draven","DrMundo","Ekko","Elise","Evelynn","Ezreal","Fiddlesticks","Fiora","Fizz","Galio","Gangplank","Garen","Gnar","Gragas","Graves","Gwen","Hecarim","Heimerdinger","Illaoi","Irelia","Ivern","Janna","JarvanIV","Jax","Jayce","Jhin","Jinx","Kaisa","Kalista","Karma","Karthus","Kassadin","Katarina","Kayle","Kayn","Kennen","Khazix","Kindred","Kled","KogMaw","Leblanc","LeeSin","Leona","Lillia","Lissandra","Lucian","Lulu","Lux","Malphite","Malzahar","Maokai","MasterYi","MissFortune","MonkeyKing","Mordekaiser","Morgana","Nami","Nasus","Nautilus","Neeko","Nidalee","Nocturne","Nunu","Olaf","Orianna","Ornn","Pantheon","Poppy","Pyke","Qiyana","Quinn","Rakan","Rammus","RekSai","Rell","Renekton","Rengar","Riven","Rumble","Ryze","Samira","Sejuani","Senna","Seraphine","Sett","Shaco","Shen","Shyvana","Singed","Sion","Sivir","Skarner","Sona","Soraka","Swain","Sylas","Syndra","TahmKench","Taliyah","Talon","Taric","Teemo","Thresh","Tristana","Trundle","Tryndamere","TwistedFate","Twitch","Udyr","Urgot","Varus","Vayne","Veigar","Velkoz","Vi","Viego","Viktor","Vladimir","Volibear","Warwick","Xayah","Xerath","XinZhao","Yasuo","Yone","Yorick","Yuumi","Zac","Zed","Ziggs","Zilean","Zoe","Zyra"];

function readFromBuffer(Uint8Arr, offset, length) {
    let buffer = Buffer.from(Uint8Arr);
    let result;
    if(os.endianness() == "BE") {
        result = buffer.readUIntBE(offset, length);
    } else {
        result = buffer.readUIntLE(offset, length);
    }
    return result;
}

function decodeAscii(buffer) {
    let count = buffer.indexOf(0);
    if (count < 0) count = buffer.length;
    return buffer.toString("ascii", 0, count);
}

class MemoryReadingProvider {
    constructor() {
        this.memoryMap = {};
        this.Offsets = Offsets;
        this.Champions = champions;
        this.process;
    }

    initialize() {
        this.checkForUpdatedProcess();
    }

    checkForUpdatedProcess() {
        let process = memoryjs.openProcess("League of Legends.exe");
        //TODO: Check if process runs at all!
        if(process.th32ProcessID !== this.process.th32ProcessID) {
            this.updatePointers(process);
        }
    }

    updatePointers(process) {
        this.process = process;
        const manager = memoryjs.readMemory(process.handle, process.modBaseAddr + this.Offsets.GameManager, "int32");
        const list1 = Uint8Array.from(memoryjs.readBuffer(process.handle, manager, 100));

        let queue = [];
        let visited = [];
        let read = 0;
        let objNr = 0;
        let pointers = new Array(500);
        queue.push(readFromBuffer(list1, 40, 4));
        while (queue.length > 0 && read < 500) {
            let toRead = queue.shift();
            if(!visited.includes(toRead)) {
                read++;
                visited.push(toRead);

                let buff = Uint8Arrray.from(memoryjs.readBuffer(process.handle, toRead, 48));
                queue.push(readFromBuffer(buff, 0, 4));
                queue.push(readFromBuffer(buff, 4, 4));
                queue.push(readFromBuffer(buff, 8, 4));

                if(readFromBuffer(buff, this.Offsets.MapNodeNetID, 4) - 1073741824 <= 1048576) {
                    if(readFromBuffer(buff, this.Offsets.MapNodeObject, 4) != 0) {
                        pointers[objNr++] = readFromBuffer(buff, 20, 4);
                    }
                }
            }
        }

        let i = 0;
        while (i < objNr) {
            let cName = decodeAscii(memoryjs.readBuffer(process.handle, memoryjs.readMemory(process.handle, pointers[i] + this.Offsets.PlayerObject.Name, "int32"), 50));
            if(this.Champions.includes(cName)) {
                this.memoryMap[cName] = pointers[i];
            }
            i++;
        }
    }

    getChampionCurrentHealth(champion) {
        this.getChampionStat(champion, "Health");
    }

    getChampionTotalGold(champion) {
        this.getChampionStat(champion, "TotalGold");
    }

    getChampionCurrentEXP(champion) {
        this.getChampionStat(champion, "EXP");
    }

    getChampionStat(champion, stat) {
        this.checkForUpdatedProcess();
        if(this.memoryMap[champion] == undefined) {
            return -1;
        }
        let pointer = this.memoryMap[champion];
        switch(stat) {
            case "ID":
                return memoryjs.readMemory(this.process.handle, pointer + this.Offsets.PlayerObject.ID, "int");
            case "Team":
                return memoryjs.readMemory(this.process.handle, pointer + this.Offsets.PlayerObject.Team, "int");
            case "PosX":
                return memoryjs.readMemory(this.process.handle, pointer + this.Offsets.PlayerObject.Position, "float");
            case "PosY":
                return memoryjs.readMemory(this.process.handle, pointer + this.Offsets.PlayerObject.Position + 4, "float");
            case "PosZ":
                return memoryjs.readMemory(this.process.handle, pointer + this.Offsets.PlayerObject.Position + 8, "float");
            case "Health":
                return memoryjs.readMemory(this.process.handle, pointer + this.Offsets.PlayerObject.Health, "float");
            case "MaxHealth":
                return memoryjs.readMemory(this.process.handle, pointer + this.Offsets.PlayerObject.MaxHealth, "float");
            case "Mana":
                return memoryjs.readMemory(this.process.handle, pointer + this.Offsets.PlayerObject.Mana, "float");
            case "MaxMana":
                return memoryjs.readMemory(this.process.handle, pointer + this.Offsets.PlayerObject.MaxMana, "float");
            case "NetworkID":
                return memoryjs.readMemory(this.process.handle, pointer + this.Offsets.PlayerObject.NetworkID, "float");
            case "CurrentGold":
                return memoryjs.readMemory(this.process.handle, pointer + this.Offsets.PlayerObject.CurrentGold, "float");
            case "TotalGold":
                return memoryjs.readMemory(this.process.handle, pointer + this.Offsets.PlayerObject.TotalGold, "float");
            case "EXP":
                return memoryjs.readMemory(this.process.handle, pointer + this.Offsets.PlayerObject.EXP, "float");
            default:
                return -1
        }
    }

    getTeamTotalGold(team) {
        let amount = 0;
        Object.keys(this.memoryMap).forEach(e => {
            if(this.getChampionStat(e, "Team") == team) {
                amount += this.getChampionTotalGold(e);
            }
        });
        return amount;
    }

    getAllStats() {
        let result = {};
        Object.keys(this.memoryMap).forEach(e => {
            result[e] = {
                Team: this.getChampionStat(e, "Team"),
                Health: this.getChampionStat(e, "Health"),
                TotalGold: this.getChampionStat(e, "TotalGold"),
                EXP: this.getChampionStat(e, "EXP"),
            }
        });
        return result;
    }
}

module.exports = MemoryReadingProvider;