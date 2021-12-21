import { useState } from 'react';

export default function TitleInput(props :any){
    const [title, setTitle] = useState(props.info.title.substr(1));

    const handleTitleChange = (e :any) => {
        setTitle(e.target.value);
    }
    const handleTitleClick = () => {
        props.setTitle(props.info.chatid, title);
    }
    const handleKeyPress = (e :any) => {
        if (e.key === 'Enter')
            handleTitleClick();
    }

    return (
        <div key={`titleInput_${props.info.chatid}`} className='d-flex' id='titleInput'>
            <input className='col-12' value={title} placeholder={title} onChange={e => handleTitleChange(e)} onKeyPress={e=>handleKeyPress(e)}></input>
            <button className='btn' onClick={handleTitleClick}>
                <i className="bi bi-check-lg"/>
            </button>
        </div>
    );
}