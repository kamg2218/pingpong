import profileImage1 from '../../icons/profileImage1.png';
import profileImage2 from '../../icons/profileImage2.png';
import profileImage3 from '../../icons/profileImage3.png';
import profileImage4 from '../../icons/profileImage4.png';
import profileImage5 from '../../icons/profileImage5.png';
import './ProfileCarousel.css';

export default function ProfileCarousel(){
    return (
        <div id="carouselIndicators" className="carousel slide" data-bs-touch='false' data-bs-interval='false'>
            <div className="carousel-indicators">
                <button data-bs-target="#carouselIndicators" data-bs-slide-to="0" className="active" aria-current="true" aria-label="Slide 1"></button>
                <button data-bs-target="#carouselIndicators" data-bs-slide-to="1" aria-label="Slide 2"></button>
                <button data-bs-target="#carouselIndicators" data-bs-slide-to="2" aria-label="Slide 3"></button>
                <button data-bs-target="#carouselIndicators" data-bs-slide-to="3" aria-label="Slide 4"></button>
                <button data-bs-target="#carouselIndicators" data-bs-slide-to="4" aria-label="Slide 5"></button>
            </div>
            <div className="carousel-inner">
                <div className="carousel-item profile active">
                    <img src={profileImage1} className= "d-block img" alt="..."/>
                </div>
                <div className="carousel-item profile">
                    <img src={profileImage2} className="d-block img" alt="..."/>
                </div>
                <div className="carousel-item profile">
                    <img src={profileImage3} className="d-block img" alt="..."/>
                </div>
                <div className="carousel-item profile">
                    <img src={profileImage4} className="d-block img" alt="..."/>
                </div>
                <div className="carousel-item profile">
                    <img src={profileImage5} className="d-block img" alt="..."/>
                </div>
            </div>
            <button className="carousel-control-prev" type="button" data-bs-target="#carouselIndicators" data-bs-slide="prev">
                <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                <span className="visually-hidden">Previous</span>
            </button>
            <button className="carousel-control-next" type="button" data-bs-target="#carouselIndicators" data-bs-slide="next">
                <span className="carousel-control-next-icon" aria-hidden="true"></span>
                <span className="visually-hidden">Next</span>
            </button>
        </div>
    );
}