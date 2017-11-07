const _ = require('lodash');

const parseCookies = (req, res, next) => {
  let cookies = req.headers.cookie;
  let cookieHolder = {};
  if ( !(_.isEmpty(cookies)) ) {
    let cookieArr = cookies.split('; ');
    cookieArr.forEach( (cookie) => {
      let keyValue = cookie.split('=');
      cookieHolder[keyValue[0]] = keyValue[1];
    });
  }
  req.cookies = cookieHolder;
  next();
};

module.exports = parseCookies;