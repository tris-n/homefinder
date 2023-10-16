import {Link} from 'react-router-dom'

// Framer Motion
import FadeInAndDown from '../components/FramerComponents/FadeInAndDown'
import StaggerChildren from '../components/FramerComponents/StaggerChildren'

// Thumbs
import rentCategoryImage from '../assets/jpg/rentCategoryImage_sml.jpg'
import sellCategoryImage from '../assets/jpg/sellCategoryImage_sml.jpg'

import Slider from '../components/Slider'



function Explore() {
	return (
		<div className="explore">
			<header>
				<div className="pageHeader">Explore</div>
			</header>

			<main>
				<StaggerChildren>
					<FadeInAndDown>
						<Slider />
					</FadeInAndDown>

					<FadeInAndDown>
						<p className="exploreCategoryHeading">Categories</p>
						<div className="exploreCategories">
							<Link to="/category/rent" className='categoryHolder'>
								<img src={rentCategoryImage} alt="rent" className='exploreCategoryImg' />
								<p className="exploreCategoryName">Places for rent</p>
							</Link>
							<Link to="/category/sale" className='categoryHolder'>
								<img src={sellCategoryImage} alt="sell" className='exploreCategoryImg' />
								<p className="exploreCategoryName">Places for sale</p>
							</Link>
						</div>
					</FadeInAndDown>
				</StaggerChildren>
			</main>
		</div>
	)
}
export default Explore