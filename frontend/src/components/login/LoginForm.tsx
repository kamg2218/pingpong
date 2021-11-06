import '../../css/LoginForm.css';

export default function LoginForm(){
    return (
         <form action="localhost:4242/api/auth/login" method="post" id="loginForm" className='col-sm-6 col-lg-5'>
            <div className="form-group mb-3 mt-3 d-flex">
                <label className="col-form-label col-3 mx-2">ID</label>
                <input type="email" className="form-control" id="inputId" placeholder="id@email.com"/>
            </div>
            <div className="form-group mb-3 d-flex">
                <label className="col-form-label col-3 mx-2">Password</label>
                <input type="password" className="form-control" id="inputPassword" placeholder="password"/>
            </div>
            <div className="form-group mt-3 col">
                <a className="btn btn-outline-dark mx-2" href="/user/signup" role="button">SignUp</a>
                <button className="btn btn-outline-dark my-2" type="submit">Login</button>
                <a className="btn btn-outline-dark mx-2" href="/" role="button">Cancel</a>
            </div>
        </form>
    );
}