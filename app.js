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
const oracledb = require('oracledb');
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

const dbConfig = {
    user: "hr",
    password: "hr",
    connectString: "localhost/xepdb1",
};

// data base conection
/*var oracledb = require('oracledb');
oracledb.getConnection(dbConfig,
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
);*/

oracledb.autoCommit = true;

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
    const profile = await query(`SELECT * FROM usuario WHERE matricula = ${req.body.user} AND contrasena = ${req.body.contrasena}`, res); // Query
    //console.log(x.rows.length == 1);
    if (profile.rows.length == 1) { // verify user

        const no_students = await query(`SELECT * FROM alumno`, res);
        const no_books = await query(`SELECT * FROM libros`, res);
        const no_prestamos = await query(`SELECT * FROM prestamo`, res);
        const no_categorias = await query(`SELECT * FROM categoria`, res);
        const no_docentes = await query(`SELECT * FROM docente`, res);
        const no_admin = await query(`SELECT * FROM administrador`, res);

        res.render("home", {
            profile: profile.rows,
            title: "Inicio",
            no_students: no_students.rows,
            no_books: no_books.rows,
            no_prestamos: no_prestamos.rows,
            no_categorias: no_categorias.rows,
            no_docentes: no_docentes.rows,
            no_admin: no_admin.rows,
        });
    } else {
        // ...
    }
});

///////////////////////////////////////////////////////////////////////////

// Page advancesettings
app.use('/admin', (req, res) => {
    res.render("admin", { title: "Administradores" });
});

