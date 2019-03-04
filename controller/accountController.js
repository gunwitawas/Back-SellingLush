import express from "express";
import * as connection from "../connection";
const router = express.Router();
const con = connection.con;
import pool from "../constance/dbpool"

router.get("/getAccount", function (req, res) {
    let str = "SELECT username, password, name, address, tel, line_id, type, email, TO_BASE64(image) AS image FROM account";
    try {
        con.query(str, function (err, result) {
            if (err) {
                return err;
            }
            if (result.length > 0) {
                res.send({
                    result: true,
                    content: result.map(response => {
                        response.isEdit = false;
                        return response;
                    })
                });
            } else {
                res.send({
                    result: false,
                    message: "not found"
                });
            }
        });
    } catch (err) {
        res.send({
            result: false,
            error: err
        })
    }
});
router.post("/Register", function (req, res) {
    let sql = "INSERT INTO account (username, password, name, address, tel, line_id, type, email, image) VALUES (':username', ':password', ':name', ':address', ':tel', ':line_id', ':type', ':email', FROM_BASE64(':image'));";
    sql = sql.replace(':username', req.body.username)
        .replace(':password', req.body.password)
        .replace(':name', req.body.name)
        .replace(':address', req.body.address)
        .replace(':tel', req.body.tel)
        .replace(':line_id', req.body.line_id)
        .replace(':type', req.body.type)
        .replace(':email', req.body.email)
        .replace(':image', req.body.upLoadImage.replace(/^data:image\/[a-z]+;base64,/, ""));
    let obj ={result:""}
    try {
        con.query(sql, function (err, result) {
            if (err) {
                obj.result = "duplicate"
            }else{
                obj.result = "succcess"

            }
            res.send(obj);
        });
    } catch (e) {
        res.send({
            error: e
        })
    }
});


module.exports = router;