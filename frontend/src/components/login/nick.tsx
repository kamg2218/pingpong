import Profile from "./ProfileCarousel";

export default function nick(){
    return (
        <form>
            <Profile></Profile>
            <div className="nick">
                <input value="" placeholder="nickname"></input>
                <button>Check</button>
            </div>
            <div>
                <button>OK</button>
                <button>Cancel</button>
            </div>
        </form>
    );
}