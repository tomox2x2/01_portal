drop table portal.T_PASSHIS ;
create table portal.T_PASSHIS (
	USERID int not null ,
	HISNO int not null ,
	PASSWORD varchar(64) not null,
        PASSSETDATE datetime,

	primary key( USERID, HISNO )
);

