const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const {check, validationResult} = require ('express-validator');

const Profile = require('../../models/Profile');
const User = require('../../models/Users');

const request = require('request');
const config = require('config');
const { compareSync } = require('bcryptjs');

// @routeGET api/profile/me
// @descTest get current users profile
// @access Private

router.get('/me',auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id }).populate ('user', ['name', 'avatar']);

    if (!profile) {
      return res.status(400).json({ msg: 'Tidak ada profile untuk user ini' });
    }

    res.json(profile);

  } catch(err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route  Post api/profile/me
// @desc   Create or Update users profile
// @access Private

router.post('/', [
  auth, 
  [
  check('status', 'Status is required')
    .not()
    .notEmpty(),
  ] 
                ], 
async (req,res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const {
    company,
    website,
    location,
    bio,
    status,
    githubusername,
    skills,
    youtube,
    facebook,
    twitter,
    instagram,
    linkedln
        } = req.body;

    //build profile object
    const profileFields = {};
    profileFields.user = req.user.id;

    if (company) profileFields.company = company;
    if (website) profileFields.website = website;
    if (location) profileFields.location = location;
    if (bio) profileFields.bio = bio;
    if (status) profileFields.status = status;
    if (githubusername) profileFields.githubusername = githubusername;
    if (skills) {profileFields.skills=skills.split(',').map(skill=>skill.trim());    }
    //console.log(profileFields.skills);
    //res.send(profileFields.skills);

    // build social object
    profileFields.social = {}
    if (youtube) profileFields.social.youtube = youtube;
    if (twitter) profileFields.social.twitter = twitter;
    if (facebook) profileFields.social.facebook = facebook;
    if (linkedln) profileFields.social.linkedln = linkedln;
    if (instagram) profileFields.social.instagram = instagram;

    try {
        let profile = await Profile.findOne({ user: req.user.id });

        if (profile) {
          // update profile
          profile = await Profile.findOneAndUpdate(
            { user: req.user.id},
            { $set: profileFields },
            { new: true}
          );

          return res.json(profile);
        }

        // create profile
        profile = new Profile(profileFields);

        await profile.save();
        res.json(profile);

    } catch(err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }

});

// @route  Get api/profile
// @desc   Get all profiles
// @access Private

router.get('/', async(req, res) => {
  try {
    const profiles = await Profile.find().populate('user', ['name', 'avatar']);
    res.json(profiles);
  } catch (err) {
    console.err(err.message);
    res.status(500).send('Server Error');
  }
});

// @route  Get api/profile/user/user_id
// @desc profile by user ID
// @access Public

router.get('/user/:user_id', async (req, res) => {
  try {
    const profile = await Profile.find({ user: req.params.user_id}).populate('user', ['name',  'avatar']);

    if (!profile) return res.status(400).json({msg: 'Profile tidak ditemukan'});

    res.json(profile);

  } catch (err) {
    //console.err(err.message);

    if (err.kind == 'ObjectId') {
      return res.status(400).json({msg: 'Profile tidak ditemukan'});
    };
    res.status(500).send('Server Error');
  }
});

// @route  DELETE api/profile
// @desc   Delete profile, user dan posts
// @access Private

router.delete('/', auth, async(req, res) => {
  try {
    //Remove profile
    await Profile.findOneAndRemove({ user: req.user.id });

    //Remove user
    await Profile.findOneAndRemove({ _id: req.user.id });

    res.json({msg: 'User berhasil dihapus'});
  } catch (err) {
    console.err(err.message);
    res.status(500).send('Server Error');
  }
});

// @route  PUT api/profile/experience
// @desc   Add profile user dan experience
// @access Private

router.put(
  '/experience',
  [ 
    auth,
    [
      check('title', 'Title is required')
        .not()
        .isEmpty(),
      check('company', 'Company is required')
        .not()
        .isEmpty(),
      check('from', 'From date is required')
        .not()
        .isEmpty(),
    ] 
  ],
    async (req,res) => {
      const errors = validationResult(req);
      if(!errors.isEmpty()) {
return res.status(400).json({ errors: errors.array() });
      }
      
      // destructuring
      const {
        title,
        company,
        location,
        from,
        to,
        current,
        description
      } = req.body;

      const newExp = {
        title,
        company,
        location,
        from,
        to,
        current,
        description
      }

      try {
        const profile = await Profile.findOne({ user: req.user.id });
        profile.experience.unshift(newExp);
        await profile.save();
        res.json(profile);Ba
      } catch (err) {
          console.error(err.message);
          res.status(500).send('Server Error')
      }
    }
);

// @route  Delete api/profile/exp_id
// @desc   Delete experience
// @access Private

router.delete('/experience/:exp_id', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });

    //Get removeIndex
    const removeIndex = profile.experience.map(item => item.id)
    .indexOf(req.params.exp_id);

    profile.experience.splice(removeIndex, 1);

    await profile.save();

    res.json(profile);

  } catch (err) {
    console.err(err.message);
    res.send.status(500).send('Server Error');
  }
})

// @route  PUT api/profile/education
// @desc   Add profile user dan education
// @access Private

router.put(
  '/education',
  [ 
    auth,
    [
      check('school', 'School is required')
        .not()
        .isEmpty(),
      check('degree', 'Degree is required')
        .not()
        .isEmpty(),
      check('fieldofstudy', 'Field of study is required')
      .not()
      .isEmpty(),  
      check('from', 'From date is required')
        .not()
        .isEmpty(),
    ] 
  ],
    async (req,res) => {
      const errors = validationResult(req);
      if(!errors.isEmpty()) {
return res.status(400).json({ errors: errors.array() });
      }
      
      // destructuring
      const {
        school,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description
      } = req.body;

      const newEdu = {
        school,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description
      }

      try {
        const profile = await Profile.findOne({ user: req.user.id });
        profile.education.unshift(newEdu);
        await profile.save();
        res.json(profile);Ba
      } catch (err) {
          console.error(err.message);
          res.status(500).send('Server Error')
      }
    }
);

// @route  Delete api/profile/edu_id
// @desc   Delete education
// @access Private

router.delete('/education/:edu_id', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });

    //Get removeIndex
    const removeIndex = profile.experience.map(item => item.id)
    .indexOf(req.params.exp_id);

    profile.education.splice(removeIndex, 1);

    await profile.save();

    res.json(profile);

  } catch (err) {
    console.err(err.message);
    res.send.status(500).send('Server Error');
  }
})

// @route  GET api/profile/github/:username
// @desc   GET user repo from Github.com
// @access Private

router.get('/github/:username', (req, res) => {
  try {
    const option = {
      uri: `https://api.github.com/users/${req.params.username}/repos?per_page=5&sort=created:asc&client_id=${config.get('githubClientId')}&client_secret=${config.get('githubSecret')}`,
      method: 'GET',
      headers: {'user-agent': 'node.js'}
    };

    request(option, (error, response, body) => {
      if(error) console.error(error);

      if(response.statusCode !== 200) {
        return res.status(404).json({ msg: 'No Github profile found' });
      }

      res.json(JSON.parse(body));
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// export route
module.exports = router;