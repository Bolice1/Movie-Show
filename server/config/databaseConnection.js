const mysql = require("mysql2/promise");

// let us connect to mysql database 

async function connectTodb() {
    let connect = null; // Initialize to null

    try {
        // Await the connection promise and pass the config object correctly
        connect = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

        const [rows, fields] = await connect.execute("SELECT * FROM users"); // Added space in query

        console.log(rows);
        return rows;

    } catch(error) {
        console.error(`Error occurred: \n${error}`);
        throw error; // Re-throw the error for the caller to handle

    } finally {
        if (connect) { // Check if connection exists
            await connect.end(); // Call the end method and await it
            console.log("Database connection ended.");
        }
    }
}

// Call the function and handle potential errors outside the async function
connectTodb().catch(error => console.log(`Error: ${error}`));
