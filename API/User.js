const express = require('express');
const mongoose = require('mongoose');
const User = require('../DB/User');
const route = express.Router();

route.post('/', async (req, res) => {
    const { Nickname, Password } = req.body;
    let user = {};
    user.Nickname = Nickname;
    user.Password = Password;
    let userModel = new User(user);
    await userModel.save();
    res.json(userModel);
});

module.exports = route;