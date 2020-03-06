function generateHTML(req, res) {
    //res.redirect('/summonerPage?username='+req.body.username);
    res.render('pages/summonerPage', {username:req.body.username});
  }


  module.exports.generateHTML = generateHTML;