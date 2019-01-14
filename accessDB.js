const mysql = require('mysql');

const con = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: "",
    database: "sellinglush"
});

export function select(sql) {
    sql = "select * from account";
    let res = "";
    con.connect(function (err) {
        if (err) {
            return err;
        }
        console.log("Connected!");
        con.query(sql, function (err, result) {
            if (err) {
                return err;
            }
            res = result;
            return res;
        });
    });
}