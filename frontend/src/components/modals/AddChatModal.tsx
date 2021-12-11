import {useState} from 'react';
import {user, Friend} from '../../socket/userSocket';
import './AddChatModal.css';

export default function AddChatModal(props: any){
    const [title, setTitle] = useState<string>("");
    const [pwd, setPwd] = useState<string>("");
    const [radio, setRadio] = useState<string>("private");
    let members:Array<string> = [];

    function handleSubmit(){

    }
    function handleTitle(event: any){
        setTitle(event.target.value);
    }
    function handlePwd(event: any){
        setPwd(event.target.value);
    }
    function handleRadio(event: any){
        if (event.target.id !== radio){
            console.log(event.target.id);
            setRadio(event.target.value);
        }
    }
    function checkbox(data:Friend){
        const handleClick = async (data:Friend) => {
            if (members.find(idx => idx === data.userid))
                members.filter(idx => idx !== data.userid);
            else
                members.push(data.userid);
        }
        return (
            <li className='form-check m-2' key={data.userid}>
                <input className='form-check-input' type='checkbox' value='' onClick={()=>handleClick(data)}></input>
                <label className='form-check-label m-1'>{data.nickname}</label>
            </li>
        );
    }

    return (
        <div className="modal fade" id="AddChatModal" role="dialog" tabIndex={-1} aria-labelledby="AddChatModalLabel" aria-hidden="true">
            <div className="modal-dialog modal-dialog-centered modal-sm" role="document">
                <div className="modal-content">
                    <div className="modal-header">
                    	<h5 id="AddChatModalLabel" className="modal-title">채팅방</h5>
                    	<button type="button" className="close btn btn-outline-dark" data-dismiss="modal" aria-label="Close">
                	    	<span aria-hidden="true">&times;</span>
                    	</button>
                    </div>
                    <div className="modal-body">
                        <div className="form-group">
                            <label className="col-form-label">Title</label>
                            <input type="text" className="form-control" onChange={handleTitle} required={radio === 'public'}></input>
                        </div>
                        <div className="form-group">
                            <div className="form-check form-check-inline">
                                <input className="form-check-input" type="radio" name="privateRadio" value="private" checked={radio === 'private'} onChange={handleRadio}></input>
                                <label className="form-check-label">Private</label>
                            </div>
                            <div className="form-check form-check-inline">
                                <input className="form-check-input" type="radio" name="publicRadio" value="public" checked={radio === 'public'} onChange={handleRadio}></input>
                                <label className="form-check-label">Public</label>
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="col-form-label">Password</label>
                            <input type="text" className="form-control" onChange={handlePwd} placeholder="숫자 4자리 ex)1234" disabled={radio === 'private'}></input>
                        </div>
                        <div className="form-group">
                            <label className="col-form-label">Members</label>
                            <div className="border rounded" id="inviteDiv">
                                <ul key='inviteBox'>
                                    {user.friends.map(friend=>checkbox(friend))}
                                </ul>
                            </div>
                        </div>
					</div>
                    <div className="modal-footer">
                        <button type="button" className="close btn btn-outline-dark" onClick={handleSubmit}>확인</button>
                        <button type="button" className="close btn btn-outline-secondary" data-dismiss="modal" aria-label="Close">취소</button>
                    </div>
                </div>
            </div>
        </div>
    );
}