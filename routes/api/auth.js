const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const User = require('../../models/User');
const config = require('config');
const brcypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const {
    check,
    validationResult
} = require('express-validator');

// //@route  GET api/auth
// //@desc   Test route
// //@access Public
// router.get('/', auth, async (req, res) => {
//     try {
//         console.log(req.user.id);
//         const user = await User.findById(req.user.id).select('-password');

//         console.log(user.name);
//         // console.log(user);
//         res.json(user);
//     } catch (err) {
//         console.error(err.message);
//         res.status(500).json({
//             msg: 'server error'
//         });
//     }
// });

//@route  POST api/auth
//@desc   Authenticate user & get token
//@access Public
// router.get('/', function (req, res) {
//     res.send('About this wiki');
// })
router.post('/',
    [check('email', 'Please include email').isEmail(),
        check('password', 'Password is required').exists()
    ], async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array()
            });
        }
        const {
            email,
            password
        } = req.body;
        try {
            //check if user exists
            let user = await User.findOne({
                email
            });
            if (!user) {
                return res.status(400).json({
                    errors: [{
                        msg: 'Invalid credentials'
                    }]
                });
            }

            const isMatch = await brcypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({
                    errors: [{
                        msg: 'Invalid credentials'
                    }]
                });
            }
            const payload = {
                user: {
                    id: user.id
                }
            }

            jwt.sign(
                payload,
                config.get('jwtSecret'), {
                    expiresIn: 36000
                },
                (err, token) => {
                    if (err) {
                        throw err;
                    }
                    res.json({
                        token
                    });
                }
            );
        } catch (err) {
            console.error(err);
            res.status(500).send('server error');
        }
    });

module.exports = router;