const pool = require('../config/db');
require('dotenv').config();

async function migrate() {
    const connection = await pool.getConnection();
    try {
        console.log(' Running migrations...');

        await connection.query(`
            CREATE TABLE IF NOT EXISTS users (
                UserId VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
                UserName VARCHAR(100) UNIQUE,
                firstName VARCHAR(50),
                lastName VARCHAR(50),
                email VARCHAR(100) UNIQUE,
                password VARCHAR(60),
                AccountCreationDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB
        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS content (
                ContentID INT PRIMARY KEY AUTO_INCREMENT,
                Title VARCHAR(100),
                Description VARCHAR(1000),
                ReleaseDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                Duration INT,
                Type ENUM('Movie','Serie') NOT NULL,
                INDEX idx_content_type (Type)
            ) ENGINE=InnoDB
        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS Genre (
                GenreID INT PRIMARY KEY AUTO_INCREMENT,
                GenreName ENUM('Action','Comedy','Love','Horror','Thriller','Science','Politics','Education','Hacking') NOT NULL,
                isTheBest VARCHAR(50)
            ) ENGINE=InnoDB
        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS Actors (
                ActorID INT PRIMARY KEY AUTO_INCREMENT,
                Name VARCHAR(100),
                BirthDate DATE,
                Bio VARCHAR(2000)
            ) ENGINE=InnoDB
        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS RefreshTokens (
                TokenID INT PRIMARY KEY AUTO_INCREMENT,
                UserID VARCHAR(36) NOT NULL,
                Token VARCHAR(512) NOT NULL UNIQUE,
                ExpiresAt DATETIME NOT NULL,
                CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (UserID) REFERENCES users(UserId) ON DELETE CASCADE
            ) ENGINE=InnoDB
        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS Content_Genre (
                ContentID INT NOT NULL,
                GenreID INT NOT NULL,
                PRIMARY KEY (ContentID, GenreID),
                FOREIGN KEY (ContentID) REFERENCES content(ContentID) ON DELETE CASCADE,
                FOREIGN KEY (GenreID) REFERENCES Genre(GenreID) ON DELETE CASCADE
            ) ENGINE=InnoDB
        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS Content_Actors (
                ContentID INT NOT NULL,
                ActorID INT NOT NULL,
                Role VARCHAR(100),
                PRIMARY KEY (ContentID, ActorID),
                FOREIGN KEY (ContentID) REFERENCES content(ContentID) ON DELETE CASCADE,
                FOREIGN KEY (ActorID) REFERENCES Actors(ActorID) ON DELETE CASCADE
            ) ENGINE=InnoDB
        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS WatchLists (
                listID INT PRIMARY KEY AUTO_INCREMENT,
                UserID VARCHAR(36),
                ContentID INT,
                UNIQUE KEY uq_watchlist (UserID, ContentID),
                FOREIGN KEY (UserID) REFERENCES users(UserId) ON DELETE CASCADE,
                FOREIGN KEY (ContentID) REFERENCES content(ContentID)
            ) ENGINE=InnoDB
        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS ViewingHistory (
                HistoryID INT PRIMARY KEY AUTO_INCREMENT,
                UserID VARCHAR(36),
                ContentID INT,
                TimeViewed TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                Duration INT,
                IsFinished BOOLEAN,
                FOREIGN KEY (UserID) REFERENCES users(UserId) ON DELETE CASCADE,
                FOREIGN KEY (ContentID) REFERENCES content(ContentID)
            ) ENGINE=InnoDB
        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS Ratings (
                RatingID INT PRIMARY KEY AUTO_INCREMENT,
                UserID VARCHAR(36),
                ContentID INT,
                RatingScore INT,
                Comment VARCHAR(100),
                UNIQUE KEY uq_user_content_rating (UserID, ContentID),
                FOREIGN KEY (UserID) REFERENCES users(UserId) ON DELETE CASCADE,
                FOREIGN KEY (ContentID) REFERENCES content(ContentID),
                CONSTRAINT chk_rating CHECK (RatingScore BETWEEN 1 AND 10)
            ) ENGINE=InnoDB
        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS Likes (
                LikeID INT PRIMARY KEY AUTO_INCREMENT,
                UserID VARCHAR(36) NOT NULL,
                ContentID INT NOT NULL,
                LikedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE KEY uq_user_content (UserID, ContentID),
                FOREIGN KEY (UserID) REFERENCES users(UserId) ON DELETE CASCADE,
                FOREIGN KEY (ContentID) REFERENCES content(ContentID) ON DELETE CASCADE
            ) ENGINE=InnoDB
        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS Seasons (
                SeasonID INT PRIMARY KEY AUTO_INCREMENT,
                ContentID INT NOT NULL,
                SeasonNumber INT NOT NULL,
                Title VARCHAR(100),
                ReleaseDate DATE,
                FOREIGN KEY (ContentID) REFERENCES content(ContentID) ON DELETE CASCADE
            ) ENGINE=InnoDB
        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS Episodes (
                EpisodeID INT PRIMARY KEY AUTO_INCREMENT,
                SeasonID INT NOT NULL,
                EpisodeNumber INT NOT NULL,
                Title VARCHAR(100),
                Duration INT,
                ReleaseDate DATE,
                FOREIGN KEY (SeasonID) REFERENCES Seasons(SeasonID) ON DELETE CASCADE
            ) ENGINE=InnoDB
        `);
        await connection.query(`
    CREATE TABLE IF NOT EXISTS PasswordResets (
        ResetID   INT PRIMARY KEY AUTO_INCREMENT,
        UserID    VARCHAR(36) NOT NULL,
        Token     VARCHAR(255) NOT NULL UNIQUE,
        ExpiresAt DATETIME NOT NULL,
        Used      BOOLEAN DEFAULT FALSE,
        CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (UserID) REFERENCES users(UserId) ON DELETE CASCADE
    ) ENGINE=InnoDB
`);


        console.log('All tables created successfully.');
    } catch (err) {
        console.error(' Migration failed:', err.message);
    } finally {
        connection.release();
        process.exit();
    }
}

migrate();