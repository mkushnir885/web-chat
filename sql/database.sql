SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema web_chat
-- -----------------------------------------------------
DROP SCHEMA IF EXISTS web_chat ;

-- -----------------------------------------------------
-- Schema web_chat
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS web_chat DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci ;
USE web_chat ;

-- -----------------------------------------------------
-- Table web_chat.user
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS web_chat.user (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    nickname VARCHAR(45) NOT NULL,
    password VARCHAR(255) NOT NULL,
    PRIMARY KEY (id),
    UNIQUE INDEX id_UNIQUE (id ASC) VISIBLE,
    UNIQUE INDEX nickname_UNIQUE (nickname ASC) VISIBLE)
    ENGINE = InnoDB
    AUTO_INCREMENT = 12
    DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;

-- -----------------------------------------------------
-- Table web_chat.chat_message
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS web_chat.chat_message (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    body VARCHAR(1024) NOT NULL,
    time INT NOT NULL,
    user_id INT UNSIGNED NOT NULL,
    PRIMARY KEY (id, user_id),
    UNIQUE INDEX id_UNIQUE (id ASC) VISIBLE,
    INDEX fk_chat_message_user1_idx (user_id ASC) VISIBLE,
    UNIQUE INDEX user_id_UNIQUE (user_id ASC) VISIBLE,
    CONSTRAINT fk_chat_message_user1
    FOREIGN KEY (user_id)
    REFERENCES web_chat.user (id)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
    ENGINE = InnoDB
    DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;

-- -----------------------------------------------------
-- Table web_chat.session
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS web_chat.session (
    token VARCHAR(32) NOT NULL,
    data JSON NOT NULL,
    PRIMARY KEY (token),
    UNIQUE INDEX id_UNIQUE (token ASC) VISIBLE)
    ENGINE = InnoDB
    DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
