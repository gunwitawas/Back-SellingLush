import express from "express";
import * as connection from "../connection";
import * as MongoClient from "mongodb";
import * as dbConfig from "../constance/dbconfig";
import pool from "../constance/dbpool";

const router = express.Router();
const con = connection.con;
/*
*
* */
// About page route.
router.get('/get', (req, res) => {
    MongoClient.connect(dbConfig.mongoUrl,
        dbConfig.parser,
        (err, client) => {
            if (err) res.send(err);
            let db = client.db('myactivity').collection('user_profile');
            db.find({name: {'$regex': req.query.name}}).toArray((err, result) => {
                if (err) throw err;
                res.send(result);
            })
        });

});

router.get("/login", function (req, res) {
    console.log(req.query);
    try {
        let name = req.query.username;
        let password = req.query.password;
        let str = "select * from account where username ='?name'  AND password='?password' ";
        let sql = str.replace("?name", name).replace("?password", password);
        let obj = {};
        con.query(sql, function (err, result) {
            if (err) {
                return err;
            }
            if (result.length > 0) {
                console.log(result);
                let check = (name == result[0].username) && (password == result[0].password);
                obj = result.map(f => {
                    let v = f;
                    v.result = check;
                    return v;
                })[0];
                console.log(obj);
                res.send(obj);
            } else {
                res.send({
                    result: false,
                    message: "not found"
                });
            }
        });
    } catch (e) {
        res.send({
            error: e
        });
    }
});

router.get("/checkValidUsername", (req, res) => {
    console.log(req.query);
    try {
        let name = req.query.username;
        let str = "select * from account where username ='?name' ";
        let sql = str.replace("?name", name);
        con.query(sql, function (err, result) {
            if (err) {
                return err;
            }
            if (result.length > 0) {
                console.log(result);
                let check = (name == result[0].username);
                res.send({
                    result: false,
                    message: "Duplicate username"
                });
            } else {
                res.send({
                    result: true,
                    message: "You can use this name"
                });
            }
        });
    } catch (e) {
        res.send({
            error: e
        })
    }
});

router.post("/regis", function (req, res) {
    console.log(req.body);
    let sql = "insert into account values(':username',':password',':name',':address',':tel',':line_id',':type',':email',FROM_BASE64(':image'))";
    sql = sql.replace(':username', req.body.usernameRegis)
        .replace(':password', req.body.passwordRegis)
        .replace(':name', req.body.nameRegis)
        .replace(':address', req.body.inputAddress)
        .replace(':tel', req.body.inputTel)
        .replace(':line_id', req.body.inputLine)
        .replace(':type', req.body.type)
        .replace(':image', req.body.image.replace(/^data:image\/[a-z]+;base64,/, ""))
        .replace(':email', req.body.inputEmail);

    try {
        con.query(sql, function (err, result) {
            if (err) {
                res.send(err);
                return err;
            }
            res.send(result);
        });
    } catch (e) {
        res.send({
            error: e
        })
    }
});

router.post("/updateProfile", async (req, res) => {
    let sql = "UPDATE sellinglush.account " +
        "SET " +
        "    name     = ':name', " +
        "    address  = ':address', " +
        "    tel      = ':tel', " +
        "    line_id  = ':line_id', " +
        "    email    = ':email', " +
        "    image    = from_base64(':image') " +
        "WHERE username = ':username'"
    sql = sql.replace(":name", req.body.name)
        .replace(":username", req.body.username)
        .replace(":address", req.body.address)
        .replace(":tel", req.body.tel)
        .replace(":line_id", req.body.line_id)
        .replace(":email", req.body.email)
        .replace(":image", req.body.image.replace(/^data:image\/[a-z]+;base64,/, ""));
    let result = await pool.query(sql);
    res.send(result);
});

router.get("/getUserProfileByUsername", async (req, res) => {
    let sql = "select username, name, address, tel, line_id, type, email,TO_BASE64(image) as image from account where username = ':username'"
        .replace(":username", req.query.username);
    let result = await pool.query(sql);
    res.send(result[0]);
});
module.exports = router;