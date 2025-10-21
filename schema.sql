-- Schema ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS Users (
    username     VARCHAR(50) PRIMARY KEY,
    password     VARCHAR(255) NOT NULL,
    firstname    VARCHAR(50)  NOT NULL,
    lastname     VARCHAR(50)  NOT NULL,
    salary       DECIMAL(12, 2) NOT NULL,
    age          INT NOT NULL,
    registerday  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    signintime   DATETIME DEFAULT NULL,
    INDEX idx_users_registerday (registerday),
    INDEX idx_users_signintime (signintime),
    INDEX idx_users_name (firstname, lastname),
    INDEX idx_users_salary (salary),
    INDEX idx_users_age (age)
);
