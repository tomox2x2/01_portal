import { useState, useEffect } from 'react';
import { connBackendPost } from '../api/conn';

export default function compWord () {

    const [ word , setWord ] = useState('');
    const [ writen , setWriten ] = useState('');

    useEffect(() => {

        connBackendPost("/Words/Read")
        .then ( (rslt) =>  {
            if (rslt.length !== 0) {
                setWord(rslt[0].WORD);
                setWriten(rslt[0].WRITEN);
            }
        })
        .catch( (err) => console.log(err));

    },[]);

    return (
        <>
            <h1 className='word-main'>
                {word}
            </h1>
            <h3 className='word-writen'> - {writen} - </h3>
        </>
    );

}