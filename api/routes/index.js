const router = require('express').Router();
const controller = require('../controllers');

router.post('/summonerPage', (req, res) => {
    controller.generateHTML(req, res);
});

router.get('/gameHistory', (req, res) => {
    controller.historyInfo(req, res);
});

router.get('/winrateChamp', (req, res) => {
    controller.winrateChamp(req, res);
});


module.exports = router;


