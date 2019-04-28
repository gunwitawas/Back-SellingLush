import express from "express";
import * as connection from "../connection";
const router = express.Router();
const con = connection.con;

router.post("/insertProduct", function (req, res) {
    let sql = "INSERT INTO product (p_id, p_name, p_size, price, mixer, p_img,create_date,limited_flag,expire_date) VALUES (':p_id', ':p_name', ':p_size', :price, ':mixer', FROM_BASE64(':p_img'),now(),':limitedFlag', STR_TO_DATE(':expireDate', '%Y-%m-%d'))";
   let limitedFlag = req.body.limitedFlag ? "Y":"N";
    sql = sql.replace(':p_id', req.body.p_id)
        .replace(':p_name', req.body.p_name)
        .replace(':p_size', req.body.p_size)
        .replace(':price', req.body.price)
        .replace(':mixer', req.body.mixer)
        .replace(':p_img', req.body.p_img.replace(/^data:image\/[a-z]+;base64,/, ""))
        .replace(":limitedFlag",limitedFlag)
        .replace(":expireDate",convert(new Date(req.body.expireDate)));
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


router.get("/getAllProduct", function (req, res) {
    try {
        let str = "select p_id,p_name,p_size,price,mixer,TO_BASE64(p_img) as p_img from product ORDER by limited_flag desc";

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
router.get("/searchProduct", (req, res) => {
    try {
        console.log(req.query);
        let str = "select p_id,p_name,p_size,price,mixer,TO_BASE64(p_img) as p_img from product where 1=1";
        if (req.query.p_id) {
            console.log(req.query.p_id);
            str = str.concat(" AND p_id like '%" + req.query.p_id + "%'");
        }
        if (req.query.p_name) {
            console.log(req.query.p_name);
            str = str.concat(" AND p_name like '%" + req.query.p_name + "%'");
        }
        if (req.query.p_size) {
            str = str.concat(" AND p_size = '" + req.query.p_size + "'");
        } else if (req.query.maxPrice && req.query.minPrice) {
            str = str.concat(" AND price BETWEEN " + req.query.minPrice + " AND " + req.query.maxPrice);
        } else if (req.query.maxPrice && !req.query.minPrice) {
            str = str.concat(" AND price <= " + req.query.maxPrice);
        }
        if (!req.query.maxPrice && req.query.minPrice) {
            str = str.concat(" AND price >= " + req.query.minPrice);
        }
        if (req.query.mixer) {
            str = str.concat(" AND p_id like '%" + req.query.mixer + "%'");
        }
        console.log(str);
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
            error: e
        })
    }
});
router.post("/updateProduct", function (req, res) {
    let sql = "UPDATE product SET p_name = ':p_name', p_size = ':p_size', price = ':price', mixer = ':mixer',p_img = FROM_BASE64(':p_img') WHERE product.p_id = ':p_id'";
    sql = sql.replace(':p_id', req.body.p_id)
        .replace(':p_name', req.body.p_name)
        .replace(':p_size', req.body.p_size)
        .replace(':price', req.body.price)
        .replace(':mixer', req.body.mixer)
        .replace(':p_img', req.body.p_img.replace(/^data:image\/[a-z]+;base64,/, ""));
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

router.get("/getLatestProduct", function (req, res) {
    try {
        let str = "select p_id,p_name,p_size,price,mixer,TO_BASE64(p_img) as p_img from product order by create_date desc limit 3 ";

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
router.get("/getBestSellerProduct", function (req, res) {
    try {
        let str = "select p.p_id,p.p_name,p.p_size,p.price,p.mixer,TO_BASE64(p.p_img) as p_img \n" +
            " from product p\n" +
            "         inner join (\n" +
            "    select sum(qty) as total, p_id\n" +
            "    from order_list\n" +
            "    group by p_id) t on p.p_id = t.p_id\n" +
            " order by t.total desc limit 3 ";

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

function convert(date) {
    return date.getFullYear() + "-" + (Number(date.getMonth()) + 1) + "-" + date.getDate();
}
module.exports = router;