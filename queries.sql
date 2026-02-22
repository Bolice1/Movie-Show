/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19  Distrib 10.11.14-MariaDB, for debian-linux-gnu (x86_64)
--
-- Host: localhost    Database: Movie_Show
-- ------------------------------------------------------
-- Server version	10.11.14-MariaDB-0ubuntu0.24.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `Actors`
--

DROP TABLE IF EXISTS `Actors`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Actors` (
  `ActorID` int(11) NOT NULL AUTO_INCREMENT,
  `Name` varchar(100) DEFAULT NULL,
  `BirthDate` date DEFAULT NULL,
  `Bio` varchar(2000) DEFAULT NULL,
  PRIMARY KEY (`ActorID`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Actors`
--

LOCK TABLES `Actors` WRITE;
/*!40000 ALTER TABLE `Actors` DISABLE KEYS */;
INSERT INTO `Actors` VALUES
(1,'Leonardo DiCaprio','1974-11-11','Oscar-winning American actor.'),
(2,'Scarlett Johansson','1984-11-22','Actress known for Marvel roles.'),
(3,'Morgan Freeman','1937-06-01','Iconic voice and veteran actor.');
/*!40000 ALTER TABLE `Actors` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Content_Actors`
--

DROP TABLE IF EXISTS `Content_Actors`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Content_Actors` (
  `ContentID` int(11) NOT NULL,
  `ActorID` int(11) NOT NULL,
  `Role` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`ContentID`,`ActorID`),
  KEY `ActorID` (`ActorID`),
  CONSTRAINT `Content_Actors_ibfk_1` FOREIGN KEY (`ContentID`) REFERENCES `content` (`ContentID`) ON DELETE CASCADE,
  CONSTRAINT `Content_Actors_ibfk_2` FOREIGN KEY (`ActorID`) REFERENCES `Actors` (`ActorID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Content_Actors`
--

LOCK TABLES `Content_Actors` WRITE;
/*!40000 ALTER TABLE `Content_Actors` DISABLE KEYS */;
INSERT INTO `Content_Actors` VALUES
(1,1,'Cobb'),
(1,2,'Ariadne'),
(3,1,'Bruce Wayne');
/*!40000 ALTER TABLE `Content_Actors` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Content_Genre`
--

DROP TABLE IF EXISTS `Content_Genre`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Content_Genre` (
  `ContentID` int(11) NOT NULL,
  `GenreID` int(11) NOT NULL,
  PRIMARY KEY (`ContentID`,`GenreID`),
  KEY `GenreID` (`GenreID`),
  CONSTRAINT `Content_Genre_ibfk_1` FOREIGN KEY (`ContentID`) REFERENCES `content` (`ContentID`) ON DELETE CASCADE,
  CONSTRAINT `Content_Genre_ibfk_2` FOREIGN KEY (`GenreID`) REFERENCES `Genre` (`GenreID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Content_Genre`
--

LOCK TABLES `Content_Genre` WRITE;
/*!40000 ALTER TABLE `Content_Genre` DISABLE KEYS */;
INSERT INTO `Content_Genre` VALUES
(1,1),
(1,2),
(2,2),
(3,1);
/*!40000 ALTER TABLE `Content_Genre` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Episodes`
--

DROP TABLE IF EXISTS `Episodes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Episodes` (
  `EpisodeID` int(11) NOT NULL AUTO_INCREMENT,
  `SeasonID` int(11) NOT NULL,
  `EpisodeNumber` int(11) NOT NULL,
  `Title` varchar(100) DEFAULT NULL,
  `Duration` int(11) DEFAULT NULL,
  `ReleaseDate` date DEFAULT NULL,
  PRIMARY KEY (`EpisodeID`),
  KEY `SeasonID` (`SeasonID`),
  CONSTRAINT `Episodes_ibfk_1` FOREIGN KEY (`SeasonID`) REFERENCES `Seasons` (`SeasonID`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Episodes`
--

LOCK TABLES `Episodes` WRITE;
/*!40000 ALTER TABLE `Episodes` DISABLE KEYS */;
INSERT INTO `Episodes` VALUES
(1,1,1,'Pilot',58,'2008-01-20'),
(2,1,2,'Cat\'s in the Bag',48,'2008-01-27'),
(3,2,1,'Seven Thirty-Seven',47,'2009-03-08');
/*!40000 ALTER TABLE `Episodes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Genre`
--

DROP TABLE IF EXISTS `Genre`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Genre` (
  `GenreID` int(11) NOT NULL AUTO_INCREMENT,
  `GenreName` enum('Action','Comedy','Love','Horror','Thriller','Science','Politics','Education','Hacking') NOT NULL,
  `isTheBest` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`GenreID`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Genre`
--

LOCK TABLES `Genre` WRITE;
/*!40000 ALTER TABLE `Genre` DISABLE KEYS */;
INSERT INTO `Genre` VALUES
(1,'Action','Yes'),
(2,'Thriller','No'),
(3,'Comedy','No');
/*!40000 ALTER TABLE `Genre` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Likes`
--

DROP TABLE IF EXISTS `Likes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Likes` (
  `LikeID` int(11) NOT NULL AUTO_INCREMENT,
  `UserID` varchar(36) NOT NULL,
  `ContentID` int(11) NOT NULL,
  `LikedAt` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`LikeID`),
  UNIQUE KEY `uq_user_content` (`UserID`,`ContentID`),
  KEY `ContentID` (`ContentID`),
  CONSTRAINT `Likes_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `users` (`UserId`) ON DELETE CASCADE,
  CONSTRAINT `Likes_ibfk_2` FOREIGN KEY (`ContentID`) REFERENCES `content` (`ContentID`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Likes`
--

LOCK TABLES `Likes` WRITE;
/*!40000 ALTER TABLE `Likes` DISABLE KEYS */;
INSERT INTO `Likes` VALUES
(1,'b863eb4b-0f0b-11f1-8db0-5254006ea6d3',1,'2026-02-21 09:57:23');
/*!40000 ALTER TABLE `Likes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Ratings`
--

DROP TABLE IF EXISTS `Ratings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Ratings` (
  `RatingID` int(11) NOT NULL AUTO_INCREMENT,
  `UserID` varchar(39) DEFAULT NULL,
  `ContentID` int(11) DEFAULT NULL,
  `RatingScore` int(11) DEFAULT NULL,
  `Comment` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`RatingID`),
  UNIQUE KEY `uq_user_content_rating` (`UserID`,`ContentID`),
  KEY `ContentID` (`ContentID`),
  KEY `idx_ratings_score` (`RatingScore`),
  CONSTRAINT `Ratings_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `users` (`UserId`) ON DELETE CASCADE,
  CONSTRAINT `Ratings_ibfk_2` FOREIGN KEY (`ContentID`) REFERENCES `content` (`ContentID`),
  CONSTRAINT `chk_rating` CHECK (`RatingScore` between 1 and 10)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Ratings`
--

LOCK TABLES `Ratings` WRITE;
/*!40000 ALTER TABLE `Ratings` DISABLE KEYS */;
INSERT INTO `Ratings` VALUES
(1,'b863eb4b-0f0b-11f1-8db0-5254006ea6d3',1,9,'Mind-blowing!');
/*!40000 ALTER TABLE `Ratings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `RefreshTokens`
--

DROP TABLE IF EXISTS `RefreshTokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `RefreshTokens` (
  `TokenID` int(11) NOT NULL AUTO_INCREMENT,
  `UserID` varchar(36) NOT NULL,
  `Token` varchar(512) NOT NULL,
  `ExpiresAt` datetime NOT NULL,
  `CreatedAt` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`TokenID`),
  UNIQUE KEY `Token` (`Token`),
  KEY `UserID` (`UserID`),
  CONSTRAINT `RefreshTokens_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `users` (`UserId`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `RefreshTokens`
--

LOCK TABLES `RefreshTokens` WRITE;
/*!40000 ALTER TABLE `RefreshTokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `RefreshTokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Seasons`
--

DROP TABLE IF EXISTS `Seasons`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Seasons` (
  `SeasonID` int(11) NOT NULL AUTO_INCREMENT,
  `ContentID` int(11) NOT NULL,
  `SeasonNumber` int(11) NOT NULL,
  `Title` varchar(100) DEFAULT NULL,
  `ReleaseDate` date DEFAULT NULL,
  PRIMARY KEY (`SeasonID`),
  KEY `ContentID` (`ContentID`),
  CONSTRAINT `Seasons_ibfk_1` FOREIGN KEY (`ContentID`) REFERENCES `content` (`ContentID`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Seasons`
--

LOCK TABLES `Seasons` WRITE;
/*!40000 ALTER TABLE `Seasons` DISABLE KEYS */;
INSERT INTO `Seasons` VALUES
(1,2,1,'Season 1','2008-01-20'),
(2,2,2,'Season 2','2009-03-08');
/*!40000 ALTER TABLE `Seasons` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ViewingHistory`
--

DROP TABLE IF EXISTS `ViewingHistory`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `ViewingHistory` (
  `HistoryID` int(11) NOT NULL AUTO_INCREMENT,
  `UserID` varchar(39) DEFAULT NULL,
  `ContentID` int(11) DEFAULT NULL,
  `TimeViewed` timestamp NULL DEFAULT current_timestamp(),
  `Duration` int(11) DEFAULT NULL,
  `IsFinished` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`HistoryID`),
  KEY `ContentID` (`ContentID`),
  KEY `ViewingHistory_ibfk_1` (`UserID`),
  CONSTRAINT `ViewingHistory_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `users` (`UserId`) ON DELETE CASCADE,
  CONSTRAINT `ViewingHistory_ibfk_2` FOREIGN KEY (`ContentID`) REFERENCES `content` (`ContentID`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ViewingHistory`
--

LOCK TABLES `ViewingHistory` WRITE;
/*!40000 ALTER TABLE `ViewingHistory` DISABLE KEYS */;
INSERT INTO `ViewingHistory` VALUES
(1,'b863eb4b-0f0b-11f1-8db0-5254006ea6d3',3,'2026-02-21 09:57:23',152,1);
/*!40000 ALTER TABLE `ViewingHistory` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `WatchLists`
--

DROP TABLE IF EXISTS `WatchLists`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `WatchLists` (
  `listID` int(11) NOT NULL AUTO_INCREMENT,
  `UserID` varchar(39) DEFAULT NULL,
  `ContentID` int(11) DEFAULT NULL,
  PRIMARY KEY (`listID`),
  UNIQUE KEY `uq_watchlist` (`UserID`,`ContentID`),
  KEY `ContentID` (`ContentID`),
  CONSTRAINT `WatchLists_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `users` (`UserId`) ON DELETE CASCADE,
  CONSTRAINT `WatchLists_ibfk_2` FOREIGN KEY (`ContentID`) REFERENCES `content` (`ContentID`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `WatchLists`
--

LOCK TABLES `WatchLists` WRITE;
/*!40000 ALTER TABLE `WatchLists` DISABLE KEYS */;
INSERT INTO `WatchLists` VALUES
(1,'b863ee94-0f0b-11f1-8db0-5254006ea6d3',2);
/*!40000 ALTER TABLE `WatchLists` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `content`
--

DROP TABLE IF EXISTS `content`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `content` (
  `ContentID` int(11) NOT NULL AUTO_INCREMENT,
  `Title` varchar(100) DEFAULT NULL,
  `Description` varchar(1000) DEFAULT NULL,
  `ReleaseDate` timestamp NULL DEFAULT current_timestamp(),
  `Duration` int(11) DEFAULT NULL,
  `Type` enum('Movie','Serie') NOT NULL,
  PRIMARY KEY (`ContentID`),
  KEY `idx_content_type` (`Type`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `content`
--

LOCK TABLES `content` WRITE;
/*!40000 ALTER TABLE `content` DISABLE KEYS */;
INSERT INTO `content` VALUES
(1,'Inception','A thief who steals secrets through dreams.','2026-02-21 09:57:23',148,'Movie'),
(2,'Breaking Bad','A chemistry teacher turns to crime.','2026-02-21 09:57:23',47,'Serie'),
(3,'The Dark Knight','Batman faces the Joker in Gotham.','2026-02-21 09:57:23',152,'Movie');
/*!40000 ALTER TABLE `content` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `UserId` varchar(36) NOT NULL DEFAULT uuid(),
  `UserName` varchar(100) DEFAULT NULL,
  `firstName` varchar(50) DEFAULT NULL,
  `lastName` varchar(50) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `password` varchar(60) DEFAULT NULL,
  `AccountCreationDate` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`UserId`),
  UNIQUE KEY `UserName` (`UserName`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES
('b863eb4b-0f0b-11f1-8db0-5254006ea6d3','jdoe','John','Doe','john@example.com','$2b$10$placeholderhashforjdoe..','2026-02-21 09:57:23'),
('b863ee94-0f0b-11f1-8db0-5254006ea6d3','asmith','Alice','Smith','alice@example.com','$2b$10$placeholderhashforasmith','2026-02-21 09:57:23');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-02-22 17:22:12
