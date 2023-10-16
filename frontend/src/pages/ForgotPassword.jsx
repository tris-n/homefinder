import {useState} from 'react'
import {Link} from 'react-router-dom'
import {getAuth, sendPasswordResetEmail} from 'firebase/auth'
import {toast} from 'react-toastify'

function ForgotPassword() {

	const [email, setEmail] = useState('')

	const onChange = (e) => {
		setEmail(e.target.value)		
	}
	
	// Send reset password email
	const onSubmit = async (e) => {
		
		e.preventDefault()

		try {
			
			const auth = getAuth()
			await sendPasswordResetEmail(auth, email)
			toast.success('Email was sent')

		} catch (error) {
			toast.error('Could not send reset email')
		}
	}



	return (
		<div className="pageContainer">
			<header>
				<p className="pageHeader">Forgot Password</p>
			</header>

			<main>
				<form onSubmit={onSubmit}>
					
					<input type="email" className='emailInput' placeholder='Email' id='email' value={email} onChange={onChange} />

					<button type='submit' className='primaryButton'>
						Send Reset Link
					</button>

					<Link to='/sign-in' className='registerLink'>
						Sign In
					</Link>

				</form>
			</main>
		</div>
	)
}
export default ForgotPassword