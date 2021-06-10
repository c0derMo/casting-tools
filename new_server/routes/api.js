const express = require('express');
const router = express.Router();
const auth = require('../lib/auth');

const pnbRoute = require('./pnb');

router.use('/:apikey/*', function(req, res, next) {
    let apiKey = req.params.apikey;
    if(auth.checkApiKey(apiKey)) {
        next();
    } else {
        res.sendStatus(403);
    }
});

router.get('/:apikey/status', (req, res) => {
    res.send("KEY OK");
});

router.use('/:apikey/pnb', pnbRoute);

module.exports = router;