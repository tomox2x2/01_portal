drop table portal.T_USERS ;
create table portal.T_USERS (
	USERID int not null auto_increment primary key,
	USERNAME varchar(255) not null,
	PASSWORD varchar(64) not null,
	MAILADD varchar(255) not null,
	LGINFAIL int,
	LGINTIME datetime,
        PASSSETDATE datetime,
        RESETFLG tinyint default 0
);
