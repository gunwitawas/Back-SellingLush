import express from "express";
import * as connection from "../connection";

const router = express.Router();
const con = connection.con;


router.get("/getProductStore", (req, res) => {
    let str = "select s.*," +
        " false as \"isNew\", " +
        " false as \"isUpdate\", " +
        " false as \"isEdit\" ,TO_BASE64(p.p_img) as p_img ,p.p_name, p.expire_date, p.limited_flag " +
        " from product_store s " +
        " inner join product p on p.p_id = s.p_id " +
        " where s.sale_date = STR_TO_DATE(':selectedDate', '%Y-%m-%d') order by p.limited_flag desc ";
    str = str.replace(':selectedDate', req.query.selectedDate);
    try {
        con.query(str, function (err, result) {
            if (err) {
                return err;
            }
            console.log(result);
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

router.post("/insertProductStore", (req, res) => {
    let sql = "INSERT INTO sellinglush.product_store (p_id, sale_date, stockQty, saleQty) VALUES (':p_id', STR_TO_DATE(':sale_date', '%Y-%m-%d'), :stockQty, :saleQty);";
    sql = sql.replace(':p_id', req.body.p_id)
        .replace(':sale_date', convert(new Date(req.body.sale_date)))
        .replace(':stockQty', req.body.stockQty)
        .replace(':saleQty', req.body.saleQty);
    let obj = {result: ""}
    try {
        con.query(sql, function (err, result) {
            if (err) {
                obj.result = err;
            } else {
                obj.result = "success";
            }
            res.send(obj);
        });
    } catch (e) {
        res.send({
            error: e
        })
    }
});

router.post("/updateProductStore", (req, res) => {
    let sql = "UPDATE sellinglush.product_store SET stockQty = :stockQty WHERE p_id = ':p_id' AND sale_date = STR_TO_DATE(':sale_date', '%Y-%m-%d');";
    sql = sql.replace(':p_id', req.body.p_id)
        .replace(':sale_date', convert(new Date(req.body.sale_date)))
        .replace(':stockQty', Number(req.body.stockQty));
    console.log(sql);
    let obj = {result: ""}
    try {
        con.query(sql, function (err, result) {
            if (err) {
                obj.result = err;
            } else {
                obj.result = "success";
            }
            res.send(obj);
        });
    } catch (e) {
        res.send({
            error: e
        })
    }
});

router.post("/deleteProductStore", (req, res) => {
    let sql = "DELETE FROM sellinglush.product_store WHERE p_id = ':p_id'  AND sale_date = STR_TO_DATE(':sale_date', '%Y-%m-%d');";
    sql = sql.replace(':p_id', req.body.p_id)
        .replace(':sale_date', convert(new Date(req.body.sale_date)));
    console.log(sql);
    let obj = {result: ""}
    try {
        con.query(sql, function (err, result) {
            if (err) {
                obj.result = err;
            } else {
                obj.result = "success";
            }
            res.send(obj);
        });
    } catch (e) {
        res.send({
            error: e
        })
    }
});

function convert(date) {
    return date.getFullYear() + "-" + (Number(date.getMonth()) + 1) + "-" + date.getDate();
}

module.exports = router;