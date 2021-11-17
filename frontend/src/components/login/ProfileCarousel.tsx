import profileImage1 from '../../icons/profileImage1.png';
import profileImage2 from '../../icons/profileImage2.png';
import profileImage3 from '../../icons/profileImage3.png';
import profileImage4 from '../../icons/profileImage4.png';
import profileImage5 from '../../icons/profileImage5.png';
import profileImage6 from '../../icons/profileImage6.png';
import profileImage7 from '../../icons/profileImage7.png';
import profileImage8 from '../../icons/profileImage8.png';
import profileImage9 from '../../icons/profileImage9.png';
import '../../css/ProfileCarousel.css';

export default function ProfileCarousel(props: any){
    const maxNum:number = 4 + 4;

    return (
        <div id="carouselIndicators" className="carousel slide" data-bs-touch='false' data-bs-interval='false'>
            <div className="carousel-indicators">
                <button data-bs-target="#carouselIndicators" data-bs-slide-to="0" className="active" aria-current="true" aria-label="Slide 1" onClick={()=>props.setProfile(0)}></button>
                <button data-bs-target="#carouselIndicators" data-bs-slide-to="1" aria-label="Slide 2" onClick={()=>props.setProfile(1)}></button>
                <button data-bs-target="#carouselIndicators" data-bs-slide-to="2" aria-label="Slide 3" onClick={()=>props.setProfile(2)}></button>
                <button data-bs-target="#carouselIndicators" data-bs-slide-to="3" aria-label="Slide 4" onClick={()=>props.setProfile(3)}></button>
                <button data-bs-target="#carouselIndicators" data-bs-slide-to="4" aria-label="Slide 5" onClick={()=>props.setProfile(4)}></button>
                <button data-bs-target="#carouselIndicators" data-bs-slide-to="5" aria-label="Slide 6" onClick={()=>props.setProfile(5)}></button>
                <button data-bs-target="#carouselIndicators" data-bs-slide-to="6" aria-label="Slide 7" onClick={()=>props.setProfile(6)}></button>
                <button data-bs-target="#carouselIndicators" data-bs-slide-to="7" aria-label="Slide 8" onClick={()=>props.setProfile(7)}></button>
                <button data-bs-target="#carouselIndicators" data-bs-slide-to="8" aria-label="Slide 9" onClick={()=>props.setProfile(8)}></button>
            </div>
            <div className="carousel-inner">
                <div className="carousel-item profile active">
                    <img src={profileImage1} className="center-block img" alt="..."/>
                </div>
                <div className="carousel-item profile">
                    <img src={profileImage2} className="center-block img" alt="..."/>
                </div>
                <div className="carousel-item profile">
                    <img src={profileImage3} className="center-block img" alt="..."/>
                </div>
                <div className="carousel-item profile">
                    <img src={profileImage4} className="center-block img" alt="..."/>
                </div>
                <div className="carousel-item profile">
                    <img src={profileImage5} className="center-block img" alt="..."/>
                </div>
                <div className="carousel-item profile">
                    <img src={profileImage6} className="center-block img" alt="..."/>
                </div>
                <div className="carousel-item profile">
                    <img src={profileImage7} className="center-block img" alt="..."/>
                </div>
                <div className="carousel-item profile">
                    <img src={profileImage8} className="center-block img" alt="..."/>
                </div>
                <div className="carousel-item profile">
                    <img src={profileImage9} className="center-block img" alt="..."/>
                </div>
            </div>
            <button className="carousel-control-prev" type="button" data-bs-target="#carouselIndicators" data-bs-slide="prev" onClick={()=>{props.setProfile(!props.profile ? maxNum : props.profile - 1)}}>
                <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                <span className="visually-hidden">Previous</span>
            </button>
            <button className="carousel-control-next" type="button" data-bs-target="#carouselIndicators" data-bs-slide="next" onClick={()=>{props.setProfile(props.profile === maxNum ? 0 : props.profile + 1)}}>
                <span className="carousel-control-next-icon" aria-hidden="true"></span>
                <span className="visually-hidden">Next</span>
            </button>
        </div>
    );
}