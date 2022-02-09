const Sequelize = require('sequelize');
const Product = sequelize.define('product', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    product_name: {
        type: Sequelize.STRING,
        allowNull: true
    },
    price: {
        type: Sequelize.FLOAT,
        allowNull: false
    },
    quantity: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    user_id: {
        type: Sequelize.INTEGER,
        allowNull: false
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
    updatedAt: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: Sequelize.NOW
    },
}, {
    freezeTableName: true,
    timestamps: false
});
Product.sync({ alter: true })
module.exports.findByName = (product_name, callback) => {
    Product.findOne({ where: { product_name } }).then((response) => {
        callback(null, response)
    }).catch((err) => {
        if (err) {
            callback(err, null)
        }
    })
}
module.exports.findById = (id, callback) => {
    Product.findOne({ where: { id } }).then((response) => {
        callback(null, response)
    }).catch((err) => {
        if (err) {
            callback(err, null)
        }
    })
}

module.exports.addNew = (data, callback) => {
    Product.create(data).then((response) => {
        callback(null, response)
    }).catch((err) => {
        if (err) {
            callback(err, null)
        }
    })
}
module.exports.updatOne = (data, callback) => {
    console.log(data);
    Product.update({ product_name: data.product_name, price: data.price, quantity: data.quantity }, { where: { id: data.id } }).then((response) =>
        callback(null, response)).catch((err) =>
            callback(err, null))
}
module.exports.productDeleted = (id, callback) => {
    Product.destroy({ where: { id: id } }).then((response) => {
        callback(null, response)
    }).catch((err) => {
        callback(err, null)
    })
}
module.exports.updatByStatus = (data, callback) => {
    console.log(data);
    Product.update({ status: data.status }, { where: { id: data.product_id } }).then((response) =>
        callback(null, response)).catch((err) =>
            callback(err, null))
}