import Profile1 from './profile1.png';
import Profile2 from './profile2.png';
import Profile3 from './profile3.png';
import Profile4 from './profile4.png';
import Profile5 from './profile5.png';
import Profile6 from './profile6.png';

export default function Profile(num: number){
	if (num === 0)
		return Profile1;
	else if (num === 1)
		return Profile2;
	else if (num === 2)
		return Profile3;
	else if (num === 3)
		return Profile4;
	else if (num === 4)
		return Profile5;
	else if (num === 5)
		return Profile6;
	return Profile1;
}