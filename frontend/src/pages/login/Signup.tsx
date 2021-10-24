import '../../css/Signup.css';
import SignupForm from "../../components/login/SignupForm"

export default function Signup(){
    return (
        <div className='signup' id='signup'>
            <h1 className='mb-3'>Sign up</h1>
            <div className='m-3'>------------ Service Signup ------------</div>
            <button className="btn btn-outline-dark mx-3" id="signupGoogle">Google</button>
            <button className="btn btn-outline-dark" id="signup42Seoul">42Seoul</button>
            <div className='mt-2'>------------ Server Signup ------------</div>
           <SignupForm/>
        </div>
    );
}