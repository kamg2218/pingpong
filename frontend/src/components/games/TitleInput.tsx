import { useState } from 'react';

export default function TitleInput(props :any){
    const [title, setTitle] = useState(props.title.substr(1));

    const handleTitleChange = (e :any) => {
        setTitle(e.target.value);
    }
    const handleTitleClick = () => {
        props.getTitle(props.idx, title);
    }
    const handleKeyPress = (e :any) => {
        if (e.key === 'Enter')
            handleTitleClick();
    }

    return (
        <div className='d-flex' id='titleInput'>
            <input className='col-12' onChange={e => handleTitleChange(e)} onKeyPress={e=>handleKeyPress(e)} value={title}></input>
            <button className='btn' onClick={handleTitleClick}>
                <i className="bi bi-check-lg"/>
            </button>
        </div>
    );
}