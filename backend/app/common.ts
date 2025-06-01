
export async function getDateFormatSQL ( classID: number): Promise<string>{

    let formatStr :string = '';

    switch (classID) {
        case 1 : // 年月日時分秒
            formatStr = '\'%Y.%m.%d %H:%i:%s\''
            break;
        case 2 : // 年月日時分
            formatStr = '\'%Y.%m.%d %H:%i\''
            break;
        case 3 : // 年月日
            formatStr = '\'%Y.%m.%d\''
            break;
        case 4 : // 年月
            formatStr = '\'%Y.%m\''
            break;
        case 11 : // 年月日時分秒(年2桁)
            formatStr = '\'%y.%m.%d %H:%i:%s\''
            break;
        case 12 : // 年月日時分(年2桁)
            formatStr = '\'%y.%m.%d %H:%i\''
            break;
        case 13 : // 年月日(年2桁)
            formatStr = '\'%y.%m.%d\''
            break;
        case 14 : // 年月(年2桁)
            formatStr = '\'%y.%m\''
            break;
        default :
            break;
    }

    return formatStr;
}