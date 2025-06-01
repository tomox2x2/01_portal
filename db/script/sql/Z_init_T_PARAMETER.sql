delete from T_PARAMETER where PARAMID = 'D0001';
delete from T_PARAMETER where PARAMID = 'L0001';
delete from T_PARAMETER where PARAMID = 'L0002';
delete from T_PARAMETER where PARAMID = 'L0003';

insert into T_PARAMETER values ('D0001','CreateDateTargetMonths','0','2','','','','TodoList を作成する範囲月数を指定');
insert into T_PARAMETER values ('L0001','LoginFailCntMax','5','','','','','ログイン失敗を許容する回数');
insert into T_PARAMETER values ('L0002','LoginCngDayCnt','90','','','','','パスワードを変更するまでの日数');
insert into T_PARAMETER values ('L0003','PassHistoryCnt','10','','','','','パスワード履歴を保持する数');

commit;
