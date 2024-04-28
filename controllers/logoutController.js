const User = require("../model/User");

const handleLogout = async (req, res) => {
    //get cookie, check if token present in cookie
    //if no token in cookie, return success status
    //if token in cookie, look up user in DB based on cookie
    //clear from cookie and user, save and return success status
};

module.exports = { handleLogout };
