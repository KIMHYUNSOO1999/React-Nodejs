/*
  Config
*/

const jwt = require('jsonwebtoken');

/*
  Local
*/
const JWT_SECRET = process.env.JWT_SECRET;

/*
    Function AuthToken

    - 쿠키<->JWT 간 일치/불일치 확인

*/

function AuthToken(req, res, next) {
  
const token = req.cookies.authToken;

  try {

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; 
    next();

  } 
  catch (err) {
    
    return res.status(401).json({ success : false, msg: '만료된 토큰' });

  }
}

module.exports = AuthToken;
