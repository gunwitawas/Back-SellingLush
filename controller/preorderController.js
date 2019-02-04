import express from "express";
import * as connection from "../connection";
const router = express.Router();
const con = connection.con;

router.post("/insertPreorderDetail", function (req, res) {
    console.log(req);
    
    let sql = "INSERT INTO preorder_detail (username, pre_date, payment_status, receive_status, receive_date, netpay) VALUES (':username', ':pre_date', ':payment_status', ':receive_status', ':receive_date', ':netpay')";
    sql = sql.replace(':username', req.body.username)
        .replace(':pre_date', req.body.pre_date)
        .replace(':payment_status', req.body.payment_status)
        .replace(':receive_status', req.body.receive_status)
        .replace(':receive_date', req.body.receive_date)
        .replace(':netpay', req.body.netpay);
    let obj = {
        result: "",
        message: ""
    }
    try {
        con.query(sql, function (err, result) {
            if (err) {
                obj.result = result;
                obj.message = "Duplicate";
            } else {
                obj.result = result;
                obj.message = "Success";
            }
            res.send(obj);
        });
    } catch (error) {
        obj.result = error;
        obj.message = "error";
        res.send(obj)
    }
});

router.get("/getAllPreOrder", function (req, res) {
    try {
        let str = "SELECT * FROM preorder_detail";
        con.query(str, function (err, result) {
            if (err) {
                return err;
            }
            if (result.length > 0) {
                res.send({
                    result: true,
                    content: result.map(m => {
                        let v = m;
                        v.isEdit = false;
                        return v;
                    })
                });
            } else {
                res.send({
                    result: false,
                    message: "not found"
                });
            }
        });
    } catch (e) {
        res.send({
            result: false,
            error: e
        })
    }
});


module.exports = router;