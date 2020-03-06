function generateHTML(req, res) {
    res.redirect('/summonerPage?username='+req.body.username);
  }


  module.exports.generateHTML = generateHTML;