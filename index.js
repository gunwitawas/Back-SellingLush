import express from "express";
import bodyParser from "body-parser";
import user from './controller/userController.js';
import product from './controller/productsController.js';
import account from './controller/accountController.js';
import productStore from './controller/productstoreController.js';
import preorder from "./controller/preorderController";
const app = express();
app.use(bodyParser({
    limit: '50mb'
}));
app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({ // to support URL-encoded bodies
    extended: true
}));
app.all('*', function (req, res, next) {
    /**
     * Response settings
     * @type {Object}
     */
    const responseSettings = {
        "AccessControlAllowOrigin": req.headers.origin,
        "AccessControlAllowHeaders": "Content-Type,X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5,  Date, X-Api-Version, X-File-Name",
        "AccessControlAllowMethods": "POST, GET, PUT, DELETE, OPTIONS",
        "AccessControlAllowCredentials": true
    };

    /**
     * Headers
     */
    res.header("Access-Control-Allow-Credentials", responseSettings.AccessControlAllowCredentials);
    res.header("Access-Control-Allow-Origin", responseSettings.AccessControlAllowOrigin);
    res.header("Access-Control-Allow-Headers", (req.headers['access-control-request-headers']) ? req.headers['access-control-request-headers'] : "x-requested-with");
    res.header("Access-Control-Allow-Methods", (req.headers['access-control-request-method']) ? req.headers['access-control-request-method'] : responseSettings.AccessControlAllowMethods);
    if ('OPTIONS' == req.method) {
        res.send(200);
    } else {
        next();
    }
});
app.use('/user', user);
app.use('/product', product);
app.use('/account', account);
app.use('/productStore', productStore);
app.use('/preorder', preorder);
app.listen(3000, () => {
    console.log('Start server at port 3000.')
});

