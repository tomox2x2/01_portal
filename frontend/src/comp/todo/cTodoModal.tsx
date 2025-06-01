import { useState,useEffect } from 'react'; 
import { useRecoilState } from 'recoil';
import { todoModalViewAtom } from '../../state/atom'; 
import { yupResolver } from '@hookform/resolvers/yup';
import yup from '../../yup/yup.jp';
import { useForm } from 'react-hook-form';
import Select from 'react-select';
import { connBackendPost } from '../../api/conn';
import { optionType, optionMonth, optionWeek, optionWeekDay, optionDay, todoDetail } from './cTodoOption';
import { screenInfo, screenAct } from '../../state/baseInfo';

// 内部フレーム共通CSS
const selectStyles ={
    control: (provided:any) => ({
        ...provided,
        backgrouondColor: '#333',
        border:'#222 solid 2px',
        margin: 'auto 10px',
        width: '100%',
        height: '42px',
        padding: '0px'
    }),

    option: (provided:any) => ({
        ...provided,
        margin: '0px',
        padding: '0px',
        height:'20px',
    }),

    valueContainer: (provided:any) => ({
        ...provided,
        padding: '0px 5px 0px 5px',
    }),
    multiValue: (provided:any) => ({
        ...provided,
        margin: '0px 5px',
        padding: '0px',
        fontSize: '17px',
    }),
    placeholder: (provided:any) => ({
        ...provided,
        height:'25px',
        padding:'0px 5px 0px 5px',
        fontSize: '15px',
    }),

    input: (provided:any) => ({
        ...provided,
        height:'25px',
        padding:'0px 5px 0px 5px',
    })
};

// yup 定義 ----------------------------------------------------------
// 日付入力チェック
const checkDate = yup
    .string()
    .test(
        'cycleDayCheck',
        ({label}) => `${label}を入力してください。`,
        function( this: yup.TestContext, tCheckTarget: string | undefined | null ) {
            const { cycles } = this.parent;
            switch ( cycles ) {
                case '1' :
                    if (tCheckTarget === '' ) return false;
                    return true;
                default :
                    return true;
            }
        }
    );

// 月入力チェック
const checkMonth = yup
    .array()
    .test(
        'cycleMonthCheck',
        ({label}) => `${label}を入力してください。`,
        function( this: yup.TestContext, tCheckTarget: optionType[] | undefined | null ) {
            const { tCycles } = this.parent;
            switch ( tCycles ) {
                case '3' :
                    if (tCheckTarget?.length == 0 ) return false;
                    return true;
                case '4' :
                    if (tCheckTarget?.length == 0 ) return false;
                    return true;
                default :
                    return true;
            }
        }
    );

// 週数入力チェック
const checkWeek = yup
    .array()
    .test(
        'cycleWeekCheck',
        ({label}) => `${label}を入力してください。`,
        function( this: yup.TestContext, tCheckTarget: optionType[] | undefined | null ) {
            const { tCycles } = this.parent;
            switch ( tCycles ) {
                case '4' :
                    if (tCheckTarget?.length == 0 ) return false;
                    return true;
                default :
                    return true;
            }
        }
    );

// 曜日入力チェック
const checkWeekDay = yup
    .array()
    .test(
        'cycleWeekDayCheck',
        ({label}) => `${label}を入力してください。`,
        function( this: yup.TestContext, tCheckTarget: optionType[] | undefined | null ) {
            const { tCycles } = this.parent;
            switch ( tCycles ) {
                case '2' :
                    if (tCheckTarget?.length == 0 ) return false;
                    return true;
                case '4' :
                    if (tCheckTarget?.length == 0 ) return false;
                    return true;
                default :
                    return true;
            }
        }
    );

// 日数入力チェック
const checkDay = yup
    .array()
    .test(
        'cycleDayCheck',
        ({label}) => `${label}を入力してください。`,
        function( this: yup.TestContext, tCheckTarget: optionType[] | undefined | null ) {
            const { tCycles } = this.parent;
            switch ( tCycles ) {
                case '3' :
                    if (tCheckTarget?.length == 0 ) return false;
                    return true;
                default :
                    return true;
            }
        }
    );

