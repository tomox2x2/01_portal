drop table portal.T_MAILMST ;
create table portal.T_MAILMST (
	MAILID char(5) not null primary key,
	SUBJECT varchar(255),
	TEXT text,
	DESCNT varchar(255)
);

