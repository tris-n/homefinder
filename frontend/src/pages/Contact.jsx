// React
import {useState, useEffect} from 'react'
import {useNavigate, useSearchParams} from 'react-router-dom'

// Firebase
import {doc, getDoc, updateDoc, arrayUnion, arrayRemove, serverTimestamp, Timestamp} from 'firebase/firestore'
import {getAuth} from 'firebase/auth'
import {db} from '../firebase.config'

// Toastify
import {toast} from 'react-toastify'

// UUID
import {v4 as uuidv4} from 'uuid'

// Components
import Spinner from '../components/Spinner'



function Contact() {

	const [loading, setLoading] = useState(false)

	const [message, setMessage] = useState({})

	const [sendingTo, setSendingTo] = useState(null)

	const auth = getAuth()
	const navigate = useNavigate()
	const [searchParams, setSearchParams] = useSearchParams()


	useEffect(() => {

		const setName = async () => {
			const docRef = doc(db, 'users', searchParams.get('to'))
			const docSnap = await getDoc(docRef)
			setSendingTo(docSnap.data().name)
		}

		setName()
		
		// set the message
		setMessage(prevMessage => {
			return {
				...message,
				from: searchParams.get('from'),
				to: searchParams.get('to'),
				location: searchParams.get('location'),
				type: searchParams.get('type'),
				sent: Timestamp.fromDate(new Date()),
				id: uuidv4(),
			}
		})
	}, [])



	const onChange = (e) => {
		setMessage({...message, text: e.target.value})
	}



	// Sign in the user
	const onSubmit = async (e) => {
		e.preventDefault()
		setLoading(true)

		try {

			// Update user messages array
			// And update the newMessages count
			const docRef = doc(db, 'users', message.to)
			const docSnap = await getDoc(docRef)

			let newMessages = docSnap.data().newMessages

			await updateDoc(docRef, {
				messages: arrayUnion(message),
				newMessages: newMessages + 1,
			})
		
			toast.success('Message sent!')

			// Navigate back to original page
			if (searchParams.get('redirect') === "messages") {
				navigate(`/messages`)
			} else {
				navigate(`/category/${message.type}/${message.location}`)
			}

		} catch (error) {
			toast.error('Could not send message. Try again in a minute.')
		}
		
		setLoading(false)


	}


	if (loading) {
		return <Spinner />
	}



	return (
		<div className='pageContainer'>
			<header>
				<p className="pageHeader">Contact</p>
			</header>


			<main>
				<div className="contactLandlord">
					<p className="landlordName">
						{sendingTo ? `To: ${sendingTo}` : ""}
					</p>
				</div>

				<form className="messageForm" onSubmit={onSubmit}>

					<div className="messageDiv">
						<label htmlFor="message" className='messageLabel'>
							Message
						</label>
						<textarea name="message" id="message" className='textarea' value={message.text} onChange={onChange}></textarea>
					</div>

					<button className='primaryButton' type='submit'>Send Message</button>

				</form>
			</main>

		</div>
	)
}
export default Contact