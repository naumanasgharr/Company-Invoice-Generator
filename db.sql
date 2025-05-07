-- MySQL dump 10.13  Distrib 8.0.41, for Linux (x86_64)
--
-- Host: localhost    Database: customer_manager_db
-- ------------------------------------------------------
-- Server version	8.0.41-0ubuntu0.24.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `balance_table`
--

DROP TABLE IF EXISTS `balance_table`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `balance_table` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_detail_id` int NOT NULL,
  `article_id` int NOT NULL,
  `balance` bigint NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `order_detail_id` (`order_detail_id`),
  KEY `article_id` (`article_id`),
  CONSTRAINT `balance_table_ibfk_1` FOREIGN KEY (`order_detail_id`) REFERENCES `orderdetail_table` (`id`) ON DELETE CASCADE,
  CONSTRAINT `balance_table_ibfk_2` FOREIGN KEY (`article_id`) REFERENCES `customer_article` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `balance_table`
--

LOCK TABLES `balance_table` WRITE;
/*!40000 ALTER TABLE `balance_table` DISABLE KEYS */;
/*!40000 ALTER TABLE `balance_table` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `update_order_status` AFTER UPDATE ON `balance_table` FOR EACH ROW BEGIN
  IF NEW.balance = 0 THEN
    UPDATE orderdetail_table SET status = 'COMPLETED' WHERE id = NEW.order_detail_id;
  END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `commercial_invoice_article_table`
--

DROP TABLE IF EXISTS `commercial_invoice_article_table`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `commercial_invoice_article_table` (
  `id` int NOT NULL AUTO_INCREMENT,
  `invoice_number` int DEFAULT NULL,
  `article_id` int DEFAULT NULL,
  `article_amount` varchar(50) DEFAULT NULL,
  `cartons` int DEFAULT NULL,
  `unit_price` varchar(100) DEFAULT NULL,
  `carton_gross_weight` varchar(50) DEFAULT NULL,
  `carton_net_weight` varchar(50) DEFAULT NULL,
  `currency` varchar(20) DEFAULT NULL,
  `carton_packing` int DEFAULT NULL,
  `carton_packing_unit` varchar(15) DEFAULT NULL,
  `order_id` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `invoice_number` (`invoice_number`),
  KEY `article_id` (`article_id`),
  CONSTRAINT `commercial_invoice_article_table_ibfk_1` FOREIGN KEY (`invoice_number`) REFERENCES `commercial_invoice_table` (`invoice_number`) ON DELETE CASCADE,
  CONSTRAINT `commercial_invoice_article_table_ibfk_2` FOREIGN KEY (`article_id`) REFERENCES `customer_article` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `commercial_invoice_article_table`
--

LOCK TABLES `commercial_invoice_article_table` WRITE;
/*!40000 ALTER TABLE `commercial_invoice_article_table` DISABLE KEYS */;
/*!40000 ALTER TABLE `commercial_invoice_article_table` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `commercial_invoice_table`
--

DROP TABLE IF EXISTS `commercial_invoice_table`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `commercial_invoice_table` (
  `invoice_number` int NOT NULL AUTO_INCREMENT,
  `customer_id` int DEFAULT NULL,
  `fiNo` varchar(40) DEFAULT NULL,
  `blNo` varchar(50) DEFAULT NULL,
  `fiNoDate` varchar(20) DEFAULT NULL,
  `blNoDate` varchar(20) DEFAULT NULL,
  `loadingPort` varchar(40) DEFAULT NULL,
  `shippingPort` varchar(40) DEFAULT NULL,
  `total` bigint DEFAULT NULL,
  `total_net_weight` varchar(50) DEFAULT NULL,
  `total_gross_weight` varchar(50) DEFAULT NULL,
  `shipment_terms` varchar(10) DEFAULT NULL,
  `date` varchar(20) DEFAULT NULL,
  `shipment_date` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`invoice_number`),
  KEY `customer_id` (`customer_id`),
  CONSTRAINT `commercial_invoice_table_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customer_table` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=222222 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `commercial_invoice_table`
--

LOCK TABLES `commercial_invoice_table` WRITE;
/*!40000 ALTER TABLE `commercial_invoice_table` DISABLE KEYS */;
/*!40000 ALTER TABLE `commercial_invoice_table` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customer_article`
--

DROP TABLE IF EXISTS `customer_article`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customer_article` (
  `id` int NOT NULL AUTO_INCREMENT,
  `customer_id` int DEFAULT NULL,
  `product_id` int DEFAULT NULL,
  `article_number` varchar(255) DEFAULT NULL,
  `unit_packing` int DEFAULT NULL,
  `carton_packing` int DEFAULT NULL,
  `carton_length` varchar(50) DEFAULT NULL,
  `carton_width` varchar(50) DEFAULT NULL,
  `carton_height` varchar(50) DEFAULT NULL,
  `carton_packing_type` varchar(10) DEFAULT NULL,
  `unit_packing_type` varchar(10) DEFAULT NULL,
  `hs_code` varchar(100) DEFAULT NULL,
  `description` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `customer_id` (`customer_id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `customer_article_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customer_table` (`id`),
  CONSTRAINT `customer_article_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `product_table` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customer_article`
--

