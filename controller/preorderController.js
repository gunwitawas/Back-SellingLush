import express from "express";
import * as connection from "../connection";
import pool from "../constance/dbpool"

const router = express.Router();
const con = connection.con;

router.post("/insertPreorderDetail", async (req, res) => {
console.log(req.body);

    let sql = "INSERT INTO preorder_detail (pre_id, username, pre_date, payment_status, receive_status, receive_date, netpay, address, delivery) " +
        "select ifnull(LPAD(CAST(max(pre_id) + 1 AS SIGNED), 11, '0'),\n" +
        "              LPAD('1', 11, '0')) as pre_id,\n" +
        "       ':username'                  as username,\n" +
        "       ':pre_date'                      as pre_date,\n" +
        "       ':payment_status'                        as payment_status,\n" +
        "       ':receive_status'                         as receive_status,\n" +
        "       ':receive_date'                       as receive_date,\n" +
        "       ':netpay'                   as netpay,\n" +
        "       ':address'                   as address,\n" +
        "       ':delivery'                   as delivery\n" +
        "from preorder_detail";

    sql = sql.replace(':username', req.body.username)
        .replace(':pre_date', req.body.pre_date)
        .replace(':payment_status', req.body.payment_status)
        .replace(':receive_status', req.body.receive_status)
        .replace(':receive_date', req.body.receive_date)
        .replace(':netpay', req.body.netpay)
        .replace(':address', req.body.address)
        .replace(':delivery', req.body.delivery);
    let obj = {
        result: "",
        pre_id: "",
        message: ""
    }
    try {
        
        let result = await pool.query(sql);
        obj.result = result;
        obj.message = "Success";
        result = await pool.query("select max(pre_id) as pre_id from preorder_detail");
        obj.pre_id = result[0].pre_id;
        await res.send(obj);

    } catch (error) {
        obj.result = error;
        obj.message = "error";
        res.send(obj)
    }
});


router.post("/insertPreorderlist", function (req, res) {
    console.log(req);

    let sql = "INSERT INTO preorder_list (pre_id, p_id, qty) VALUES (':pre_id', ':p_id', ':qty');";
    sql = sql.replace(':pre_id', req.body.pre_id)
        .replace(':p_id', req.body.p_id)
        .replace(':qty', req.body.qty)
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
        let str = "SELECT pre_id, username, pre_date, payment_status, receive_status, receive_date, netpay, address,delivery, TO_BASE64(pay_img) as pay_img,tracking_code FROM preorder_detail";
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

router.get("/getAllPreOrderList", function (req, res) {
    try {
        let str = "SELECT o.*,p.*,TO_BASE64(p_img) as p_img FROM preorder_list o inner join product p on p.p_id = o.p_id ";
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

router.post("/uploadImagePayment", async (req, res) => {

    let sql = "UPDATE preorder_detail SET payment_status = ':payment_status', pay_img = FROM_BASE64(':pay_img') WHERE preorder_detail.pre_id = ':pre_id'";
    sql = sql.replace(':pre_id', req.body.pre_id)
        .replace(':payment_status', req.body.payment_status)
        .replace(':pay_img', req.body.pay_img.replace(/^data:image\/[a-z]+;base64,/, ""));
    let obj = {
        result: "",
        update_id: req.body.pre_id,
        message: ""
    }
    try {
        let result = await pool.query(sql);
        obj.result = result;
        obj.message = "Success";
        await res.send(obj);
    } catch (error) {
        obj.result = error;
        obj.message = "error";
        await res.send(obj)
    }
});

router.post("/updatePatmentStatus", (req, res) => {
    let sql = "UPDATE preorder_detail SET payment_status = ':payment_status',tracking_code = ':trackingCode' WHERE preorder_detail.pre_id = ':pre_id';".replace(":payment_status", req.body.payment_status).replace(":trackingCode", req.body.trackingCode).replace(":pre_id", req.body.pre_id);
    let obj = {
        result: "",
        message: ""
    }
    try {
        con.query(sql, function (err, result) {
            if (err) {
                obj.result = result;
                obj.message = "error";
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



module.exports = router;