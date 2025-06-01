drop table portal.T_DIARY ;
create table portal.T_DIARY (
	USERID  int not null,
	DIARYID int not null,
	TITLE   varchar(255) ,
	TEXT    text,
	CREATEDATE datetime,
	UPDATEDATE datetime,
	primary key( USERID, DIARYID )
);
