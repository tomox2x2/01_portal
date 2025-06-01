drop table portal.T_PARAMETER ;
create table portal.T_PARAMETER (
	PARAMID   varchar(5) not null,
    PARAMNAME varchar(255) not null,
    PARAM1    varchar(255) ,
    PARAM2    varchar(255) ,
    PARAM3    varchar(255) ,
    PARAM4    varchar(255) ,
    PARAM5    varchar(255) ,
    DESCNT    varchar(1000) 
);

alter table portal.T_PARAMETER add unique PK_T_PARAMETER_1( PARAMID );
