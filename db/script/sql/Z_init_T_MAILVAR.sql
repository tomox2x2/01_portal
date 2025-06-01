delete from T_MAILVAR where MAILID = 'X0001';

insert into T_MAILVAR values ('X0001', 0, 'NewPass','新しい仮パスワード');

commit;