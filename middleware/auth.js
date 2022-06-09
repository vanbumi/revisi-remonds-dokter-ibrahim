const jwt = require('jsonwebtoken');
const config = require('config');

module.exports=function(req, res, next) {
  // get token dari header
  const token = req.header('x-auth-token');

  // cek jika token tidak tersedia
  if (!token) {
    return res.status(401).json({ msg: 'Anda tidak memiliki token, authorisasi ditolak!' })
  }

  // verify token (decoded token)
  try {
    const decoded = jwt.verify(token, config.get('jwtSecret'));

    req.user = decoded.user;
    next();
  }
  catch (err) {
    res.status(401).json({ msg: 'Token anda tidak valid' })
  }
};