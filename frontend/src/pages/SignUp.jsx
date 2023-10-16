import {useState} from 'react'
import {Link, useNavigate} from 'react-router-dom'

import {toast} from 'react-toastify'

import {getAuth, createUserWithEmailAndPassword, updateProfile} from 'firebase/auth'
import {setDoc, doc, serverTimestamp} from 'firebase/firestore'
import {db} from '../firebase.config'

import OAuth from '../components/OAuth'
import visibilityIcon from '../assets/svg/visibilityIcon.svg'



function SignUp() {

	const [showPassword, setShowPassword] = useState(false)
	const [formData, setFormData] = useState({
		name: '',
		email: '',
		password: '',
		newMessages: 0,
	})

	const {name, email, password} = formData

	const navigate = useNavigate()

	const onChange = (e) => {
		setFormData((prevState) => ({
			...prevState,
			[e.target.id]: e.target.value,
		}))
	}
	
	// Registering the user
	const onSubmit = async (e) => {

		e.preventDefault()

		try {

			const auth = getAuth()
			
			const userCredential = await createUserWithEmailAndPassword(auth, email, password)

			const user = userCredential.user

			updateProfile(auth.currentUser, {
				displayName: name,
			})

			// Add user to database
			const formDataCopy = {...formData}
			delete formDataCopy.password
			formDataCopy.timestamp = serverTimestamp()
			await setDoc(doc(db, 'users', user.uid), formDataCopy)

			toast.success('Thanks for signing up!')
			navigate('/')

		} catch (error) {
			toast.error('Something went wrong with registration.')
		}

	}



	return (
		<>
			<div className="pageContainer">
				<header>
					<p className="pageHeader">
						Welcome!
					</p>
				</header>

				<form onSubmit={onSubmit}>
					<input type="text" className='nameInput' placeholder='Name' id='name' value={name} onChange={onChange} />
					
					<input type="email" className='emailInput' placeholder='Email' id='email' value={email} onChange={onChange} />

					<div className="passwordInputDiv">
						<input type={showPassword ? 'text' : 'password'} className='passwordInput' placeholder='Password' id='password' value={password} onChange={onChange} />
						
						<img src={visibilityIcon} alt="Show Password" className='showPassword' onClick={() => setShowPassword((prevState) => !prevState)} />
					</div>

					<button type='submit' className='primaryButton'>
						Sign Up
					</button>

					<Link to='/sign-in' className='registerLink'>
						Sign In Instead
					</Link>
					<Link to='/forgot-password' className='forgotLink'>
						Forgot Password
					</Link>

				</form>

				<OAuth />

			</div>
		</>
	)
}
export default SignUp