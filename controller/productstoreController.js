import express from "express";
import * as connection from "../connection";

const router = express.Router();
const con = connection.con;


router.get("/getProductStore", (req, res) => {
    console.log(req.query);
    let str = "select s.*,p.p_name,false as \"isNew\",false as \"isUpdate\", false as \"isNew\"  from product_store s inner join product p on p.p_id = s.p_id";
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

router.post("/insertProductStore",  (req, res) => {
    let sql = "INSERT INTO sellinglush.product_store (p_id, sale_date, stockQty, saleQty) VALUES (':p_id', :sale_date, :stockQty, :saleQty);";
    sql = sql.replace(':p_id', req.body.p_id)
        .replace(':sale_date', req.body.sale_date)
        .replace(':stockQty', req.body.name)
        .replace(':saleQty', req.body.address);
    let obj = {result: ""}
    try {
        con.query(sql, function (err, result) {
            if (err) {
                obj.result = "duplicate"
            } else {
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