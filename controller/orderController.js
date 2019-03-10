import express from "express";
import * as connection from "../connection";
import pool from "../constance/dbpool"

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

router.get("/searchProductStore", (req, res) => {
    let str = "select s.*,p.p_name,p.price,p.mixer,p.p_size," +
        "TO_BASE64(p_img) as p_img " +
        " from product_store s " +
        "inner join product p on p.p_id = s.p_id " +
        "where s.sale_date=STR_TO_DATE(now(), '%Y-%m-%d') ";
    if (req.query.p_id) {
        console.log(req.query.p_id);
        str = str.concat(" AND s.p_id like '%" + req.query.p_id + "%'");
    }
    if (req.query.p_name) {
        console.log(req.query.p_name);
        str = str.concat(" AND p.p_name like '%" + req.query.p_name + "%'");
    }
    if (req.query.p_size) {
        str = str.concat(" AND p.p_size = '" + req.query.p_size + "'");
    } else if (req.query.maxPrice && req.query.minPrice) {
        str = str.concat(" AND p.price BETWEEN " + req.query.minPrice + " AND " + req.query.maxPrice);
    } else if (req.query.maxPrice && !req.query.minPrice) {
        str = str.concat(" AND p.price <= " + req.query.maxPrice);
    }
    if (!req.query.maxPrice && req.query.minPrice) {
        str = str.concat(" AND p.price >= " + req.query.minPrice);
    }
    if (req.query.mixer) {
        str = str.concat(" AND p.mixer like '%" + req.query.mixer + "%'");
    }
    console.log(str);
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

router.post("/insertOrderDetail", async (req, res) => {
    let sql = "INSERT INTO sellinglush.order_detail (order_id, username, order_date, status, pay_by, pay_img, net_pay) " +
        "select ifnull(LPAD(CAST(max(order_id) + 1 AS SIGNED), 11, '0'),\n" +
        "              LPAD('1', 11, '0')) as order_id,\n" +
        "       ':username'                  as username,\n" +
        "       now()                      as order_date,\n" +
        "       'N'                        as status,\n" +
        "       ''                         as pay_by,\n" +
        "       null                       as pay_img,\n" +
        "       :net_pay                   as net_pay\n" +
        "from order_detail";
    sql = sql.replace(':username', req.body.username)
        .replace(':net_pay', req.body.net_pay);
    console.log(sql);
    let obj = {
        result: "",
        order_id: "",
        message: ""
    }
    try {
        let result = await pool.query(sql);
        obj.result = result;
        obj.message = "Success";
        result = await pool.query("select max(order_id) as order_id from order_detail");
        obj.order_id = result[0].order_id;
        await res.send(obj);
    } catch (error) {
        obj.result = error;
        obj.message = "error";
        await res.send(obj)
    }
});

router.get("/getOrderDetailByID", async (req, res) => {
    let sql = "SELECT o.order_id,o.username,o.order_date,o.status,o.pay_by,TO_BASE64(o.pay_img) as pay_img  FROM order_detail o WHERE o.order_id = ':order_id'";
    sql = sql.replace(':order_id', req.query.order_id);
    let result = await pool.query(sql);
    let resObj = {
        orderDetail: result[0],
        orderList: []
    }
    sql = "SELECT o.*, p.p_name,p.price, p.p_size, p.mixer , TO_BASE64(p.p_img) as p_img  FROM order_list o inner join product p on o.p_id = p.p_id WHERE order_id = ':order_id'";
    sql = sql.replace(':order_id', req.query.order_id);
    result = await pool.query(sql);
    resObj.orderList = result;
    await res.send(resObj);
});

router.post("/insertOrderList", (req, res) => {
    let sql = "INSERT INTO sellinglush.order_list (order_id, p_id, qty, price) VALUES (':order_id', ':p_id', :qty, :price)";
    sql = sql.replace(':order_id', req.body.order_id)
        .replace(':p_id', req.body.p_id)
        .replace(':qty', req.body.qty)
        .replace(':price', req.body.price);
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

router.post("/comfirmPayment", async (req, res) => {
    try {
        console.log(req.body.orderDetail.order_id);
        let sql = "UPDATE ORDER_DETAIL SET pay_img = from_base64(':pay_img') , status = 'W' WHERE order_id = ':order_id'"
            .replace(":order_id", req.body.orderDetail.order_id)
            .replace(":pay_img", req.body.orderDetail.pay_img.replace(/^data:image\/[a-z]+;base64,/, ""));
        let result = await pool.query(sql);
        let obj = {
            result: true,
            affectedRows: 0
        }
        if (result.affectedRows > 0) {
            sql = "SELECT * from order_list where order_id = ':order_id'"
                .replace(":order_id", req.body.orderDetail.order_id);
            result = await pool.query(sql);
            if (result.length > 0) {
                for (let item of result) {
                    sql = "UPDATE product_store SET stockQty = stockQty-" + item.qty +
                        ",saleQty = saleQty+" + item.qty +
                        " WHERE p_id = '" + item.p_id + "' and sale_date =STR_TO_DATE('" +
                        convert(new Date(req.body.orderDetail.order_date)) + "', '%Y-%m-%d')";
                    let r = await pool.query(sql);
                    obj.affectedRows += r.affectedRows;
                }
            }
        }
        res.send(obj);
    } catch (e) {
        res.send(e)
    }
});

router.post("/clearOrderOverdue", async (req, res) => {
    let sql = "SELECT * FROM ORDER_DETAIL WHERE status = 'N' and order_date <  DATE_FORMAT(now(), '%Y-%m-%d')";
    let result = await pool.query(sql);
    if (result.length > 0) {
        sql = "UPDATE ORDER_DETAIL SET STATUS='C' WHERE status ='N'";
        result = await pool.query(sql);
        res.send(result);
    } else {
        res.send({result: "Do not any order to action!"})
    }
});


router.post("/updateOrderStatus", async (req, res) => {
    let sql = "UPDATE ORDER_DETAIL SET STATUS=':status' WHERE order_id =':orderId'".replace(":status", req.body.status).replace(":orderId", req.body.orderId);
    let result = await pool.query(sql);
    res.send(result);
});

router.get("/getOrderDetailByUsername", async (req, res) => {
    try {
        let sql = "SELECT  o.order_id,o.username,o.order_date,o.status,o.pay_by FROM order_detail o WHERE username = ':username' order by order_date desc"
            .replace(":username", req.query.username);
        let result = await pool.query(sql);
        let resResult = [];
        for (let m of result) {
            let v = m;
            sql = "SELECT o.p_id,o.qty,o.price,p.p_name,p.mixer,p.p_size,TO_BASE64(p.p_img) as p_img FROM  order_list o inner join product p on o.p_id = p.p_id " +
                " where o.order_id = :order_id"
                    .replace(":order_id", m.order_id);
            let list = await pool.query(sql);
            v.orderList = list;
            resResult.push(v);
        }
        res.send(resResult);
    } catch (e) {
        res.send(e)
    }
});

router.get("/getOrderDetailByStatus", async (req, res) => {
    try {
        let sql = "SELECT  o.order_id,o.username,o.order_date,o.status,o.pay_by,TO_BASE64(o.pay_img) as pay_img  FROM order_detail o WHERE 1=1 ";
        if (req.query.status) {
            sql += "and status = ':status' "
                .replace(":status", req.query.status)
        }
        sql += " order by order_date desc ";
        let result = await pool.query(sql);
        let resResult = [];
        for (let m of result) {
            let v = m;
            sql = "SELECT o.p_id,o.qty,o.price,p.p_name,p.mixer,p.p_size,TO_BASE64(p.p_img) as p_img FROM  order_list o inner join product p on o.p_id = p.p_id " +
                " where o.order_id = :order_id"
                    .replace(":order_id", m.order_id);
            let list = await pool.query(sql);
            v.orderList = list;
            resResult.push(v);
        }
        res.send(resResult);
    } catch (e) {
        res.send(e)
    }
});

router.get("/checkOrderStatusUnpaid", async (req, res) => {
    let sql = "select order_id from order_detail where username = ':username' and (status = 'N' OR status='W')".replace(":username", req.query.username);
    let result = await pool.query(sql);
    res.send({result: result.length > 0});
});

router.post("/deleteOrderlist",async (req,res)=>{
    let sql = "delete from order_list where order_id=':orderId'".replace(":orderId",req.body.order_id);
    let result = await pool.query(sql);
    return res.send(result);
})

function convert(date) {
    return date.getFullYear() + "-" + (Number(date.getMonth()) + 1) + "-" + date.getDate();
}

module.exports = router;