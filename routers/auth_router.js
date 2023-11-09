const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
// model
const { User } = require('../models');

const create_hash = (async (password, saltAround) => {
    let hashed = bcrypt.hashSync(password, saltAround);
    console.log(`${password} : ${hashed}`);
    return hashed;
});

router.post('/member', async (req, res) => {
    const new_user = req.body;
    new_user.password = await create_hash(new_user.password, 10);

    try {
        const result = await User.create(new_user);
        res.status(201).send({ success: true, result: result });
    } catch(error) {
        res.status(500).send({ success: false, message: error.message });
    }

});

module.exports = router;