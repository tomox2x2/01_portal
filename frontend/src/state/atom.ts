import { atom } from 'recoil';

export const SecK = atom({
    key: 'SecK',
    default: '',
});

export const userInfo = atom({
    key: 'UserInfo',
    default: {
        name: '',
    },
});

export const userChgFlg = atom({
    key: 'UserChgFlg',
    default: '0',
});

export const passResetDoneFlg = atom({
    key: 'passResetDoneFlg',
    default: false,
});


export const userAuthChecked = atom({
    key: "authCheck",
    default: {
        checked: false,
        isAuthenticated: false
    }
});

export const diaryIndexAtom = atom({
    key: 'diaryIndex',
    default: ''
});

export const diarySearchWordAtom = atom({
    key: 'diarySearchWord',
    default: ''
});

export const diaryModalViewAtom = atom({
    key: 'diaryModalView',
    default: {
        mode:0,
        id:0
    }
});

export const todoSearchWordAtom = atom({
    key: 'todoSearchWord',
    default: ''
});

export const todoCategoruItemAtom = atom({
    key: 'todoCategoryItem',
    default: ''
});

export const todoModalViewAtom = atom({
    key: 'todoModalView',
    default: {
        mode:0,
        id:0
    }
});

export const todoModalViewDaySetAtom = atom({
    key: 'todoModalViewDaySet',
    default: {
        mode:0
    }
});
