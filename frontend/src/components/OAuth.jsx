import {useLocation, useNavigate} from 'react-router-dom'
import {getAuth, signInWithPopup, GoogleAuthProvider} from 'firebase/auth'
import {doc, setDoc, getDoc, serverTimestamp} from 'firebase/firestore'
import {db} from '../firebase.config'
import {toast} from 'react-toastify'

function OAuth() {

	const navigate = useNavigate()
	const location = useLocation()

	const onGoogleClick = async () => {

		try {
			
			const auth = getAuth()
			const provider = new GoogleAuthProvider()
			const result = await signInWithPopup(auth, provider)
			const user = result.user

			// Check for user
			const docRef = doc(db, 'users', user.uid)
			const docSnap = await getDoc(docRef)

			// If user doesnt exist, create user
			if (!docSnap.exists()) {
				await setDoc(doc(db, 'users', user.uid), {
					name: user.displayName,
					email: user.email,
					timestamp: serverTimestamp()
				})
			}

			navigate('/')

		} catch (error) {
			toast.error('Could not authorise with Google')
		}
	}



	return (
		<div className="socialLogin">
			<p style={{cursor: "pointer"}} onClick={onGoogleClick}>Sign {location.pathname === '/sign-up' ? 'up' : 'in'} with Google</p>
		</div>
	)
}
export default OAuth