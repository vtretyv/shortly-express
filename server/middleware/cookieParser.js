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
  // for (var key in cookieHolder) {
  //   res.cookie(key, cookieHolder[key]);
  // }
  // res.cookie(keyValue[0], keyValue[1]);
  next();
};

module.exports = parseCookies;