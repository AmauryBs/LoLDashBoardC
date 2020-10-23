const router = require('express').Router();
const controller = require('../controllers');

router.post('/summonerPage', (req, res) => {
    controller.generateHTML(req, res);
});

router.get('/gameHistory', (req, res) => {
    controller.historyInsert(req, res);
});

router.get('/loadGame', (req, res) => {
    controller.loadGame(req, res);
});

router.get('/winrateChamp', (req, res) => {
    controller.winrateChamp(req, res);
});


module.exports = router;


