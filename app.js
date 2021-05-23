/*
    // These commands update the app.js after every modify:
    npm install -g nodemon
    nodemon app.js

    // This is for Oracle data base
    npm install oracledb

    // This commands allow us make a http very easy
    npm i express
*/

const express = require('express'); // import module
const app = express();
app.use(express.static(__dirname + "/public")); // path

const port = 3000;

app.get('/', (req, res) => {
    res.send('Mi respuesta');
});

app.listen(port, () => {
    console.log("Servidor a su servicio", port);
});

// data base conection
var oracledb = require('oracledb');
oracledb.getConnection(
    {
        user: "hr",
        password: "hr",
        connectString: "localhost/xepdb1"
    },
    function (err, connection) {
        if (err) {
            console.error(err.message);
            return;
        }
        console.log('Connection was successful!');

        connection.close(
            function (err) {
                if (err) {
                    console.error(err.message);
                    return;
                }
            }
        );
    }
);

// Query function
async function query(req, res) {
    try {
        connection = await oracledb.getConnection({
            user: "hr",
            password: "hr",
            connectString: "localhost:1521/xepdb1"
        });

        console.log('connected to database');
        // run query to get all employees
        result = await connection.execute(req);

    } catch (err) {
        //send error message
        return res.send(err.message);
    } finally {
        if (connection) {
            try {
                // Always close connections
                await connection.close();
                console.log('close connection success');
            } catch (err) {
                console.error(err.message);
            }
        }
        if (result.rows.length == 0) {
            //query return zero employees
            return res.send('query send no rows');
        } else {
            //send all employees
            return res.send(result.rows);
        }

    }
}

// Get /employee?id=<id employee>
app.get('/employee', function (req, res) {

    //get query param ?id
    let id = req.query.id;

    // id param if it is number
    if (isNaN(id)) {
        res.send('Query param id is not number');
        return;
    }
    query(req, res, id);
}
);

// Get /employess
app.get('/employees', function (req, res) {
    query("SELECT * FROM employees", res);
}
);

// Get general query
app.get('/query', function (req, res) {
    query(req, res);
});

// Page 404 (Error: page not found)
app.use((req, res, next) => {
    res.status(404).sendFile(__dirname + "/public/404.html");
});