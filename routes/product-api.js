const bodyParser = require('body-parser');
const Product = require('../models/product-schema.js');
const { check, validationResult } = require('express-validator');
const Users = require('../models/user-schema.js');
module.exports = (app, connection) => {
    app.use(bodyParser.json());
    app.get('/api/product', (req, res) => {
        let query = `SELECT p.id as product_id,p.product_name,p.price,p.quantity,p.createdAt as product_created,p.updatedAt as product_updated,p.status as product_status FROM product p where p.status='active' order by p.id desc`;
        connection.query(query).then(function (resp) {
            if (resp[0].length === 0) return res.status(400).json({ message: "No Record fund" });
            return res.send({ data: resp[0], message: 'product loaded sucessfully' });
        });
    });
    app.post('/api/product',
        check('product_name').notEmpty().withMessage('product_name is requried'),
        check('price').notEmpty().withMessage('price is required').isLength({ min: 1, max: 30 }).withMessage('Please enter valid price').isNumeric().withMessage('price should be numeric'),
        check('quantity').notEmpty().withMessage('quantity is required').isLength({ min: 1, max: 30 }).withMessage('Please enter valid quantity').isNumeric().withMessage('quantity should be numeric')
        , (req, res) => {
            const user_id = req.headers.user_id;
            const errors = validationResult(req);
            const reqData = req.body;
            if (!errors.isEmpty())
                return res.status(400).json({ message: errors.errors[0]["msg"] });
            if (!user_id) return res.status(400).json({ message: "Empty header body" });
            Users.findByUserId(user_id, (UserError, UserRespone) => {
                if (UserError || !UserRespone) return res.status(400).json({ message: "User does not exist" });
                if (UserRespone.status !== 'active') return res.status(400).json({ message: "Your account is inactive" });
                Product.findByName(req.body.product_name, (duplicateerro, duplicate) => {
                    if (duplicateerro || duplicate) return res.status(400).json({ message: "This product already exist" });
                    reqData.user_id = user_id;
                    reqData.status = 'active';
                    Product.addNew(reqData, (err, response) => {
                        if (err || !response) return res.status(400).json({ message: "Error while adding the product" });
                        return res.status(200).json({ message: "product added sucessfully" });
                    })
                });
            });
        });


    app.put('/api/product',
        check('product_name').notEmpty().withMessage('product_name is requried'),
        check('price').notEmpty().withMessage('price is required').isLength({ min: 1, max: 30 }).withMessage('Please enter valid price').isNumeric().withMessage('price should be numeric'),
        check('quantity').notEmpty().withMessage('quantity is required').isLength({ min: 1, max: 30 }).withMessage('Please enter valid quantity').isNumeric().withMessage('quantity should be numeric'),
        check('id').notEmpty().withMessage('product id is requried')
        , (req, res) => {
            const errors = validationResult(req);
            const reqData = req.body;
            if (!errors.isEmpty())
                return res.status(400).json({ message: errors.errors[0]["msg"] });
            let query1 = `SELECT *FROM product WHERE id<>'${reqData.id}' and product_name='${reqData.product_name}'`;
            const admin_id = req.headers.admin_id;
            if (!admin_id) return res.status(400).json({ message: "Empty header body" });
            Users.findByUserId(admin_id, (adminError, adminresponse) => {
                if (adminError || !adminresponse) return res.status(400).json({ message: "User id does not exist" });
                if (adminresponse.user_type != 'admin') return res.status(400).json({ message: "product details update only admin users" });
                connection.query(query1).then(function (response) {
                    if (response[0].length !== 0) return res.status(400).json({ message: "This product name already exist" });
                    Product.updatOne(req.body, (err, response) => {
                        if (err || !response) return res.status(400).json({ message: "error while updating record" });
                        return res.status(200).json({ message: "product updated sucessfully" });
                    })
                });
            });
        });
    app.delete('/api/product/:_id', (req, res) => {
        const admin_id = req.headers.admin_id;
        Users.findByUserId(admin_id, (adminError, adminresponse) => {
            if (adminError || !adminresponse) return res.status(400).json({ message: "Error while checking the admin users" });
            if (adminresponse.user_type != 'admin') return res.status(400).json({ message: "only admin users can be deleted users information" });
            Product.findById(req.params._id, (userError, userResponse) => {
                if (userError || !userResponse) return res.status(400).json({ message: "product id does not exist" });
                Product.productDeleted(req.params._id, (ErrorDeleted, ResponseDeleted) => {
                    if (ErrorDeleted || !ResponseDeleted) return res.status(400).json({ message: "Error while deleting product" });
                    res.send({ message: "Product deleted successfully" });
                });
            });
        });
    });

    app.put('/api/product_enable_disable',
        check('status').notEmpty().withMessage('status is required').matches(/^(active|inactive*)$/).withMessage('Please enter product status active/inactive'),
        check('product_id').notEmpty().withMessage("product_id is required"),
        (req, res) => {
            const admin_id = req.headers.admin_id;
            const errors = validationResult(req);
            if (!errors.isEmpty())
                return res.status(400).json({ message: errors.errors[0]["msg"] });
            if (!admin_id) return res.status(400).json({ message: "Empty header body" });
            Users.findByUserId(admin_id, (adminError, adminresponse) => {
                if (adminError || !adminresponse) return res.status(400).json({ message: "user does not exist" });
                if (adminresponse.user_type != 'admin') return res.status(400).json({ message: "only admin users can be active or inactive product status" });
                Product.findById(req.body.product_id, (userError, userResponse) => {
                    if (userError || !userResponse) return res.status(400).json({ message: "product id does not exist" });
                    Product.updatByStatus(req.body, (ErrorDeleted, ResponseUpdated) => {
                        if (ErrorDeleted) return res.status(400).json({ message: "Error while updating status product" });
                        res.send({ message: `Product status ${req.body.status} successfully` });
                    });
                });
            });
        });
}