drop table portal.T_MSTWORD ;
create table portal.T_MSTWORD (
	WORDID int not null auto_increment primary key,
	WORD text(65535) not null,
	WRITEN varchar(255) 
);
