const express = require('express');
const router = express.Router();

router.use("/", express.static("html/overlay"));

let playerdata = {};
let eventdata = {};
let gamedata = {};

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
    eventdata = data;
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

module.exports = router;