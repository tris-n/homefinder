import {BrowserRouter as Router, Routes, Route} from 'react-router-dom'

import {ToastContainer} from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import Navbar from './components/Navbar'
import PrivateRoute from './components/PrivateRoute'

import Category from './pages/Category'
import CreateListing from './pages/CreateListing'
import EditListing from './pages/EditListing'
import Listing from './pages/Listing'
import Explore from './pages/Explore'
import ForgotPassword from './pages/ForgotPassword'
import Offers from './pages/Offers'
import Profile from './pages/Profile'
import SignIn from './pages/SignIn'
import SignUp from './pages/SignUp'
import Contact from './pages/Contact'
import Messages from './pages/Messages'



function App() {
	return (
		<>
			<Router>
				<Navbar />
				<div style={{maxWidth: "1200px", margin: "auto", position: "relative"}}>
					<Routes>
						<Route path="/" element={<Explore />} />
						<Route path="/offers" element={<Offers />} />
						<Route path="/category/:categoryName" element={<Category />} />
						<Route path="/category/:categoryName/:listingId" element={<Listing />} />
						<Route path="/profile" element={<PrivateRoute />}>
							<Route path="/profile" element={<Profile />} />
						</Route>
						<Route path="/messages" element={<PrivateRoute />}>
							<Route path="/messages" element={<Messages />} />
						</Route>
						<Route path="/sign-in" element={<SignIn />} />
						<Route path="/sign-up" element={<SignUp />} />
						<Route path="/forgot-password" element={<ForgotPassword />} />
						<Route path="/create-listing" element={<CreateListing />} />
						<Route path="/edit-listing/:listingId" element={<EditListing />} />
						<Route path="/contact" element={<Contact />} />
					</Routes>
				</div>
			</Router>

			<ToastContainer />
		</>
	)
}

export default App;
