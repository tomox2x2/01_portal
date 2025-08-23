export interface todoListItem {
    TODOID: number,
    CATEGORY: string,
    PRIORITY: string,
    TITLE : string,
    DETAIL: string,
    TDATE: string,
    ALERTDATE: string,
    DONE: number
}


export interface optionType {
    value: string,
    label: string
}

export const optionMonth: optionType[] = [
    { value: '1', label: "January" },
    { value: '2', label: "February" },
    { value: '3', label: "March" },
    { value: '4', label: "April" },
    { value: '5', label: "May" },
    { value: '6', label: "June" },
    { value: '7', label: "July" },
    { value: '8', label: "August" },
    { value: '9', label: "September" },
    { value: '10', label: "October" },
    { value: '11', label: "November" },
    { value: '12', label: "Decenber" },
];

export const optionWeek: optionType[] = [
    { value: '1', label: "1st" },
    { value: '2', label: "2nd" },
    { value: '3', label: "3rd" },
    { value: '4', label: "4th" },
    { value: '5', label: "5th" },
];

export const optionWeekDay: optionType[] = [
    { value: '1', label: "Monday" },
    { value: '2', label: "Tuesday" },
    { value: '3', label: "Wednesday" },
    { value: '4', label: "Thursday" },
    { value: '5', label: "Friday" },
    { value: '6', label: "Saturday" },
    { value: '0', label: "Sunday" },
];

export const optionDay: optionType[] = [
    { value: '1', label: "1" },
    { value: '2', label: "2" },
    { value: '3', label: "3" },
    { value: '4', label: "4" },
    { value: '5', label: "5" },
    { value: '6', label: "6" },
    { value: '7', label: "7" },
    { value: '8', label: "8" },
    { value: '9', label: "9" },
    { value: '10', label: "10" },
    { value: '11', label: "11" },
    { value: '12', label: "12" },
    { value: '13', label: "13" },
    { value: '14', label: "14" },
    { value: '15', label: "15" },
    { value: '16', label: "16" },
    { value: '17', label: "17" },
    { value: '18', label: "18" },
    { value: '19', label: "19" },
    { value: '20', label: "20" },
    { value: '21', label: "21" },
    { value: '22', label: "22" },
    { value: '23', label: "23" },
    { value: '24', label: "24" },
    { value: '25', label: "25" },
    { value: '26', label: "26" },
    { value: '27', label: "27" },
    { value: '28', label: "28" },
    { value: '29', label: "29" },
    { value: '30', label: "30" },
    { value: '31', label: "31" },
];

export interface todoBase {
    TODOID: number;
    ABLE: number;
    CATEGORY: string;
    PRIORITY: string;
    TITLE: string;
    DETAIL: string;
    ALERTDAYS: string;
};

export interface todoDetail {
    TODOID: number;
    FREQTYPE: number;
    TDATE: string;
    TMONTH: number;
    TWEEK: number;
    TWEEKDAY: number;
    TDAY: number;

};