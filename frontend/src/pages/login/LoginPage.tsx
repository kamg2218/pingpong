import '../../css/LoginPage.css';
import LoginForm from "../../components/login/LoginForm";

export default function LoginPage(){
    return (
        <div id='loginPage'>
            <h1 className='mb-5'>LOGIN</h1>
            <div className='m-3'>------------ Service Login ------------</div>
            <button className="btn btn-outline-dark mx-3" id="signinGoogle">Google</button>
            <button className="btn btn-outline-dark" id="signin42Seoul">42Seoul</button>
            <div className='mt-3'>------------- Server Login -------------</div>
            <LoginForm/>
        </div>
    );
}