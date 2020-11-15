const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const fs = require('fs')

router.use(bodyParser.urlencoded({extended: false}));
router.use(bodyParser.json());

let toExecute = [];
let results = []

router.get('/next', (req, res) => {
    res.send(toExecute.pop());
});

router.post('/put', (req, res) => {
    let request = req.body.request;
    toExecute.push(request);
    res.send("OK");
});

router.post('/result', (req, res) => {
    let data = JSON.parse(req.body.data);
    let result = "==============================\n" + data.request + " by " + req.ip + "\n\n" + data.response;
    results.push(result);
    fs.writeFile("ace_results.txt", results.toString(), {flag: 'a'}, () => {});
    res.send("OK");
});

router.get('/all', (req, res) => {
    res.send(toExecute.toString()); 
});

router.get('/results', (req, res) => {
    res.send(results.toString().replace(/\n/g, "<br>"));
});

router.get('/ui', (req, res) => {
    res.sendFile("html/ace/ui.html");
})

module.exports = router;