drop view portal.V_DIARYMONTH;
create view portal.V_DIARYMONTH as 
	select 
	  USERID                          as USERID,
	  date_format(CREATEDATE,'%Y.%m')  as CREATEMONTH,
	  count(*)                        as DIARYCNT
	from portal.T_DIARY
	group by
	  USERID,
	  date_format(CREATEDATE,'%Y.%m')
;