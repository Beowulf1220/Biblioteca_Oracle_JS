/*
    // This is for Oracle data base:
    npm install oracledb

    // This commands allow us make a http very easy:
    npm i express

    // This is for templates:
    npm i ejs

    // This is for read POST:
    npm install body-parser

    // These commands update the app.js after every modify:
    npm install -g nodemon
    nodemon app.js
*/

const express = require('express'); // import module
const bodyParser = require('body-parser');
const app = express();
app.use(express.static(__dirname + "/public")); // path

var urlencodedParser = bodyParser.urlencoded({ extended: false })
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json())
const port = 3000;

// templates engine
app.set("view engine", "ejs");
app.set("views", __dirname + "/views");

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
        result = await connection.execute(req);
        //console.log(result);

    } catch (err) {
        //show error message
        console.log(err.message);
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
        return result;//res.send(result.rows);
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

// This is for login
app.post("/index", urlencodedParser, async (req, res) => {
    const x = await query(`SELECT COUNT(*) FROM Usuario WHERE matricula = ${req.body.user} GROUP BY matricula`,res); // Query
    //console.log(x.rows==1);
    if (x.rows==1) { // verify user
        res.render("home", { title: "Inicio" });
    }else{
        // ...
    }
});

///////////////////////////////////////////////////////////////////////////

// Page advancesettings
app.use('/admin', (req, res) => {
    res.render("admin", { title: "Administradores" });
});

// Page advancesettings
app.use('/advancesettings', (req, res) => {
    res.render("advancesettings", { title: "Configuraciones avanzadas" });
});

// Page book
app.use('/book', (req, res) => {
    res.render("book", { title: "Registrar Libro" });
});

// Page book
app.use('/book', (req, res) => {
    res.render("book", { title: "Registrar Libro" });
});

// Page catalog
app.use('/catalog', (req, res) => {
    res.render("catalog", { title: "Catálogo" });
});

// Page catalog
app.use('/catalog', (req, res) => {
    res.render("catalog", { title: "Catálogo" });
});

// Page category
app.use('/category', (req, res) => {
    res.render("category", { title: "Categorías" });
});

// Page home
app.use('/home', (req, res) => {
    res.render("home", { title: "Inicio" });
});

// Page index
app.use('/index', (req, res) => {
    res.render("index", { title: "Inicio de sesión" });
});

// Page listpersonal
app.use('/institution', (req, res) => {
    res.render("institution", { title: "Institución" });
});

// Page listpersonal
app.use('/listadmin', (req, res) => {
    res.render("listadmin", { title: "Administradores" });
});

// Page listpersonal
app.use('/listcategory', (req, res) => {
    res.render("listcategory", { title: "Categorías" });
});

// Page listpersonal
app.use('/listpersonal', (req, res) => {
    res.render("listpersonal", { title: "Personal administrativo" });
});

// Page listprovider
app.use('/listprovider', (req, res) => {
    res.render("listprovider", { title: "Proveedores" });
});

// Page listsection
app.use('/listsection', (req, res) => {
    res.render("listsection", { title: "Secciones" });
});

// Page liststudent
app.use('/liststudent', (req, res) => {
    res.render("liststudent", { title: "Estudiantes" });
});

// Page listteacher
app.use('/listteacher', (req, res) => {
    res.render("listteacher", { title: "Docentes" });
});

// Page loan
app.use('/loan', (req, res) => {
    res.render("loan", { title: "Prestamos" });
});

// Page loanpending
app.use('/loanpending', (req, res) => {
    res.render("loanpending", { title: "Prestamos" });
});

// Page loanreservation
app.use('/loanreservation', (req, res) => {
    res.render("loanreservation", { title: "Reservaciones" });
});

// Page personal
app.use('/personal', (req, res) => {
    res.render("personal", { title: "Personal administrativo" });
});

// Page provider
app.use('/provider', (req, res) => {
    res.render("provider", { title: "Provedorees" });
});

// Page report
app.use('/report', (req, res) => {
    res.render("report", { title: "Reportes" });
});

// Page searchBook
app.use('/searchBook', (req, res) => {
    res.render("searchBook", { title: "Buscar libro" });
});

// Page teachers
app.use('/section', (req, res) => {
    res.render("section", { title: "Secciones" });
});

// Page teachers
app.use('/student', (req, res) => {
    res.render("student", { title: "Estudiantes" });
});

// Page teachers
app.use('/teacher', (req, res) => {
    res.render("teacher", { title: "Profesores" });
});

// Page 404 (Error: page not found)
app.use((req, res, next) => {
    res.status(404).render("404", { title: "Error" });
});