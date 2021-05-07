const express = require('express');
const router = express.Router();
const {
    check,
    validationResult
} = require('express-validator');

const User = require('../../models/User');
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');

//@route  POST api/user
//@desc   Authenticate user & get token
//@access Public
// router.get('/', function (req, res) {
//     res.send('About this wiki');
// })
router.post('/',
    [check('name', 'Name is required').not().isEmpty(),
        check('email', 'Please include email').isEmail(),
        check('password', 'Password has to be atleast 6 chars').isLength({
            min: 6
        })
    ], async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array()
            });
        }
        const {
            name,
            email,
            password
        } = req.body;
        console.log(password);
        try {
            //check if user exists
            let user = await User.findOne({
                email
            });
            if (user) {
                return res.status(400).json({
                    errors: [{
                        msg: 'User already exists'
                    }]
                });
            }

            const avatar = gravatar.url(email, {
                s: '200',
                r: 'pg',
                d: 'mm'
            });

            user = new User({
                name,
                email,
                avatar,
                password
            });

            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);

            await user.save()

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