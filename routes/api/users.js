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


module.exports = router;