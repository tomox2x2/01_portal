drop table portal.T_TODOFREQ ;
create table portal.T_TODOFREQ (
	USERID int not null ,
	TODOID int not null,
	FREQTYPE tinyint not null,
	TDATE date,
	TMONTH tinyint ,
	TWEEK tinyint ,
	TWEEKDAY tinyint ,
	TDAY tinyint 
);

