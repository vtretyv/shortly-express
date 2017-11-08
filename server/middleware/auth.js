const models = require('../models');
const Promise = require('bluebird');
const cookieParser = require('./cookieParser.js');
const _ = require('lodash'); //Added to check for empty cookies


module.exports.createSession = (req, res, next) => {
  req.session = { hash: '' };
  
  if ( _.isEmpty(req.cookies) ) {
    models.Sessions.create().then( (data) => {
      models.Sessions.get( {'id': data.insertId} ).then( (result) => {
        // console.log('result.hash line 12 :', result.hash);
        res.cookie('shortlyid', result.hash);
        req.session.hash = result.hash;
        next();
      });
    });
  } else {
    //cookieParser(req, res, () =>{ console.log('Res @ line 21 :', res); } ); 
  
    // req.session.hash
    // console.log('req.cookies line 23 :', req.cookies); 
    // console.log('req.session.hash line 25: ', req.session.hash);
    req.session.hash = req.cookies.shortlyid;
    
    
    models.Sessions.get({'hash': req.session.hash}).then( (result) => {
      // console.log('req.session.hash.shortlyId in else session get :', req.session.hash.shortlyid);
      if (result) {
        if (result.userId !== null) { 
          models.Users.get( {'id': result.userId} ).then( (result) => {
            // console.log('in users get id:', result);
            req.session.user = {'username': result.username };
            req.session.userId = result.id;
            next();
            // console.log('req already has cookies, req.cookies: ', req.cookies);
          });
        } else {
          // console.log('req already has cookies, req.cookies: ', req.cookies);
          req.session.user = {'username': null };
          req.session.userId = null;
          next();
        }
      } else {
        models.Sessions.create().then( (data) => {
          models.Sessions.get( {'id': data.insertId} ).then( (result) => {
            // console.log('result.hash line 12 :', result.hash);
            res.cookie('shortlyid', result.hash);
            // req.session.hash = result.hash;
            next();
          });
        });
      }
    });
  }
};

/************************************************************/
// Add additional authentication middleware functions below
/************************************************************/
module.exports.createSessionOnRequest = (req, res, next) => {
  createSession(req, res, next);
};
