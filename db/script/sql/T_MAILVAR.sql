drop table portal.T_MAILVAR ;
create table portal.T_MAILVAR (
	MAILID char(5) not null,
	VARID int not null,
	VARNAME varchar(255),
	DESCNT varchar(255)
);

alter table portal.T_MAILVAR add primary key ( MAILID, VARID );