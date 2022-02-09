'use strict';
const Users = require('../models/user-schema.js');
const CheckUsersTypes = (user_type, callback) => {
    if (user_type == 'user') return callback(null, true);
    Users.findByUserType(user_type, (userErr, userRes) => {
        if (userRes) return callback(userRes, null);
        return callback(null, true)
    })
}

module.exports = {
    CheckUsersTypes,
}
