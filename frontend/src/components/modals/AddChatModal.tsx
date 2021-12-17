import {useState} from 'react';
import {socket} from '../../socket/userSocket';
import './AddChatModal.css';
import InviteList from '../chat/InviteList';

export default function AddChatModal(){
    const formcontrol = "form-control";
    const formcontrolvalid = "form-control is-valid";
    const formcontrolinvalid = "form-control is-invalid";

    const [title, setTitle] = useState<string>("");
    const [pwd, setPwd] = useState<string>("");
    const [radio, setRadio] = useState<string>("private");
    const [pwdClassname, setPwdClassname] = useState<string>(formcontrol);
    const [titleClassname, setTitleClassname] = useState<string>(formcontrol);
    const [okBtn, setOkBtn] = useState<boolean>(true);
    let members:Array<string> = [];

    function handleSubmit(){
        let data: any = {};

        if (okBtn === false)
            return ;
        data.type = radio;
        if (title !== "")
            data.title = title;
        if (radio === "public" && pwd !== "")
            data.password = pwd;
        if (members.length > 0)
            data.member = members;
        socket.emit("createChatRoom", data, (result: boolean)=>{
            if (result === true)
                console.log("초대되었습니다.");
            else
                console.log("try again!");
        });
    }
    function checkPwd(pvalue:string):boolean {
        if (pvalue.length !== 4)
            return false;
        for (let i = 0; i < 4; i++){
            if (isNaN(parseInt(pvalue.charAt(i))))
                return false;
        }
        return true;
    }
    function checkTitle(rvalue:string, tvalue:string):boolean{
        if (tvalue[0] === '#')
            return false;
        else if (rvalue === "private")
            return true;
        else if (tvalue === "")
            return false;
        return true;
    }
    function handlePwdClassname(pvalue:string, rvalue:string){
        if (rvalue === "private" || pvalue === ""){
            setPwdClassname(formcontrol);
            handleOkBtn(formcontrol, titleClassname);
        }
        else if (checkPwd(pvalue)){
            setPwdClassname(formcontrolvalid);
            handleOkBtn(formcontrolvalid, titleClassname);
        }
        else{
            setPwdClassname(formcontrolinvalid);
            setOkBtn(false);
        }
    }
    function handleTitleClassname(rvalue:string, tvalue:string){
        if (checkTitle(rvalue, tvalue)){
            setTitleClassname(formcontrol);
            handleOkBtn(pwdClassname, formcontrol);
        }
        else{
            setTitleClassname(formcontrolinvalid);
            setOkBtn(false);
        }
    }
    function handlePwd(event: any){
        const value = event.target.value;
        setPwd(value);
        handlePwdClassname(value, radio);
    }
    function handleTitle(event: any){
        const value = event.target.value;
        setTitle(value);
        handleTitleClassname(radio, value);
    }
    function handleRadio(event: any){
        const value = event.target.value;
        if (value !== radio){
            setRadio(value);
            handlePwdClassname(pwd, value);
            handleTitleClassname(value, title);
        }
    }
    function handleOkBtn(pvalue:string, tvalue:string){
        if (tvalue !== formcontrol)
            setOkBtn(false);
        else if (pvalue === formcontrolinvalid)
            setOkBtn(false);
        else
            setOkBtn(true);
    }
    function setMembers(member:Array<string>){
        members = member;
    }

    return (
        <div className="modal fade h-8" id="AddChatModal" role="dialog" tabIndex={-1} aria-labelledby="AddChatModalLabel" aria-hidden="true">
            <div className="modal-dialog modal-dialog-centered" role="document">
                <div className="modal-content">
                    <div className="modal-header">
                    	<h5 id="AddChatModalLabel" className="modal-title">채팅방 생성</h5>
                    	<button type="button" className="close btn btn-outline-dark" data-dismiss="modal" aria-label="Close">
                	    	<span aria-hidden="true">&times;</span>
                    	</button>
                    </div>
                    <div className="modal-body">
                        <div className="form-group">
                            <label className="col-form-label">Title</label>
                            <input type="text" className={titleClassname} onChange={handleTitle}></input>
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
                            <input type="text" className={pwdClassname} id="pwdInput" onChange={handlePwd} placeholder="ex)1234" maxLength={4} disabled={radio === 'private'}></input>
                            <div className="invalid-feedback">숫자 4자리</div>
                            <div className="valid-feedback"></div>
                        </div>
                        <div className="form-group">
                            <label className="col-form-label">Members</label>
                            <div className="border rounded m-1" id="inviteDiv">
                                <InviteList setMembers={setMembers}></InviteList>
                            </div>
                        </div>
					</div>
                    <div className="modal-footer">
                        <button type="button" className="close btn btn-outline-dark" data-dismiss="modal" disabled={!okBtn} onClick={handleSubmit}>확인</button>
                        <button type="button" className="close btn btn-outline-secondary" data-dismiss="modal">취소</button>
                    </div>
                </div>
            </div>
        </div>
    );
}