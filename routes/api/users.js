const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
// (1): require user Model
const User = require('../../models/Users');
const jwt = require('jsonwebtoken');
const config = require('config');

const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');

// @route POST api/users
// @desc Register user
// @access Public

router.post('/', [
  // .not().is Empty => validation!
  check('name', 'Nama harus di isi').not().isEmpty(),
  check('email', 'Isi dengan valid email').isEmail(),
  check('password', 'Isi password minimal 6 atau lebih karakter').isLength({min: 6})],

  // (2): menggunakan promise async/await
  async (req, res) => {
    // handle request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {return res.status(400).json({ errors: errors.array() });
  }

  // (3): membuat variable menggunakan destructure
  const { name, email, password } = req.body;

  // (4): membuat try catch
  try {
    let user = await User.findOne({ email });
    // user exis
    if (user) {
      return res.status(400).json({ error: [{ msg: "User email sudah terdaftar" }] });
    }
    
    // Get users gravatar
    const avatar = gravatar.url(email, {
      s:'200',
      r: 'pg',
      d: 'mm'
    })

    user = new User({
      name,
      email,
      avatar,
      password
    });
    // Encrypt password dengan bcrypt
    // membuat format hash dengan "salt"
    const salt = await bcrypt.genSalt(10);
    
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    // Return jsonwebtoken

    //res.send('User route')

    // Return jsonwebtoken
    const payload = {
      user: {
        id: user.id
    }
  };

  jwt.sign( 
    payload, 
    config.get('jwtSecret'),
    { expiresIn: 360000 },
  (err, token) => {
    if (err) throw err;
    res.json({ token });
  }
  );


  } catch(err) {
    console.error(err.message);
    res.status(500).send("server error")
  }

});

// export route
module.exports = router;