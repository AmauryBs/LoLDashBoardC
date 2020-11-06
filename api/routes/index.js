const router = require('express').Router();
const controller = require('../controllers');

router.post('/summonerPage', (req, res) => {
    controller.generateHTML(req, res);
});

router.get('/update', (req, res) => {
    controller.updateAll(req, res);
});

router.get('/loadGame', (req, res) => {
    controller.loadGame(req, res);
});

router.post('/gameHistory', (req, res) => {
    controller.historyInfo(req, res);
});

router.get('/loadGame', (req, res) => {
    controller.loadGame(req, res);
});

router.get('/ChampionIdToName', (req, res) => {
    controller.ChampionIdToName(req, res);
});


router.get('/winrateChamp', (req, res) => {
    controller.winrateChamp(req, res);
});

router.get('/ServerStatus', (req, res) => {
    controller.ServerStatus(req, res);
});

router.get('/Challenger', (req, res) => {
    controller.Challenger(req, res);
});
module.exports = router;