LOCK TABLES `customer_article` WRITE;
/*!40000 ALTER TABLE `customer_article` DISABLE KEYS */;
/*!40000 ALTER TABLE `customer_article` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customer_table`
--

DROP TABLE IF EXISTS `customer_table`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customer_table` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `phone_number` varchar(100) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `address` varchar(200) DEFAULT NULL,
  `country` varchar(100) DEFAULT NULL,
  `VAT_number` varchar(100) DEFAULT NULL,
  `office_number` varchar(100) DEFAULT NULL,
  `website` varchar(100) DEFAULT NULL,
  `PO_box` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `shipping_port` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=100003 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customer_table`
--

LOCK TABLES `customer_table` WRITE;
/*!40000 ALTER TABLE `customer_table` DISABLE KEYS */;
INSERT INTO `customer_table` VALUES (100001,'Fitzner Global','0049-0-574293903','info@fitzner.de','Schillerstrabe 53 32361 Per oldendorf ','Germany','DE125748681','','www.fitzner.de','','2025-04-18 21:55:08','Hamburg');
/*!40000 ALTER TABLE `customer_table` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `invoice_table`
--

DROP TABLE IF EXISTS `invoice_table`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `invoice_table` (
  `invoice_number` bigint NOT NULL AUTO_INCREMENT,
  `customer_id` int DEFAULT NULL,
  `order_date` varchar(100) DEFAULT NULL,
  `shipping_date` varchar(100) DEFAULT NULL,
  `loading_port` varchar(100) DEFAULT NULL,
  `total` varchar(100) DEFAULT NULL,
  `shipping_port` varchar(100) DEFAULT NULL,
  `timestamp_column` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`invoice_number`),
  UNIQUE KEY `invoice_number` (`invoice_number`),
  KEY `customer_id` (`customer_id`),
  CONSTRAINT `invoice_table_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customer_table` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=222223 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `invoice_table`
--

LOCK TABLES `invoice_table` WRITE;
/*!40000 ALTER TABLE `invoice_table` DISABLE KEYS */;
INSERT INTO `invoice_table` VALUES (222222,100001,'2025-05-01','','','1200.00','Hamburg','2025-04-23 16:53:37');
/*!40000 ALTER TABLE `invoice_table` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_table`
--

DROP TABLE IF EXISTS `order_table`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_table` (
  `id` int NOT NULL AUTO_INCREMENT,
  `invoice_number` bigint DEFAULT NULL,
  `order_number` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `invoice_number` (`invoice_number`),
  CONSTRAINT `order_table_ibfk_1` FOREIGN KEY (`invoice_number`) REFERENCES `invoice_table` (`invoice_number`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_table`
--

LOCK TABLES `order_table` WRITE;
/*!40000 ALTER TABLE `order_table` DISABLE KEYS */;
INSERT INTO `order_table` VALUES (1,222222,'5');
/*!40000 ALTER TABLE `order_table` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orderdetail_table`
--

DROP TABLE IF EXISTS `orderdetail_table`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orderdetail_table` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` int DEFAULT NULL,
  `article_id` int DEFAULT NULL,
  `article_amount` varchar(100) DEFAULT NULL,
  `unit_price` varchar(100) DEFAULT NULL,
  `currency` varchar(100) DEFAULT NULL,
  `status` varchar(10) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `article_id` (`article_id`),
  KEY `order_id` (`order_id`),
  CONSTRAINT `orderdetail_table_ibfk_2` FOREIGN KEY (`article_id`) REFERENCES `customer_article` (`id`) ON DELETE CASCADE,
  CONSTRAINT `orderdetail_table_ibfk_3` FOREIGN KEY (`order_id`) REFERENCES `order_table` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orderdetail_table`
--

LOCK TABLES `orderdetail_table` WRITE;
/*!40000 ALTER TABLE `orderdetail_table` DISABLE KEYS */;
/*!40000 ALTER TABLE `orderdetail_table` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_table`
--

DROP TABLE IF EXISTS `product_table`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_table` (
  `id` int NOT NULL AUTO_INCREMENT,
  `description` varchar(250) DEFAULT NULL,
  `hs_code` varchar(100) DEFAULT NULL,
  `size` varchar(100) DEFAULT NULL,
  `carton_length` varchar(50) DEFAULT NULL,
  `carton_width` varchar(50) DEFAULT NULL,
  `carton_height` varchar(50) DEFAULT NULL,
  `weight` varchar(50) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `unit_packing` int DEFAULT NULL,
  `carton_packing` int DEFAULT NULL,
  `category` varchar(100) DEFAULT NULL,
  `material_composition` varchar(255) DEFAULT NULL,
  `weight_packing_type` varchar(10) DEFAULT NULL,
  `unit_packing_type` varchar(10) DEFAULT NULL,
  `carton_packing_type` varchar(10) DEFAULT NULL,
  `weight_units` varchar(10) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_category` (`category`),
  CONSTRAINT `fk_category` FOREIGN KEY (`category`) REFERENCES `productcategory_table` (`product_category`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_table`
--

LOCK TABLES `product_table` WRITE;
/*!40000 ALTER TABLE `product_table` DISABLE KEYS */;
/*!40000 ALTER TABLE `product_table` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `productcategory_table`
--

DROP TABLE IF EXISTS `productcategory_table`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `productcategory_table` (
  `product_category` varchar(255) DEFAULT NULL,
  UNIQUE KEY `fk_category` (`product_category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `productcategory_table`
--

LOCK TABLES `productcategory_table` WRITE;
/*!40000 ALTER TABLE `productcategory_table` DISABLE KEYS */;
/*!40000 ALTER TABLE `productcategory_table` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
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

-- Dump completed on 2025-05-05 19:47:43