// Page advancesettings
app.use('/adminAdd', async (req, res) => {

    await oracledb.getConnection(dbConfig).then(async (conn) => {
        await conn.execute("INSERT INTO administrador VALUES (:0, :1)",
            [req.body.matricula, req.body.rol], { autoCommit: true });
    });

    res.render("listadmin", { title: "Administradores" });
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
app.use('/catalog', async (req, res) => {

    let result;
    await oracledb.getConnection(dbConfig).then(async (conn) => {
        result = await conn.execute('SELECT * FROM libros');
    });

    res.render("catalog", { title: "Catálogo", tabla: result.rows });
});

// Page category
app.use('/category', (req, res) => {
    res.render("category", { title: "Categorías" });
});

// Register category
app.post('/saveCategory', urlencodedParser, async (req, res) => {

    // category
    await oracledb.getConnection(dbConfig).then(async (conn) => {
        const r = await conn.execute("INSERT INTO categoria VALUES (:0, :1)",
            [req.body.code, req.body.name], { autoCommit: true });
    });

    let result;
    let queryy = await oracledb.getConnection(dbConfig).then(async (conn) => {
        result = await conn.execute('SELECT * FROM categoria');
    });

    res.render("listcategory", { title: "Categorías", tabla: result });
});

// Page home
app.use('/home', async (req, res) => {

    const no_students = await query(`SELECT * FROM alumno`, res);
    const no_books = await query(`SELECT * FROM libros`, res);
    const no_prestamos = await query(`SELECT * FROM prestamo`, res);
    const no_categorias = await query(`SELECT * FROM categoria`, res);
    const no_docentes = await query(`SELECT * FROM docente`, res);
    const no_admin = await query(`SELECT * FROM administrador`, res);

    res.render("home", {
        title: "Inicio",
        no_students: no_students.rows,
        no_books: no_books.rows,
        no_prestamos: no_prestamos.rows,
        no_categorias: no_categorias.rows,
        no_docentes: no_docentes.rows,
        no_admin: no_admin.rows,
    });
});

// Page index
app.use('/index', (req, res) => {
    res.render("index", { title: "Inicio de sesión" });
});

// Page listpersonal
app.use('/institution', (req, res) => {
    res.render("institution", { title: "Institución" });
});

// Page listadmin
app.use('/listadmin', async (req, res) => {

    let result;
    await oracledb.getConnection(dbConfig).then(async (conn) => {
        result = await conn.execute('SELECT * FROM Administrador join usuario on usuario.matricula = administrador.matricula');
    });

    res.render("listadmin", { title: "Administradores", tabla: result.rows });
});

// Page listcategory
app.use('/listcategory', async (req, res) => {

    let result;
    await oracledb.getConnection(dbConfig).then(async (conn) => {
        result = await conn.execute('SELECT * FROM categoria');
    });

    res.render("listcategory", { title: "Categorías", tabla: result.rows });
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
app.use('/liststudent', async (req, res) => {

    let result;
    let query = await oracledb.getConnection(dbConfig).then(async (conn) => {
        result = await conn.execute('SELECT * FROM usuario join alumno on usuario.matricula = alumno.matricula join direcciones on direcciones.direccion_id = usuario.direccion_id');
    });

    //console.log(result);
    res.render("liststudent", { title: "Estudiantes", tabla: result.rows });
});

app.post('/astudent', urlencodedParser, async (req, res) => {

    const x = await query(`SELECT * FROM usuario join alumno on usuario.matricula = alumno.matricula join direcciones on direcciones.direccion_id = usuario.direccion_id WHERE alumno.matricula = ${req.body.user}`, res); // Query
    console.log(x.rows);
    if (x.rows.length == 1) { // verify user
        res.render("astudent", { title: "student", tabla: x.rows });
    }
});

// Page liststteacher
app.use('/listteacher', async (req, res) => {

    let result;
    let query = await oracledb.getConnection(dbConfig).then(async (conn) => {
        result = await conn.execute('SELECT * FROM usuario join docente on usuario.matricula = docente.matricula join direcciones on direcciones.direccion_id = usuario.direccion_id');
    });

    //console.log(result);
    res.render("listteacher", { title: "Docentes", tabla: result.rows });
});

// Register teacher
app.post('/listteacher', urlencodedParser, async (req, res) => {
    console.log(req.body);
    let dir_id = Math.floor(Math.random() * 100000);
    let fecha = new Date(req.body.fecha);
    let fech = fecha.getDate() + "-" + fecha.getMonth() + "-" + fecha.getFullYear();

    // direction
    await oracledb.getConnection(dbConfig).then(async (conn) => {
        const r = await conn.execute("INSERT INTO direcciones VALUES (:0, :1, :2, :3)",
            [dir_id, req.body.calle, req.body.numero, req.body.cp], { autoCommit: true });
    });

    // user
    await oracledb.getConnection(dbConfig).then(async (conn) => {
        const r = await conn.execute("INSERT INTO usuario VALUES (:0, :1, :2, :3, :4, :5, :6)",
            [req.body.matricula, req.body.contrasena, dir_id, req.body.nombre, req.body.apellido,
                fech, req.body.telefono], { autoCommit: true });
    });

    // teacher
    await oracledb.getConnection(dbConfig).then(async (conn) => {
        const r = await conn.execute("INSERT INTO docente VALUES (:0, :1)",
            [req.body.matricula, req.body.materia], { autoCommit: true });
    });

    let result;
    let queryy = await oracledb.getConnection(dbConfig).then(async (conn) => {
        result = await conn.execute('SELECT * FROM usuario join docente on usuario.matricula = docente.matricula join direcciones on direcciones.direccion_id = usuario.direccion_id');
    });

    res.render("listteacher", { title: "Docentes", tabla: result });
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

// Page students
app.use('/student', (req, res) => {
    res.render("student", { title: "Estudiantes" });
});

// Register student
app.post('/liststudent', urlencodedParser, async (req, res) => {

    let dir_id = Math.floor(Math.random() * 100000);
    let fecha = new Date(req.body.fecha);
    let fech = fecha.getDate() + "-" + fecha.getMonth() + "-" + fecha.getFullYear();

    // direction
    let query = await oracledb.getConnection(dbConfig).then(async (conn) => {
        const r = await conn.execute("INSERT INTO direcciones VALUES (:0, :1, :2, :3)",
            [dir_id, req.body.calle, req.body.numero, req.body.cp], { autoCommit: true });
    });

    // user
    let mer = await oracledb.getConnection(dbConfig).then(async (conn) => {
        const r = await conn.execute("INSERT INTO usuario VALUES (:0, :1, :2, :3, :4, :5, :6)",
            [req.body.matricula, req.body.contrasena, dir_id, req.body.nombre, req.body.apellido,
                fech, req.body.telefono], { autoCommit: true });
    });

    // Alumno
    let merd = await oracledb.getConnection(dbConfig).then(async (conn) => {
        const r = await conn.execute("INSERT INTO alumno VALUES (:0, :1)",
            [req.body.matricula, req.body.carrera], { autoCommit: true });
    });

    //const c = await query(`INSERT INTO Alumno VALUES( ${req.body.matricula}, ${req.body.carrera} );`, res); // Register student

    let result;
    let queryy = await oracledb.getConnection(dbConfig).then(async (conn) => {
        result = await conn.execute('SELECT * FROM usuario join alumno on usuario.matricula = alumno.matricula join direcciones on direcciones.direccion_id = usuario.direccion_id');
    });

    res.render("liststudent", { title: "Estudiantes", tabla: result });
});

// Page teachers
app.use('/teacher', (req, res) => {
    res.render("teacher", { title: "Profesores" });
});

// Page 404 (Error: page not found)
app.use((req, res, next) => {
    res.status(404).render("404", { title: "Error" });
});