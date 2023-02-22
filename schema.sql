-- Healthcheck requires mysql user to be able to connect to the database
CREATE DATABASE IF NOT EXISTS proj_public_services;
USE proj_public_services;

CREATE USER 'mysql'@'localhost' identified BY '';

CREATE USER 'mysql'@'127.0.0.1' identified BY '';

 

-- mosquitto ACL

CREATE TABLE IF NOT EXISTS `users` (

  `id` int(11) NOT NULL AUTO_INCREMENT,

  `username` varchar(50) NOT NULL,

  `password_hash` varchar(240) NOT NULL,

  `role` varchar(20),

  PRIMARY KEY (`id`),

  UNIQUE KEY `username` (`username`)

) ENGINE=InnoDB DEFAULT CHARSET=utf8;

 

CREATE TABLE IF NOT EXISTS `acl` (

  `id` int(11) NOT NULL AUTO_INCREMENT,

  `username` varchar(50) NOT NULL,

  `topic` varchar(100) NOT NULL,

  `rw` int(1) NOT NULL,

  PRIMARY KEY (`id`),

  UNIQUE KEY `oneruleonly` (`username`, `topic`)

) ENGINE=InnoDB DEFAULT CHARSET=utf8;

 

-- You can generate the passwords by using pw-gen utility from https://github.com/iegomez/mosquitto-go-auth/tree/master/pw-gen

INSERT INTO `users`(`username`, `password_hash`, `role`) VALUES

('admin',                     'PBKDF2$sha512$100000$PJwV8tTrl0Aq+lbDfBq/1A==$DHEOovdlcHgToBtsQTm1YmswjM7ViINIplEqVcHKgqlTK80YDzV/6U/YZJDvE3IsueVnr4135H4ZHmcUdriADw==', 'admin'),

('mqtt-exporter-diagnostics', 'PBKDF2$sha512$100000$0HHV/h/VzEJxssKAoHcgag==$VbVySJ+7nUf8cG/ba5MRC4BLv2RcO8ck/dbe9D1Y6E3SzHY1auFIedouVt8SpVeUgLUd+eO6IBSsAkYJ/B+jZw==', 'user'),

('tensor-f2',                 'PBKDF2$sha512$100000$YhamHnx5laEcE1+Dv0rlNA==$lV8DFbmJFUpWP/lFa53ah/5Ozno6Gyv4w8LgyyjZRN19aHTdxefn9VapJua292oIhM4Upsqsj1cWJDQpRfszjg==', 'user'),

('tensor-f3',                 'PBKDF2$sha512$100000$ohIE4/pWShDPpk0fA7agBA==$ntK8SUA4zC+gFxH9C9k1KRCToOmWu0Kbz8FGq+J3V4O2JXsg8o2IycIFnFD3wxLPhbPKLUqEfwGp8Yr3FW1pAg==', 'user'),

('tensor-f4',                 'PBKDF2$sha512$100000$/PwrapRJZRruvPKh/5KY6Q==$05voF5o8qbnPpkOGeLR/cMk5I6Tq8mjVGXnN2FsmlTaAP0DRa8XLZr2O5QJwQozn+DxV5mJB77vR6HV90rmnRA==', 'user'),

('tensor-p1',                 'PBKDF2$sha512$100000$uXl4o7nI7fC0sSVKAj4u3A==$3D7OTJ/4bJOOpiqgg1x/fZNdup9pK78hIvtE7oHXKglgVzHQpL+1kNkflcjs9kfebm6r3lrGDzDZ+AjQ8GBeQA==', 'user');

 

INSERT INTO `acl`(`username`, `topic`, `rw`) VALUES

('admin', '#', 4), ('admin', '$SYS/#', 4),

('mqtt-exporter-diagnostics', 'nanoscope/#', 4),

('tensor-f2', 'nanoscope/tensor-f2/#', 4),

('tensor-f3', 'nanoscope/tensor-f3/#', 4),

('tensor-f4', 'nanoscope/tensor-f4/#', 4),

('tensor-p1', 'nanoscope/tensor-p1/#', 4);