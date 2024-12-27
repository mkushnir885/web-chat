-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

SET GLOBAL event_scheduler = ON;

-- -----------------------------------------------------
-- Schema web_chat
-- -----------------------------------------------------
DROP SCHEMA IF EXISTS `web_chat` ;

-- -----------------------------------------------------
-- Schema web_chat
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `web_chat` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci ;
USE `web_chat` ;

-- -----------------------------------------------------
-- Table `web_chat`.`chat`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `web_chat`.`chat` ;

CREATE TABLE IF NOT EXISTS `web_chat`.`chat` (
                                                 `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
                                                 `name` VARCHAR(45) NOT NULL,
    PRIMARY KEY (`id`),
    UNIQUE INDEX `id_UNIQUE` (`id` ASC) VISIBLE,
    UNIQUE INDEX `name_UNIQUE` (`name` ASC) VISIBLE)
    ENGINE = InnoDB
    DEFAULT CHARACTER SET = utf8mb4
    COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `web_chat`.`user`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `web_chat`.`user` ;

CREATE TABLE IF NOT EXISTS `web_chat`.`user` (
                                                 `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
                                                 `nickname` VARCHAR(45) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    PRIMARY KEY (`id`),
    UNIQUE INDEX `id_UNIQUE` (`id` ASC) VISIBLE,
    UNIQUE INDEX `nickname_UNIQUE` (`nickname` ASC) VISIBLE)
    ENGINE = InnoDB
    DEFAULT CHARACTER SET = utf8mb4
    COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `web_chat`.`message`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `web_chat`.`message` ;

CREATE TABLE IF NOT EXISTS `web_chat`.`message` (
                                                    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
                                                    `body` VARCHAR(1024) NOT NULL,
    `timestamp` BIGINT NOT NULL,
    `chatId` INT UNSIGNED NOT NULL,
    `userId` INT UNSIGNED NULL DEFAULT NULL,
    PRIMARY KEY (`id`, `chatId`),
    UNIQUE INDEX `id_UNIQUE` (`id` ASC) VISIBLE,
    INDEX `fk_message_user_idx` (`userId` ASC) VISIBLE,
    INDEX `fk_message_chat_idx` (`chatId` ASC) VISIBLE,
    CONSTRAINT `fk_message_user`
    FOREIGN KEY (`userId`)
    REFERENCES `web_chat`.`user` (`id`)
    ON DELETE SET NULL,
    CONSTRAINT `fk_message_chat`
    FOREIGN KEY (`chatId`)
    REFERENCES `web_chat`.`chat` (`id`)
    ON DELETE CASCADE
    ON UPDATE RESTRICT)
    ENGINE = InnoDB
    DEFAULT CHARACTER SET = utf8mb4
    COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `web_chat`.`session`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `web_chat`.`session` ;

CREATE TABLE IF NOT EXISTS `web_chat`.`session` (
                                                    `token` VARCHAR(32) NOT NULL,
    `data` JSON NOT NULL,
    `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`token`),
    UNIQUE INDEX `id_UNIQUE` (`token` ASC) VISIBLE)
    ENGINE = InnoDB
    DEFAULT CHARACTER SET = utf8mb4
    COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `web_chat`.`chatUser`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `web_chat`.`chatUser` ;

CREATE TABLE IF NOT EXISTS `web_chat`.`chatUser` (
                                                     `chatId` INT UNSIGNED NOT NULL,
                                                     `userId` INT UNSIGNED NOT NULL,
                                                     PRIMARY KEY (`chatId`, `userId`),
    INDEX `fk_chatUser_chat_idx` (`chatId` ASC) VISIBLE,
    INDEX `fk_chatUser_user_idx` (`userId` ASC) VISIBLE,
    CONSTRAINT `fk_chatUser_chat`
    FOREIGN KEY (`chatId`)
    REFERENCES `web_chat`.`chat` (`id`)
    ON DELETE RESTRICT
    ON UPDATE RESTRICT,
    CONSTRAINT `fk_chatUser_user`
    FOREIGN KEY (`userId`)
    REFERENCES `web_chat`.`user` (`id`)
    ON DELETE CASCADE
    ON UPDATE RESTRICT)
    ENGINE = InnoDB
    DEFAULT CHARACTER SET = utf8mb4
    COLLATE = utf8mb4_0900_ai_ci;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;


DELIMITER $$

CREATE TRIGGER delete_empty_chats
    AFTER DELETE ON chatUser
    FOR EACH ROW
BEGIN
    IF NOT EXISTS (SELECT 1 FROM chatUser WHERE chatId = OLD.chatId) THEN
    DELETE FROM chat WHERE id = OLD.chatId;
END IF;
END$$

DELIMITER $$

CREATE EVENT delete_old_sessions
ON SCHEDULE EVERY 1 DAY
DO
BEGIN
DELETE FROM session
WHERE createdAt < NOW() - INTERVAL 1 MONTH;
END$$

DELIMITER ;
