import express from "express";
import pool from "../constance/dbpool"

const router = express.Router();


router.get("/getStockReport", async (req, res) => {
    let sql = "select s.p_id,\n" +
        "       p.p_name,\n" +
        "       p.p_size,\n" +
        "       p.price,\n" +
        "       p.mixer,\n" +
        "       s.saleQty,\n" +
        "       s.stockQty,\n" +
        "       s.sale_date\n" +
        "from product_store s\n" +
        "         inner join product p on s.p_id = p.p_id\n" +
        "where 1 = 1\n";
    if (req.query.startDate && !req.query.endDate) {
        sql += " and sale_date = str_to_date(':startDate','%Y-%m-%d') \n"
            .replace(":startDate", convert(new Date(req.query.startDate)))
    } else if (req.query.startDate && req.query.endDate) {
        sql += " and sale_date between str_to_date(':startDate','%Y-%m-%d') and  str_to_date(':endDate','%Y-%m-%d') "
            .replace(":startDate", convert(new Date(req.query.startDate)))
            .replace(":endDate", convert(new Date(req.query.endDate)));
    }
    if (req.query.p_size) {
        sql += " and p.p_size=':p_size' ".replace(":p_size", req.query.p_size);
    }
    if (req.query.mixer) {
        sql += " and p.mixer=':mixer' ".replace(":mixer", req.query.mixer);
    }
    if(req.query.type=='S'){
        sql += " order by sale_date, stockQty desc ,p.p_size ";
    }else{
        sql += " order by sale_date, saleQty desc ,p.p_size ";
    }
    let result = await pool.query(sql);
    res.send(result);
});

router.get("/getOrderReport", async (req, res) => {
    let sql = "select\n" +
        "    o.order_date,\n" +
        "    o.order_id,\n" +
        "    o.username,\n" +
        "    o.order_date,\n" +
        "    o.net_pay,\n" +
        "    a.tel,\n" +
        "    a.line_id,\n" +
        "    a.name\n" +
        "from\n" +
        "     order_detail o inner join account a on o.username = a.username where status = 'S' ";
    if(req.query.username){
        sql += " and o.username = ':username' ".replace(":username",req.query.username)
    }
    if (req.query.startDate && !req.query.endDate) {
        sql += " and o.order_date = str_to_date(':startDate','%Y-%m-%d') \n"
            .replace(":startDate", convert(new Date(req.query.startDate)))
    } else if (req.query.startDate && req.query.endDate) {
        sql += " and o.order_date between str_to_date(':startDate','%Y-%m-%d') and  str_to_date(':endDate','%Y-%m-%d') "
            .replace(":startDate", convert(new Date(req.query.startDate)))
            .replace(":endDate", convert(new Date(req.query.endDate)));
    }

    let result = await pool.query(sql);
    res.send(result);
});
router.get("/getMixerList", async (req, res) => {
    let sql = "select distinct mixer from product";
    let result = await pool.query(sql);
    res.send(result);
});
router.get("/getCustomer", async (req, res) => {
    let sql = "select username,name\n" +
        "from account where type = 'M' ";
    let result = await pool.query(sql);
    res.send(result);
});
router.post("/deleteOrderlist", async (req, res) => {
    let sql = "delete from order_list where order_id=':orderId'".replace(":orderId", req.body.order_id);
    let result = await pool.query(sql);
    return res.send(result);
});

function convert(date) {
    return date.getFullYear() + "-" + (Number(date.getMonth()) + 1) + "-" + date.getDate();
}

module.exports = router;