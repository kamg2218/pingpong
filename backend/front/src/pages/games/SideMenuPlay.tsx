import MenuPlay from '../../components/play/MenuPlay';

export default function SideMenuPlay(){
	return (
		<div id='playTab'>
			<div className='row'><div className='col-3 btn' id='tab-play'>play</div></div>
			<div className='row' id='nav-play'><MenuPlay></MenuPlay></div>
		</div>
	);
}