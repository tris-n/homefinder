import {useState} from 'react'

import {toast} from 'react-toastify'

import {Link, useNavigate, useParams, useSearchParams} from 'react-router-dom'

import {getAuth, signInWithEmailAndPassword} from 'firebase/auth'

import OAuth from '../components/OAuth'
import visibilityIcon from '../assets/svg/visibilityIcon.svg'
import { collectionGroup } from 'firebase/firestore'



function SignIn() {

	const [showPassword, setShowPassword] = useState(false)
	const [formData, setFormData] = useState({
		email: '',
		password: '',
	})
	const {email, password} = formData

	const navigate = useNavigate()
	const params = useParams()
	const [searchParams, setSearchParams] = useSearchParams()

	const onChange = (e) => {
		setFormData((prevState) => ({
			...prevState,
			[e.target.id]: e.target.value,
		}))
	}

	// Sign in the user
	const onSubmit = async (e) => {
		e.preventDefault()

		try {
			
			const auth = getAuth()
	
			const userCredential = await signInWithEmailAndPassword(auth, email, password)
	
			if (userCredential.user) {
				if (searchParams.get('location')) {
					navigate(`/category/${searchParams.get('type')}/${searchParams.get('location')}`)
				} else {
					navigate('/')
				}
			}

		} catch (error) {
			toast.error('Bad User Credentials')
		}
	}


	// Demo logins
	const onDemoLogin = async (role) => {
		const adminConfig = JSON.parse(process.env.REACT_APP_DEMO_ADMIN)
		const buyerConfig = JSON.parse(process.env.REACT_APP_DEMO_BUYER)
		const sellerConfig = JSON.parse(process.env.REACT_APP_DEMO_SELLER)
		const renterConfig = JSON.parse(process.env.REACT_APP_DEMO_RENTER)

		let userData

		if (role === "admin") userData = adminConfig
		if (role === "buyer") userData = buyerConfig
		if (role === "seller") userData = sellerConfig
		if (role === "renter") userData = renterConfig

		try {
			
			const auth = getAuth()
	
			const userCredential = await signInWithEmailAndPassword(auth, userData.email, userData.password)
	
			if (userCredential.user) {
				if (searchParams.get('location')) {
					navigate(`/category/${searchParams.get('type')}/${searchParams.get('location')}`)
				} else {
					navigate('/profile')
				}
			}

		} catch (error) {
			toast.error('Bad User Credentials')
		}
	}



	return (
		<>
			<div className="pageContainer">
				<header>
					<p className="pageHeader">
						Welcome Back!
					</p>
				</header>

				<form onSubmit={onSubmit}>
					<input type="email" className='emailInput' placeholder='Email' id='email' value={email} onChange={onChange} />

					<div className="passwordInputDiv">
						<input type={showPassword ? 'text' : 'password'} className='passwordInput' placeholder='Password' id='password' value={password} onChange={onChange} />
						
						<img src={visibilityIcon} alt="Show Password" className='showPassword' onClick={() => setShowPassword((prevState) => !prevState)} />
					</div>

					<button type='submit' className='primaryButton'>
						Sign In
					</button>

					<Link to='/sign-up' className='registerLink'>
						Sign Up Instead
					</Link>
					<Link to='/forgot-password' className='forgotLink'>
						Forgot Password
					</Link>

				</form>

				<OAuth />

				<p className="pageHeader">
					Demo site as:
				</p>

				<div className='demoLoginBox'>
					<button className='demoButton' onClick={() => onDemoLogin('admin')}>Admin</button>
					<button className='demoButton' onClick={() => onDemoLogin('seller')}>Seller</button>
					<button className='demoButton' onClick={() => onDemoLogin('buyer')}>Buyer</button>
					<button className='demoButton' onClick={() => onDemoLogin('renter')}>Renter</button>
				</div>

			</div>
		</>
	)
}
export default SignIn