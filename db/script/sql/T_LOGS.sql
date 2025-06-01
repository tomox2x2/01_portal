drop table portal.T_LOGS ;
create table portal.T_LOGS (
	USERID int,
	SCRID char(5) not null,
	ACTION varchar(64) not null,
	TIME datetime,
	STATE tinyint not null,
    DETAIL varchar(1000)
);