// yup 設定(Resoluver 設定用オブジェクト作成)
const schema = yup.object({
    category: yup.string().label('Cateroey欄').required(),
    priority: yup.string().label('Priority欄').required(),
    title: yup.string().label('Title欄').required(),
    text: yup.string().label('Text欄').required(),
    tCycles: yup.string().label('Cycle欄').required(),
    tDate: checkDate.label('Date欄'),
    tMonth: checkMonth.label('Month欄'),
    tWeek: checkWeek.label('Week欄'),
    tWeekDay: checkWeekDay.label('Weekday欄'),
    tDay: checkDay.label('Day欄'),
    tAlertDay: yup.number().integer().min(0).required(),
});

// コンポーネント定義 -------------------------------------------------------------------------------
export default function CompTodoModal() {

    // useState 定義
    // 入力欄保持用
    const [ todoAble, setTodoAble ] = useState(1);
    const [ todoCategory, setTodoCategory ] = useState('');
    const [ todoPriority, setTodoPriority ] = useState('');
    const [ todoTitle, setTodoTitle ] = useState('');
    const [ todoText, setTodoText ] = useState('');
    const [ todoDate, setTodoDate ] = useState('');
    const [ todoMonth, setTodoMonth ] = useState([]);
    const [ todoWeek, setTodoWeek ] = useState([]);
    const [ todoWeekDay, setTodoWeekDay ] = useState([]);
    const [ todoDay, setTodoDay ] = useState([]);
    const [ todoAlertDay, setTodoAlertDay ] = useState(0);

    // ラジオボタン・ボタン・更新制御
    const [ radioCycle, setRadioCycle ] = useState('');
    const [ disableInputDel, setDisableInputDel ] = useState(false);
    const [ disableInputClear, setDisableInputClear ] = useState(false);
    const [todoReload, setTodoReload] = useState(true);

    // useRecoil 定義
    // Modal.mode,id 設定
    const [ todoModalViewFlg, setTodoModalViewFlg ] = useRecoilState(todoModalViewAtom);


    // defaultValues 設定 ( useForm 設定用オブジェクト作成 )
    const defaultValues = {
        able:1,         category:'',
        priority:'',    title:'',
        text:'',        tCycles:'',
        tDate:'',       tMonth:[],
        tWeek:[],       tWeekDay:[],
        tDay:[],        tAlertDay: 0
    }

    // Values 設定 ( useForm 設定用オブジェクト作成 )
    const values = {
        able:todoAble,        category:todoCategory,
        priority:todoPriority,title:todoTitle,
        text:todoText,        tCycles:radioCycle,
        tDate:todoDate,       tMonth:todoMonth,
        tWeek:todoWeek,       tWeekDay:todoWeekDay,
        tDay:todoDay,         tAlertDay: todoAlertDay
    }

    // useForm 定義
    const { register, handleSubmit, reset,formState: {errors} } = useForm({
        defaultValues,
        values,
        resolver: yupResolver(schema),
    });

    // useEffect 定義 
    // Modal.mode 変更時            ：呼び出し時に getInit(Modal初期化) を実行
    // Modal中のラジオボタンクリック時：画面の再読み込みのみ実行
    useEffect(() => {
        if ( todoReload ) getInit();
    },[todoModalViewFlg.mode, radioCycle])

    // Modal 初期化メソッド
    const getInit = async () => {
        setTodoReload(false);
        try {
            switch ( todoModalViewFlg.mode ) {
                // 新規登録モード
                case 1 :
                    // delete ボタン非表示
                    setDisableInputDel(true);
                    break;
                // 更新モード
                case 2 :
                    // Clear ボタン非表示
                    setDisableInputClear(true);
                    // 該当 ID の基本情報取得
                    await connBackendPost('/todo/list/base',{id: todoModalViewFlg.id})
                    .then((rslt) => {
                        if ( rslt[0]) {
                            setTodoAble(rslt[0].ABLE);
                            setTodoCategory(rslt[0].CATEGORY);
                            setTodoPriority(rslt[0].PRIORITY);
                            setTodoTitle(rslt[0].TITLE);
                            setTodoText(rslt[0].DETAIL);
                            setTodoAlertDay(rslt[0].ALERTDAYS);
                        }
                    })
                    .catch((err) => console.log(err))

                    // 該当 ID の詳細情報取得
                    await connBackendPost('/todo/list/detail',{id: todoModalViewFlg.id})
                    .then((rslt) => {
                        setDetailItem(rslt);
                    })
                    .catch((err) => console.log(err))
                    break;
                default :
                    break;
            }
        } catch( error ) {
            console.error(error);
        }
    };

    // 詳細情報設定用メソッド
    const setDetailItem = (detailAry: todoDetail[]) =>{

        let tmpCyclesAry  :number[] = [];
        let tmpDateAry    :string[] = [];
        let tmpMonthAry   :string[] = [];
        let tmpWeekAry    :string[] = [];
        let tmpWeekdayAry :string[] = [];
        let tmpDayAry     :string[] = [];

        let tmpMonthOpt   :optionType | undefined;
        let tmpWeekOpt    :optionType | undefined;
        let tmpWeekdayOpt :optionType | undefined;
        let tmpDayOpt     :optionType | undefined;

        let tmpMonthOptAry   :optionType[] = [];
        let tmpWeekOptAry    :optionType[] = [];
        let tmpWeekdayOptAry :optionType[] = [];
        let tmpDayOptAry     :optionType[] = [];

        if ( !detailAry ) return;

        detailAry.forEach((t : todoDetail) => {

            if ( typeof(t.FREQTYPE) === 'number' && !tmpCyclesAry.includes(t.FREQTYPE)){
                tmpCyclesAry.push(t.FREQTYPE);
            };
            if ( typeof(t.TDATE)    === 'string' && !tmpDateAry.includes(t.TDATE)){
                tmpDateAry.push(t.TDATE);
            };
            if ( typeof(t.TMONTH)   === 'number' && !tmpMonthAry.includes(t.TMONTH.toString())){
                tmpMonthAry.push(t.TMONTH.toString());
                tmpMonthOpt = optionMonth.find((v) => v.value === t.TMONTH.toString());
                if( tmpMonthOpt ) tmpMonthOptAry.push(tmpMonthOpt);
            }
            if ( typeof(t.TWEEK)    === 'number' && !tmpWeekAry.includes(t.TWEEK.toString())){
                tmpWeekAry.push(t.TWEEK.toString());
                tmpWeekOpt = optionWeek.find((v) => v.value === t.TWEEK.toString());
                if( tmpWeekOpt ) tmpWeekOptAry.push(tmpWeekOpt);
            }
            if ( typeof(t.TWEEKDAY) === 'number' && !tmpWeekdayAry.includes(t.TWEEKDAY.toString())){
                tmpWeekdayAry.push(t.TWEEKDAY.toString());
                tmpWeekdayOpt = optionWeekDay.find((v) => v.value === t.TWEEKDAY.toString());
                if( tmpWeekdayOpt ) tmpWeekdayOptAry.push(tmpWeekdayOpt);
            }
            if ( typeof(t.TDAY)     === 'number' && !tmpDayAry.includes(t.TDAY.toString())){
                tmpDayAry.push(t.TDAY.toString());
                tmpDayOpt = optionDay.find((v) => v.value === t.TDAY.toString());
                if( tmpDayOpt ) tmpDayOptAry.push(tmpDayOpt);
            }
        });

        if(tmpCyclesAry.length != 0) setRadioCycle(tmpCyclesAry[0].toString());
        if(tmpDateAry.length != 0) {
            const date = new Date(tmpDateAry[0].toString());
            let strDate = date.getFullYear().toString() + '-';
            strDate += ( '0' + date.getMonth().toString()).slice(-2) + '-';
            strDate += ( '0' + date.getDate().toString()).slice(-2);
            setTodoDate(strDate);
        };

        handleTodoMonthChange(tmpMonthOptAry);
        handleTodoWeekChange(tmpWeekOptAry);
        handleTodoWeekDayChange(tmpWeekdayOptAry);
        handleTodoDayChange(tmpDayOptAry);
    }

    // オプションのソートメソッド
    const sortOptionTypeAry = (optionTypeAry: optionType[]): optionType[] => {
        return [...optionTypeAry].sort(
            (fstObject: optionType, secObject: optionType) => 
                (fstObject.value > secObject.value) ? 1 : -1 
        )
    }

    // 更新ボタンクリック時メソッド
    const onsubmit = async (target:any) => {

        // 設定オプションのソート実行
        target.tDay = sortOptionTypeAry(todoDay);
        target.tMonth = sortOptionTypeAry(todoMonth);
        target.tWeek = sortOptionTypeAry(todoWeek);
        target.tWeekDay = sortOptionTypeAry(todoWeekDay);

        switch( todoModalViewFlg.mode) {
            // 新規登録モード: ToDo情報 新規登録
            case 1 :
                createTodo(
                    target.able,    target.category,
                    target.priority,target.title,
                    target.text,    target.tCycles,
                    target.tDate,   target.tMonth,
                    target.tWeek,   target.tWeekDay,
                    target.tDay,    target.tAlertDay
                    );
                break;
            // 更新モード: ToDo情報 更新
            case 2 :
                updateTodo(
                    todoModalViewFlg.id,
                    target.able,    target.category,
                    target.priority,target.title,
                    target.text,    target.tCycles,
                    target.tDate,   target.tMonth,
                    target.tWeek,   target.tWeekDay,
                    target.tDay,    target.tAlertDay
                    );
                break;
            default :
                break;
        }

    };

    // ToDo情報 新規登録メソッド
    const createTodo = async ( 
        able     : number,        category : string,
        priority : string,        title    : string,
        text     : string,        tCycles  : string,
        tDate    : string,        tMonth   : optionType[],
        tWeek    : optionType[],  tWeekDay : optionType[],
        tDay     : optionType[],  tAlertDay: number
    ) => {

        try {
            if (!confirm('新しくTodoを作成します。よろしいですか？')) return;

            await connBackendPost("/todo/create", 
                {
                    able     : able,    category : category,
                    priority : priority,title    : title,
                    text     : text,    tCycles  : tCycles,
                    tDate    : tDate,   tMonth   : tMonth,
                    tWeek    : tWeek,   tWeekDay : tWeekDay,
                    tDay     : tDay,    tAlertDay: tAlertDay
                },screenInfo.TODO, screenAct.INSERT
            );

            alert('新しくTodoを作成しました');
            onreset(); // Modal閉鎖処理

        } catch(error) {
            console.error(error);
        }
    }

    // ToDo情報更新メソッド
    const updateTodo = async ( 
        id       : number,
        able     : number,        category : string,
        priority : string,        title    : string,
        text     : string,        tCycles  : string,
        tDate    : string,        tMonth   : optionType[],
        tWeek    : optionType[],  tWeekDay : optionType[],
        tDay     : optionType[],  tAlertDay: number
    ) => {

        try {
            if (!confirm('Todoを更新します。よろしいですか？')) return;

            await connBackendPost("/todo/update", 
                {
                    id       : id,
                    able     : able,     category : category,
                    priority : priority, title    : title,
                    text     : text,     tCycles  : tCycles,
                    tDate    : tDate,    tMonth   : tMonth,
                    tWeek    : tWeek,    tWeekDay : tWeekDay,
                    tDay     : tDay,     tAlertDay: tAlertDay
                },screenInfo.TODO, screenAct.UPDATE
            );

            alert('Todoを更新しました');
            onreset(); // Modal閉鎖処理

        } catch(error) {
            console.error(error);
        }
    };

    // ToDo 情報削除メソッド
    const deleteTodo = async () => {

        try {
            if (!confirm('Todo: ' + todoTitle + ' を削除します。よろしいですか？')) return;

            await connBackendPost("/todo/delete", 
                       { id : todoModalViewFlg.id, title : todoTitle }
                       ,screenInfo.TODO, screenAct.DELETE
            );

            alert('Todo ' + todoTitle + ' を削除しました');
            onreset(); // Modal閉鎖処理

        } catch(error) {
            console.error(error);
        }

    };

    // Modal 入力欄クリアメソッド
    const onClear = () => {

        reset(defaultValues); 

        setTodoAble(0);       setTodoCategory('');
        setTodoPriority('');  setTodoTitle('');
        setTodoText('');      setTodoDate('');
        setTodoMonth([]);     setTodoWeek([]);
        setTodoWeekDay([]);   setTodoDay([]);
        setTodoAlertDay(0);   setRadioCycle('');
    }

    // Modal閉鎖
    const onreset = () => {
        onClear();                           // 入力欄クリア
        setDisableInputDel(false);           // delete ボタン表示(初期化)
        setDisableInputClear(false);         // Clear ボタン表示 (初期化)
        setTodoReload(true);                 // todoReload 属性 初期化
        setTodoModalViewFlg({mode:0, id:0}); // Modal.mode -> 0 (モーダルを閉じる)
    };

    const onerror = (err:any) => console.log(err);

    // ラジオボタン設定メソッド
    const chgRadioCycle = async ( radioCycleValue: string ) => {
        setRadioCycle( radioCycleValue );
    };
    // 月設定メソッド
    const handleTodoMonthChange = (selectedOptions: optionType[] | any) => {
        setTodoMonth(selectedOptions);
    };
    // 週数設定メソッド
    const handleTodoWeekChange = (selectedOptions: optionType[] | any) => {
        setTodoWeek(selectedOptions);
    };
    // 曜日設定メソッド
    const handleTodoWeekDayChange = (selectedOptions: optionType[] | any) => {
        setTodoWeekDay(selectedOptions);
    };
    // 日数設定メソッド
    const handleTodoDayChange = (selectedOptions: optionType[] | any) => {
        setTodoDay(selectedOptions);
    };

    // mode 判定 : 0 の場合は null / 以外は コンポーネント返却
    if( todoModalViewFlg.mode > 0 ) {

    return (
        <div id="overlay">
            <div id="modalView">
                <form onSubmit={handleSubmit(onsubmit, onerror)}>
                <div className='title-pack'>
                        <div className='side'></div>
                        <div className="center">
                            <h1>Todo Edit</h1>
                        </div>
                        <div className='side'> 
                            <p>Able :</p>
                            <div className="toggleButton">
                                <input id="able" type="checkbox" checked={todoAble === 1} onClick={(() => (setTodoAble(todoAble === 1 ? 0 : 1)))} readOnly/>
                                <label htmlFor="able" />
                            </div>
                        </div>
                    </div>
                    <dl className="head">
                        <dt>Category:</dt>
                        <dd>
                        <input
                            id="category"
                            type="text"
                            list="category-list"
                            autoComplete="off"
                            {...register('category')}
                            onBlur={((v)=> (setTodoCategory(v.target.value)))}
                        />
                        <datalist id="category-list">
                            <option value="test1">test1</option>
                            <option value="test2">test2</option>
                            <option value="test3">test3</option>
                        </datalist>
                        </dd>
                        <dt>Priority:</dt>
                        <dd>
                        <select id="priority" 
                            autoComplete="off"
                            {...register('priority')}
                            onBlur={((v)=> (setTodoPriority(v.target.value)))}
                            >
                            <option value="" selected></option>
                            <option value="A">A</option>
                            <option value="B">B</option>
                            <option value="C">C</option>
                            <option value="D">D</option>
                            <option value="E">E</option>
                        </select>
                        </dd>
                        <dt />
                        <dd className="alert">{errors.category?.message}</dd>
                        <dt />
                        <dd className="alert">{errors.priority?.message}</dd>
                    </dl>
                    <dl className="common">
                        <dt>Title:</dt>
                        <dd>
                            <input id="title" type="text" autoComplete="off"
                             {...register('title')}
                             onBlur={((v)=> (setTodoTitle(v.target.value)))}
                            />
                        </dd>
                        <dt />
                        <dd className="alert">{errors.title?.message}</dd>
                        <dt>Text:</dt>
                        <dd>
                            <textarea id="text" defaultValue={""} autoComplete="off" 
                            {...register('text')}
                            onBlur={((v)=> (setTodoText(v.target.value)))}
                            />
                        </dd>
                        <dt />
                        <dd className="alert">{errors.text?.message}</dd>
                        <dt>Cycle:</dt>
                        <dd>
                        <div className="radio-box">
                            <input type="radio" className="cycles" value='1' autoComplete="off" {...register('tCycles')} onClick={(()=>chgRadioCycle('1'))} /> Day
                            <input type="radio" className="cycles" value='2' autoComplete="off" {...register('tCycles')} onClick={(()=>chgRadioCycle('2'))} /> Week
                            <input type="radio" className="cycles" value='3' autoComplete="off" {...register('tCycles')} onClick={(()=>chgRadioCycle('3'))} /> Month(per Day)
                            <input type="radio" className="cycles" value='4' autoComplete="off" {...register('tCycles')} onClick={(()=>chgRadioCycle('4'))} /> Month(per Weekday)
                        </div>
                        </dd>
                                {(() => {
                                    switch( radioCycle ) {
                                        case '1' : // Modal フレーム: Day 選択時
                                            return (
                                                <>
                                                <dt/><dd>
                                                    <div className="input-sub-box">
                                                        <dl>
                                                            <CompDateItem/>
                                                        </dl>
                                                    </div>
                                                </dd>
                                                </>
                                            );
                                        case '2' : // Modal フレーム: Week 選択時
                                            return (
                                                <>
                                                <dt/><dd>
                                                    <div className="input-sub-box">
                                                        <dl>
                                                            <CompWeekDayItem register={register}/>
                                                        </dl>
                                                    </div>
                                                </dd>
                                                </>
                                            );
                                        case '3' : // Modal フレーム: Month(Par Day) 選択時
                                            return (
                                                <>
                                                <dt/><dd>
                                                    <div className="input-sub-box">
                                                        <dl>
                                                            <CompMonthItem register={register}/>
                                                            <CompDayItem register={register}/>
                                                        </dl>
                                                    </div>
                                                </dd>
                                                </>
                                            );
                                        case '4' : // Modal フレーム: Month(Par Weekday) 選択時
                                            return (
                                                <>
                                                <dt/><dd>
                                                    <div className="input-sub-box">
                                                        <dl>
                                                            <CompMonthItem register={register}/>
                                                            <CompWeekItem register={register}/>
                                                            <CompWeekDayItem register={register}/>
                                                        </dl>
                                                    </div>
                                                </dd>
                                                </>
                                            );
                                        default :
                                            return null;
                        
                                    }
                                })()}
                        <dt />
                        <dd className="alert">
                            {errors.tCycles?.message}
                            {errors.tDay?.message}
                            {errors.tWeek?.message}
                            {errors.tWeekDay?.message}
                            {errors.tMonth?.message}
                        </dd>
                        <dt>Alert:</dt>
                        <dd>
                            <div className="min-dd">
                                <input type="number" id="tAlertDay" min="0" autoComplete="off"
                                {...register('tAlertDay')}/>
                                <div className="alert">{errors.tAlertDay?.message}</div>
                            </div></dd>
                    </dl>
                    <div className="buttonArea button">
                        <button type='submit'>Edit</button>
                        <input className='button' type='button' autoComplete="off" value='Delete' onClick={(() => deleteTodo())} disabled={disableInputDel} />
                        <input className='button' type='button' autoComplete="off" value='Clear' onClick={(() => onClear())} disabled={disableInputClear}/>
                        <input className='button' type='button' autoComplete="off" value='Leave' onClick={(() => onreset())} />
                    </div>
                    </form>
            </div>
         </div>
        );
    } else {
        return null;
    };

    // 日付設定用サブコンポーネント
    function CompDateItem() {
        return (
            <>
            <dt>Date:</dt>
            <dd>
                <input id="tDate" type="date" autoComplete="off" value={todoDate} onChange={((v) => setTodoDate(v.target.value))}/>
            </dd>
            </>
        );
    };

    // 月設定用サブコンポーネント
    function CompMonthItem({register} : any ) {

        return (
            <>
            <dt>Month:</dt>
            <dd>
                <Select 
                    id="tMonth"
                    styles={selectStyles}
                    options={optionMonth}
                    isMulti
                    autoComplete="off" 
                    value={todoMonth}
                    {...register('tMonth')}
                    onChange={handleTodoMonthChange}
                />
            </dd>
            </>
        );
    };
    
    // 週数設定用サブコンポーネント
    function CompWeekItem({register} : any) {

        return (
            <>
            <dt>Week:</dt>
            <dd>
                <Select 
                    id="tWeek"
                    styles={selectStyles}
                    options={optionWeek}
                    isMulti
                    autoComplete="off" 
                    value={todoWeek}
                    {...register('tWeek')}
                    onChange={handleTodoWeekChange}
                />
            </dd>
            </>
        );
    };
    
    // 曜日設定用サブコンポーネント
    function CompWeekDayItem({register} : any) {

        return (
            <>
            <dt>Weekday: </dt>
            <dd>
                <Select 
                    id="tWeekDay"
                    styles={selectStyles}
                    options={optionWeekDay}
                    isMulti
                    autoComplete="off" 
                    value={todoWeekDay}
                    {...register('tWeekDay')}
                    onChange={handleTodoWeekDayChange}
                />
            </dd>
            </>
        );
    };

    // 日数設定用サブコンポーネント
    function CompDayItem({register} : any) {
        return (
            <>
            <dt>Day: </dt>
            <dd>
                <Select 
                    id="tDay"
                    styles={selectStyles}
                    options={optionDay}
                    isMulti
                    autoComplete="off" 
                    value={todoDay}
                    {...register('tDay')}
                    onChange={handleTodoDayChange}
                />
            </dd>
            </>
        );
    };
};


