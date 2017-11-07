const express = require('express');
const path = require('path');
const utils = require('./lib/hashUtils');
const partials = require('express-partials');
const bodyParser = require('body-parser');
const Auth = require('./middleware/auth');
const models = require('./models');

const app = express();

app.set('views', `${__dirname}/views`);
app.set('view engine', 'ejs');
app.use(partials());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));



app.get('/', 
(req, res) => {
  res.render('index');
});

app.get('/create', 
(req, res) => {
  res.render('index');
});

app.get('/links', 
(req, res, next) => {
  models.Links.getAll()
    .then(links => {
      res.status(200).send(links);
    })
    .error(error => {
      res.status(500).send(error);
    });
});

app.post('/links', 
(req, res, next) => {
  var url = req.body.url;
  if (!models.Links.isValidUrl(url)) {
    // send back a 404 if link is not valid
    return res.sendStatus(404);
  }

  return models.Links.get({ url })
    .then(link => {
      if (link) {
        throw link;
      }
      return models.Links.getUrlTitle(url);
    })
    .then(title => {
      return models.Links.create({
        url: url,
        title: title,
        baseUrl: req.headers.origin
      });
    })
    .then(results => {
      return models.Links.get({ id: results.insertId });
    })
    .then(link => {
      throw link;
    })
    .error(error => {
      res.status(500).send(error);
    })
    .catch(link => {
      res.status(200).send(link);
    });
});

//Set up table models

app.get('/login', 
(req, res, next) => {
//Check cookies to see if the account is already created
  if (req.cookies) {
  
  }
//If account is not created, redirect to the signup page
//res.redirect(301, '/signup');
});

app.get('/signup', 
(req, res, next) => {
//Creates cookies and attach to res.set_cookies
//Once account is created, redirect to login
//res.redirect(301, '/login');
});

app.post('/signup', 
(req, res, next) => {
  // if ( req.cookies('sessionID') ) {
  //   res.redirect(301, '/');
  // }
  let user = req.body.username;
  let pass = req.body.password;
  console.log('user :', user, '        ');
  console.log('pass :', pass, '        ');
  models.Users.create(user, pass).then( (err, data) => { 
    if (err) {
      res.redirect(301, '/signup');
      return;
    }
    res.redirect(301, '/');
  }); 
  // models.Sessions.create().then( session => { 
  //   console.log('session:', session); 
  //   // res.cookie('sessionID', session.hash);
  // });
  // res.cookie('username', user);
  // res.cookie('password', passHash);
  // console.log('req.cookies :', req.cookie);
  // console.log('res.cookies :', res.cookie);
//Creates cookies and attach to res.set_cookies
//Once account is created, redirect to login

});
/************************************************************/
// Write your authentication routes here
/************************************************************/



/************************************************************/
// Handle the code parameter route last - if all other routes fail
// assume the route is a short code and try and handle it here.
// If the short-code doesn't exist, send the user to '/'
/************************************************************/

app.get('/:code', (req, res, next) => {

  return models.Links.get({ code: req.params.code })
    .tap(link => {

      if (!link) {
        throw new Error('Link does not exist');
      }
      return models.Clicks.create({ linkId: link.id });
    })
    .tap(link => {
      return models.Links.update(link, { visits: link.visits + 1 });
    })
    .then(({ url }) => {
      res.redirect(url);
    })
    .error(error => {
      res.status(500).send(error);
    })
    .catch(() => {
      res.redirect('/');
    });
});

module.exports = app;
