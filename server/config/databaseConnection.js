const mysql = require("mysql2/promise");

// let us connect to mysql database 

async function connectTodb() {
    let connect = null; 

    try {
        connect = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

        const [rows, fields] = await connect.execute("SELECT * FROM users"); 

        console.log(rows);
        return rows;

    } catch(error) {
        console.error(`Error occurred: \n${error}`);
        throw error; 

    } finally {
        if (connect) { 
            await connect.end(); 
            console.log("Database connection ended.");
        }
    }
}

connectTodb().catch(error => console.log(`Error: ${error}`));
