drop table portal.T_WORDPARDAY ;
create table portal.T_WORDPARDAY (
	USERID int not null ,
	WORDID int not null ,
	SETDATE datetime,
	primary key(USERID, WORDID)
);
