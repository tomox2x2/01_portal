drop table portal.T_TODOMST ;
create table portal.T_TODOMST (
	USERID int not null ,
	TODOID int not null,
	CATEGORY varchar(255),
	PRIORITY varchar(12),
	TITLE varchar(255) ,
	DETAIL text ,
	ALERTDAYS smallint,
	ABLE boolean 
);

alter table portal.T_TODOMST add unique PK_T_TODOMST_1( USERID, TODOID );
