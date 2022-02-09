const bodyParser = require('body-parser');
const Users = require('../models/user-schema.js');
const helper = require('../util/helper.js');
const { check, validationResult } = require('express-validator');
var md5 = require('md5');
module.exports = (app, connection) => {
    app.use(bodyParser.json());
    app.post('/api/user',
        check('name').notEmpty().withMessage('name is requried'),
        check('mobile').notEmpty().withMessage('mobile is required').isLength({ min: 10, max: 10 }).withMessage('Please enter 10 digit valid mobile number').isNumeric().withMessage('mobile number should be numeric'),
        check('email').notEmpty().withMessage('email is required').isEmail().withMessage('Please enter valid email id'),
        check('password').notEmpty().withMessage('password is required'),
        check('user_type').notEmpty().withMessage('user_type is required').matches(/^(admin|user*)$/).withMessage('Please enter user type admin/user')
        , (req, res) => {
            const errors = validationResult(req);
            const reqData = req.body;
            reqData.status = 'active';
            if (!errors.isEmpty())
                return res.status(400).json({ message: errors.errors[0]["msg"] });
            reqData.password = md5(reqData.password);
            helper.CheckUsersTypes(reqData.user_type, (error, response) => {
                if (error) return res.status(400).json({ message: "Admin user already added" });
                Users.findByEmail(req.body.email, (duplicateerro, duplicate) => {
                    if (duplicateerro || duplicate) return res.status(400).json({ message: "This email id already exist" });
                    Users.addNew(req.body, (err, response) => {
                        if (err || !response) return res.status(400).json({ message: "No record found" });
                        return res.status(200).json({ message: "user created sucessfully" });
                    })
                });
            });
        });
    app.post('/api/user_signin',
        check('email').notEmpty().withMessage('email is required').isEmail().withMessage('Please enter valid email id'),
        check('password').notEmpty().withMessage('password is required'), (req, res) => {
            const errors = validationResult(req);
            const reqData = req.body;
            reqData.status = 'active';
            if (!errors.isEmpty())
                return res.status(400).json({ message: errors.errors[0]["msg"] });
            Users.findByEmailAndPassword(reqData.email, md5(reqData.password), (duplicateerro, duplicate) => {
                if (duplicateerro || !duplicate) return res.status(400).json({ message: "email id or password incorrect" });
                if (duplicate.status !== 'active') return res.status(400).json({ message: "Your account is deactivated" });
                res.send({ message: "Login successfully", data: duplicate })
            });
        });
    app.put('/api/user',
        check('name').notEmpty().withMessage('name is requried'),
        check('mobile').notEmpty().withMessage('mobile is required').isLength({ min: 10, max: 10 }).withMessage('Please enter 10 digit valid mobile number').isNumeric().withMessage('mobile number should be numeric'),
        check('email').notEmpty().withMessage('email is required').isEmail().withMessage('Please enter valid email id'),
        check('password').notEmpty().withMessage('password is required'),
        check('user_id').notEmpty().withMessage('user_id is required').isLength({ min: 1, max: 10 }).withMessage('Please enter 1 userid').isNumeric().withMessage('userid should be numeric')
        , (req, res) => {
            const errors = validationResult(req);
            const reqData = req.body;
            if (!errors.isEmpty())
                return res.status(400).json({ message: errors.errors[0]["msg"] });
            reqData.password = md5(reqData.password);
            const admin_id = req.headers.admin_id;
            let query1 = `SELECT *FROM user WHERE id<>'${reqData.user_id}' and email='${reqData.email}'`;
            Users.findByUserId(admin_id, (adminError, adminresponse) => {
                if (adminError || !adminresponse) return res.status(400).json({ message: "Error while checking the admin users" });
                if (adminresponse.user_type != 'admin') return res.status(400).json({ message: "user information only admin is updated" });
                connection.query(query1).then(function (response) {
                    if (response[0].length !== 0) return res.status(400).json({ message: "This email id already exist" });
                    Users.updatOne(req.body, (err, response) => {
                        if (err || !response) return res.status(400).json({ message: "Error while updating users information" });
                        return res.status(200).json({ message: "user updated sucessfully" });
                    })
                });
            });
        });
    app.delete('/api/user/:_id', (req, res) => {
        const admin_id = req.headers.admin_id;
        Users.findByUserId(admin_id, (adminError, adminresponse) => {
            if (adminError || !adminresponse) return res.status(400).json({ message: "Error while checking the admin users" });
            if (adminresponse.user_type != 'admin') return res.status(400).json({ message: "only admin users can be deleted users information" });
            Users.findByUserId(req.params._id, (userError, userResponse) => {
                if (userError || !userResponse) return res.status(400).json({ message: "User id does not exist" });
                if (userResponse.user_type === 'admin') return res.status(400).json({ message: "admin users can not be deleted" });
                Users.userDeleted(req.params._id, (ErrorDeleted, ResponseDeleted) => {
                    if (ErrorDeleted || !ResponseDeleted) return res.status(400).json({ message: "Error while deleting user" });
                    res.send({ message: "User deleted successfully" });
                });
            });
        });
    });
}