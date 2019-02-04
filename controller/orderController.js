import express from "express";
import * as connection from "../connection";

const router = express.Router();
const con = connection.con;


router.get("/getProductStore", (req, res) => {
    let str = "select s.p_id, stockQty, saleQty, p_name,price, p_size, mixer , TO_BASE64(p_img) as p_img " +
        "from product_store s" +
        "       inner join product p on s.p_id = p.p_id" +
        " where sale_date = DATE_FORMAT(now(), '%Y-%m-%d')" +
        "  and stockQty > saleQty;";
    try {
        con.query(str, function (err, result) {
            if (err) {
                return err;
            }
            if (result.length > 0) {
                res.send({
                    result: true,
                    content: result
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

function convert(date) {
    return date.getFullYear() + "-" + (Number(date.getMonth()) + 1) + "-" + date.getDate();
}

module.exports = router;