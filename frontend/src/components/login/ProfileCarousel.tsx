import profileImage1 from "../../icons/profile1.png";
import profileImage2 from '../../icons/profile2.png';
import profileImage3 from '../../icons/profile3.png';
import profileImage4 from '../../icons/profile4.png';
import profileImage5 from '../../icons/profile5.png';
import profileImage6 from '../../icons/profile6.png';
import '../../css/ProfileCarousel.css';

export default function ProfileCarousel({profile, setProfile}:{profile:number, setProfile:Function}){
	const maxNum:number = 5;

	return (
		<div id="carouselIndicators" className="carousel slide" data-bs-touch='false' data-bs-interval='false'>
			<div className="carousel-indicators">
				<button data-bs-target="#carouselIndicators" data-bs-slide-to="0" className="active" aria-current="true" aria-label="Slide 0" onClick={()=>setProfile(0)}></button>
				<button data-bs-target="#carouselIndicators" data-bs-slide-to="1" aria-label="Slide 1" onClick={()=>setProfile(1)}></button>
				<button data-bs-target="#carouselIndicators" data-bs-slide-to="2" aria-label="Slide 2" onClick={()=>setProfile(2)}></button>
				<button data-bs-target="#carouselIndicators" data-bs-slide-to="3" aria-label="Slide 3" onClick={()=>setProfile(3)}></button>
				<button data-bs-target="#carouselIndicators" data-bs-slide-to="4" aria-label="Slide 4" onClick={()=>setProfile(4)}></button>
				<button data-bs-target="#carouselIndicators" data-bs-slide-to="5" aria-label="Slide 5" onClick={()=>setProfile(5)}></button>
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
			</div>
			<button className="carousel-control-prev" type="button" data-bs-target="#carouselIndicators" data-bs-slide="prev" onClick={()=>{setProfile(profile === 0 ? maxNum : profile - 1)}}>
				<span className="carousel-control-prev-icon" aria-hidden="true"></span>
				<span className="visually-hidden">Previous</span>
			</button>
			<button className="carousel-control-next" type="button" data-bs-target="#carouselIndicators" data-bs-slide="next" onClick={()=>{setProfile(profile === maxNum ? 0 : profile + 1)}}>
				<span className="carousel-control-next-icon" aria-hidden="true"></span>
				<span className="visually-hidden">Next</span>
			</button>
		</div>
	);
}