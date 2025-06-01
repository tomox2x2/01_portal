drop view portal.V_TODOCATEGORY;
create view portal.V_TODOCATEGORY as 
	select distinct 
             USERID as USERID,
             CATEGORY as CATEGORY
	from T_TODOMST t1 
	where t1.CATEGORY is not null
	order by 1,2
;