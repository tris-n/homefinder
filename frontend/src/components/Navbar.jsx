import {useState} from 'react'

import {useNavigate, useLocation} from 'react-router-dom'
import {ReactComponent as ExploreIcon} from '../assets/svg/exploreIcon.svg'
import {ReactComponent as OfferIcon} from '../assets/svg/localOfferIcon.svg'
import {ReactComponent as PersonOutlineIcon} from '../assets/svg/personOutlineIcon.svg'
import logo from '../assets/logo/home.png'

function Navbar() {

	const navigate = useNavigate()
	const location = useLocation()

	const [menuActive, setMenuActive] = useState(false)

	const pathMatchRoute = (route) => {
		if (route === location.pathname) {
			return true
		}
	}

	// menu button
	const menuClick = (e) => {
		setMenuActive(!menuActive)
	}



	return (
		<div className="navbar">

			{/* Desktop Navbar */}
			<nav className="navbarNav desktopNav">
				<ul className="navbarListItems">
					<li className="navbarLogoBox" onClick={() => navigate('/')}>
						<img src={logo} alt="" width='36px' height='36px' />
						<p>Home<span style={{fontWeight: "800", color: "#797B7E"}}>Finder</span></p>
					</li>
					<li className="navbarListItem" onClick={() => navigate('/')}>
						<ExploreIcon fill={pathMatchRoute('/') ? '#2c2c2c' : '#8f8f8f'} width='36px' height='36px' />
						<p className={pathMatchRoute('/') ? 'navbarListItemNameActive' : 'navbarListItemName'}>Explore</p>
					</li>
					<li className="navbarListItem" onClick={() => navigate('/offers')}>
						<OfferIcon fill={pathMatchRoute('/offers') ? '#2c2c2c' : '#8f8f8f'} width='36px' height='36px' />
						<p className={pathMatchRoute('/offers') ? 'navbarListItemNameActive' : 'navbarListItemName'}>Offers</p>
					</li>
					<li className="navbarListItem" onClick={() => navigate('/profile')}>
						<PersonOutlineIcon fill={pathMatchRoute('/profile') || pathMatchRoute('/sign-in') || pathMatchRoute('/sign-up') || pathMatchRoute('/forgot-password') ? '#2c2c2c' : '#8f8f8f'} width='36px' height='36px' />
						<p className={pathMatchRoute('/profile') ? 'navbarListItemNameActive' : 'navbarListItemName'}>Profile</p>
					</li>
				</ul>
			</nav>

			{/* Mobile Navbar */}
			<nav className="navbarNav mobileNav">
				<ul className="navbarListItems">
					<li className={`navbarLogoBox ${menuActive ? 'hiddenMenu' : ''}`} onClick={() => navigate('/')}>
						<img src={logo} alt="" width='36px' height='36px' />
						<p>Home<span style={{fontWeight: "800", color: "#797B7E"}}>Finder</span></p>
					</li>
					<li className={`navbarListItem ${menuActive ? '' : 'hiddenMenu'}`} onClick={() => navigate('/')}>
						<ExploreIcon fill={pathMatchRoute('/') ? '#2c2c2c' : '#8f8f8f'} width='36px' height='36px' />
						<p className={pathMatchRoute('/') ? 'navbarListItemNameActive' : 'navbarListItemName'}>Explore</p>
					</li>
					<li className={`navbarListItem ${menuActive ? '' : 'hiddenMenu'}`} onClick={() => navigate('/offers')}>
						<OfferIcon fill={pathMatchRoute('/offers') ? '#2c2c2c' : '#8f8f8f'} width='36px' height='36px' />
						<p className={pathMatchRoute('/offers') ? 'navbarListItemNameActive' : 'navbarListItemName'}>Offers</p>
					</li>
					<li className={`navbarListItem ${menuActive ? '' : 'hiddenMenu'}`} onClick={() => navigate('/profile')}>
						<PersonOutlineIcon fill={pathMatchRoute('/profile') || pathMatchRoute('/sign-in') || pathMatchRoute('/sign-up') || pathMatchRoute('/forgot-password') ? '#2c2c2c' : '#8f8f8f'} width='36px' height='36px' />
						<p className={pathMatchRoute('/profile') ? 'navbarListItemNameActive' : 'navbarListItemName'}>Profile</p>
					</li>
					<li className="navbarListItem" onClick={menuClick}>
						<div className={`menuHamburger ${menuActive ? 'active' : ''}`} id="hamburger">
							<div className="menuLine"></div>
							<div className="menuLine"></div>
							<div className="menuLine"></div>
						</div>
						<p className='navbarListItemName'>Menu</p>
					</li>
				</ul>
			</nav>
		</div>
	)
}
export default Navbar