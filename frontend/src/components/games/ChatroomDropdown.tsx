import 'bootstrap/dist/js/bootstrap.bundle';

export default function ChatroomDropdown(){
    return (
        <div className="dropdown">
	        <button className="btn float-end" type="button" id="dropdownMenuButton" data-bs-toggle="dropdown" aria-expanded="false">
                <i className="bi bi-three-dots-vertical"></i>
	        </button>
	        <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton">
		        <li className="dropdown-item">invite</li>
		        <li className="dropdown-item">exit</li>
	        </ul>
	    </div>
    );
}