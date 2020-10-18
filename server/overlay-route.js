const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const ldParser = require('./live-data-parser');

router.use("/", express.static("html/overlay"));

router.use(bodyParser.urlencoded({extended: false}));
router.use(bodyParser.json())

let playerdata = {};
let eventdata = {};
let gamedata = {};

let drakeType = "Infernal";
let drakeTimer = 300;

router.get("/playerdata", (req, res) => {
    res.send(JSON.stringify(playerdata));
});

router.post("/playerdata", (req, res) => {
    let data = JSON.parse(req.body.playerdata);
    playerdata = data;
    res.send("OK")
});

router.get("/eventdata", (req, res) => {
    res.send(JSON.stringify(eventdata));
});

router.post("/eventdata", (req, res) => {
    let data = JSON.parse(req.body.eventdata);
    if(typeof data == "string") {
         eventdata = data;   
    }
    res.send("OK")
});

router.get("/gamedata", (req, res) => {
    res.send(JSON.stringify(gamedata));
});

router.post("/gamedata", (req, res) => {
    let data = JSON.parse(req.body.gamedata);
    gamedata = data;
    res.send("OK")
});

router.get("/combineddata", (req, res) => {
    let data = {};
    try {
        data = ldParser.parseLiveData(playerdata, eventdata, gamedata, {"drakeType":drakeType,"drakeTimer":drakeTimer});
    } catch(e) {
    }
    res.send(JSON.stringify(data));
});

router.get("/draketype", (req, res) => {
    drakeType = req.query.type;
    res.send("OK")
});

router.get("/draketimer", (req, res) => {
    drakeTimer = req.query.type;
    res.send("OK")
});

module.exports = router;