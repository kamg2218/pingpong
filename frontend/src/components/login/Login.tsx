import './Login.css';
// import Form from 'bootstrap';

export default function Login(){
    return (
        <form action="localhost:3000/api/login" method="post">
            <div className="form-group my-3 row">
                <label className="col-sm-2 col-form-label">ID</label>
                <div className="col-sm-8 col-lg-3">
                    <input type="id" className="form-control" id="inputId" placeholder="id@email.com"/>
                </div>
            </div>
            <div className="form-group mb-3 row">
                <label className="col-sm-2 col-form-label">Password</label>
                <div className="col-sm-8 col-lg-3">
                    <input type="password" className="form-control" id="inputPassword" placeholder="password"/>
                </div>
            </div>
            <div className="form-group col">
                <button type="button" className="btn btn-outline-dark mx-1" id="login">Login</button>
                <button type="button" className="btn btn-outline-dark mx-1" id="cancel">Cancel</button>
            </div>
        </form>
    );
}