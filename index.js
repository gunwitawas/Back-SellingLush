const express = require('express');
const app = express();
const bodyParser = require('body-parser')
const mysql = require('mysql');

const con = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: "",
    database: "sellinglush"
});


con.connect(function (err) {
    if (err) {
        return err;
    }
    console.log("Connected!");
});
app.use(bodyParser({limit: '50mb'}));
app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
}));
/*
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});
*/


app.all('*', function (req, res, next) {
    /**
     * Response settings
     * @type {Object}
     */
    var responseSettings = {
        "AccessControlAllowOrigin": req.headers.origin,
        "AccessControlAllowHeaders": "Content-Type,X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5,  Date, X-Api-Version, X-File-Name",
        "AccessControlAllowMethods": "POST, GET, PUT, DELETE, OPTIONS",
        "AccessControlAllowCredentials": true
    };

    /**
     * Headers
     */
    res.header("Access-Control-Allow-Credentials", responseSettings.AccessControlAllowCredentials);
    res.header("Access-Control-Allow-Origin", responseSettings.AccessControlAllowOrigin);
    res.header("Access-Control-Allow-Headers", (req.headers['access-control-request-headers']) ? req.headers['access-control-request-headers'] : "x-requested-with");
    res.header("Access-Control-Allow-Methods", (req.headers['access-control-request-method']) ? req.headers['access-control-request-method'] : responseSettings.AccessControlAllowMethods);

    if ('OPTIONS' == req.method) {
        res.send(200);
    }
    else {
        next();
    }
});

app.get('/', (req, res) => {
    res.send('Hello World');
});

app.get("/login", function (req, res) {
    console.log(req.query);
    try {
        let name = req.query.username;
        let password = req.query.password;
        let str = "select * from account where username ='?name'  AND password='?password' ";
        let sql = str.replace("?name", name).replace("?password", password);
        let obj = {};
        con.query(sql, function (err, result) {
            if (err) {
                return err;
            }
            if (result.length > 0) {
                console.log(result);
                let check = (name == result[0].username) && (password == result[0].password);
                obj = result.map(f => {
                    let v = f;
                    v.result = check;
                    return v;
                })[0];
                console.log(obj);
                res.send(obj);
            } else {
                res.send({result: false, message: "not found"});
            }
        });
    } catch (e) {
        res.send({error: e})
    }
});

app.get("/checkValidUsername", function (req, res) {
    console.log(req.query);
    try {
        let name = req.query.username;
        let str = "select * from account where username ='?name' ";
        let sql = str.replace("?name", name);
        con.query(sql, function (err, result) {
            if (err) {
                return err;
            }
            if (result.length > 0) {
                console.log(result);
                let check = (name == result[0].username);

                res.send({result: false, message: "Duplicate username"});
            } else {
                res.send({result: true, message: "You can use this name"});
            }
        });
    } catch (e) {
        res.send({error: e})
    }
});

app.post("/regis", function (req, res) {
    let sql = "insert into account values(':username',':password',':name',':address',':tel',':line_id',':type',':email',FROM_BASE64(':image'))";
    sql = sql.replace(':username', req.body.username)
        .replace(':password', req.body.password)
        .replace(':address', req.body.address)
        .replace(':tel', req.body.tel)
        .replace(':line_id', req.body.line_id)
        .replace(':email', req.body.email)
        .replace(':image',req.body.image);
    try {
        con.query(sql, function (err, result) {
            if (err) {
                res.send(err);
                return err;
            }
            res.send(result);
        });
    } catch (e) {
        res.send({error: e})
    }
});


app.post("/insertProduct", function (req, res) {
    let sql = "INSERT INTO product (p_id, p_name, p_size, price, mixer, p_img) VALUES (':p_id', ':p_name', ':p_size', :price, ':mixer', FROM_BASE64(':p_img'))";
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
        res.send({error: e})
    }
});
app.get("/getAllProduct", function (req, res) {

    try {

        let str = "select p_id,p_name,p_size,price,mixer,TO_BASE64(p_img) as p_img from product";

        con.query(str, function (err, result) {
            if (err) {
                return err;
            }
            if (result.length > 0) {
                res.send({result: true, content: result.map(m=>{let v=m; v.isEdit=false; return v;})});
            } else {
                res.send({result: false, message: "not found"});
            }
        });
    } catch (e) {
        res.send({result:false,error: e})
    }

});

app.get("/searchProduct",(req,res)=>{
    try {
        console.log(req.query);
        let str = "select p_id,p_name,p_size,price,mixer,TO_BASE64(p_img) as p_img from product where 1=1";
        if(req.query.p_id){
            console.log(req.query.p_id);
           str = str.concat(" AND p_id like '%"+req.query.p_id+"%'");
        }
        if(req.query.p_name){
            console.log(req.query.p_name);
            str = str.concat(" AND p_name like '%"+req.query.p_name+"%'");
        }
        if(req.query.p_size){
            str =  str.concat(" AND p_size = '"+req.query.p_size+"'");
        }
        else if(req.query.maxPrice && req.query.minPrice){
            str = str.concat(" AND price BETWEEN "+req.query.minPrice +" AND " + req.query.maxPrice);
        }
        else if(req.query.maxPrice && !req.query.minPrice){
            str = str.concat(" AND price <= "+req.query.maxPrice);
        }
        if(!req.query.maxPrice && req.query.minPrice){
            str =  str.concat(" AND price >= "+req.query.minPrice);
        }
        if(req.query.mixer){
            str =  str.concat(" AND p_id like '%"+req.query.mixer+"%'");
        }
        console.log(str);
        con.query(str, function (err, result) {
            if (err) {
                return err;
            }
            if (result.length > 0) {
                res.send({result: true, content: result.map(m=>{let v=m; v.isEdit=false; return v;})});
            } else {
                res.send({result: false, message: "not found"});
            }
        });
    } catch (e) {
        res.send({error: e})
    }
});

app.post("/Product",(req,res)=>{

})

app.listen(3000, () => {
    console.log('Start server at port 3000.')
});

function isNotNull(value){
}