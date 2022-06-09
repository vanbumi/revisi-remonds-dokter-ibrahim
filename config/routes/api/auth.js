const express = require('express');
const router = express.Router();

// @route GET api/auth
// @desc Test route
// @access Public atau Private

router.get('/', (req,res) => res.send('Auth route'));


// export route
module.exports = router;