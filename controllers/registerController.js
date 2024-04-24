const User = require("../model/User");
const bcrypt = require("bcrypt");

const handleNewUser = async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        //check for required present fields
        res.status(400).json({ "error": "username and password fields are required" });
    }

    //check for duplicates
    const duplicate = await User.findOne({ username: username }).exec();

    if (duplicate) {
        return res.sendStatus(409);
    }
    //create bcrypt object
    try {
        //encrypt password
        const hashedPwd = await bcrypt.hash(password, 10);

        //mongoose can create and store all at once
        const result = await User.create({
            "username": username,
            "password": hashedPwd
        });

        res.status(201).json({ "username": username });
    } catch (error) {
        res.status(500).json({ "message": error.message });
    }
};

module.exports = { handleNewUser };
