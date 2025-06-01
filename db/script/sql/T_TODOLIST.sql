drop table portal.T_TODOLIST ;
create table portal.T_TODOLIST (
	USERID int not null ,
	TODOID int not null,
	CATEGORY varchar(255),
	PRIORITY varchar(12),
	TITLE varchar(255) ,
	DETAIL text ,
	TDATE date not null,
	ALERTDATE date,
	DONE boolean
);

