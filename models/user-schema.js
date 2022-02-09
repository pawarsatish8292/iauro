const Sequelize = require('sequelize');
const Users = sequelize.define('user', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    name: {
        type: Sequelize.STRING,
        allowNull: true
    },
    mobile: {
        type: Sequelize.FLOAT,
        allowNull: false
    },
    email: {
        type: Sequelize.STRING,
        allowNull: false
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: Sequelize.NOW
    },
    user_type: {
        type: Sequelize.ENUM,
        allowNull: false,
        values: ['admin', 'user']
    },
    status: {
        type: Sequelize.ENUM,
        allowNull: false,
        values: ['active', 'inactive']
    },
    createdAt: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: Sequelize.NOW
    },
}, {
    freezeTableName: true,
    timestamps: false
});
Users.sync({ alter: true })
module.exports.findByEmail = (email, callback) => {
    Users.findOne({ where: { email } }).then((response) => {
        callback(null, response)
    }).catch((err) => {
        if (err) {
            callback(err, null)
        }
    })
}
module.exports.findByUserType = (user_type, callback) => {
    Users.findOne({ where: { user_type } }).then((response) => {
        callback(null, response)
    }).catch((err) => {
        if (err) {
            callback(err, null)
        }
    })
}
module.exports.findByUserId = (id, callback) => {
    Users.findOne({ where: { id } }).then((response) => {
        callback(null, response)
    }).catch((err) => {
        if (err) {
            callback(err, null)
        }
    })
}

module.exports.findByEmailAndPassword = (email, password, callback) => {
    Users.findOne({ where: { email, password } }).then((response) => {
        callback(null, response)
    }).catch((err) => {
        if (err) {
            callback(err, null)
        }
    })
}

module.exports.addNew = (data, callback) => {
    Users.create(data).then((response) => {
        callback(null, response)
    }).catch((err) => {
        if (err) {
            callback(err, null)
        }
    })
}
module.exports.updatOne = (data, callback) => {
    Users.update({ name: data.name, email: data.email, password: data.password }, { where: { id: data.user_id } }).then((response) =>
        callback(null, response)).catch((err) =>
            callback(err, null))
}
module.exports.userDeleted = (id, callback) => {
    Users.destroy({ where: { id: id } }).then((response) => {
        callback(null, response)
    }).catch((err) => {
        callback(err, null)
    })
}