const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const port = 3000;
const overlayroute = require('./overlay-route');
const fs = require('fs')
const pnbParser = require('./pnb-parser');
const aceRoute = require('./ace');

let lastPnbData = {};
let blueSide = "";
let redSide = "";

let redShort = "";
let blueShort = "";

let counter = 0;
let recordPnBData = false;

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json())
app.use(cors());

app.use("/pnb", express.static('html/pnb'));

app.use("/overlay", overlayroute);

//app.use('/ace', aceRoute);

app.post('/post-pnb-data', (req, res) => {
    let data = JSON.parse(req.body.someData);
    if (data.httpStatus != 404) {
        lastPnbData = data;
        if(recordPnBData) {
            fs.writeFile("./capture/" + counter + ".json", JSON.stringify(data), () => {
                counter++;
            });
        }
    }
    res.send("OK");
});

app.get('/get-pnb-data', (req, res) => {
    let data = {};
    try {
        data = pnbParser.createGamestate(lastPnbData);
    } catch(e) {
    }
    res.send(JSON.stringify(data));
});

app.get('/reset-pnb', (req, res) => {
    lastPnbData = {};
    res.send("OK.")
})

app.get('/teams', (req, res) => {
    try {
        if(req.query.team == "blue") {
            blueSide = req.query.name;
        } else if(req.query.team == "red") {
            redSide = req.query.name;
        }
    } catch (Exception) {
    }
    res.send(JSON.stringify({"red": redSide, "blue": blueSide}))
})

app.get('/shortteams', (req, res) => {
    try {
        if(req.query.team == "blue") {
            blueShort = req.query.name;
        } else if(req.query.team == "red") {
            redShort = req.query.name;
        }
    } catch (Exception) {
    }
    res.send(JSON.stringify({"red": redSide, "blue": blueSide}))
})

app.get('/red_teamname', (req, res) => {
    res.send(redSide);
});

app.get('/blue_teamname', (req, res) => {
    res.send(blueSide);
});

app.get('/red_shortname', (req, res) => {
    res.send(redShort);
})

app.get('/blue_shortname', (req, res) => {
    res.send(blueShort);
})

app.get('/swap-teams', (req, res) => {
    var tmp = blueSide;
    blueSide = redSide;
    redSide = tmp;
    tmp = blueShort;
    blueShort = redShort;
    redShort = tmp;
    res.send("OK.")
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});