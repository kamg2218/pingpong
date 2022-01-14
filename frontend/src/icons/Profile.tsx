import Profile1 from './profileImage1.png'
import Profile2 from './profileImage2.png'
import Profile3 from './profileImage3.png'
import Profile4 from './profileImage4.png'
import Profile5 from './profileImage5.png'
import Profile6 from './profileImage6.png'
import Profile7 from './profileImage7.png'
import Profile8 from './profileImage8.png'
import Profile9 from './profileImage9.png'

export default function Profile(num: number){
	if (num === 1)
		return Profile1;
	else if (num === 2)
		return Profile2;
	else if (num === 3)
		return Profile3;
	else if (num === 4)
		return Profile4;
	else if (num === 5)
		return Profile5;
	else if (num === 6)
		return Profile6;
	else if (num === 7)
		return Profile7;
	else if (num === 8)
		return Profile8;
	else if (num === 9)
		return Profile9;
	return Profile1;
}