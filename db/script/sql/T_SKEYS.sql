drop table portal.T_SKEYS ;
create table portal.T_SKEYS (
	ID varchar(255) not null,
	SECRETKEY varchar(255) not null,
	USERNAME_E varchar(255),
	MAKETIME datetime
);

alter table portal.T_SKEYS add unique PK_T_SKEYS_1( ID );