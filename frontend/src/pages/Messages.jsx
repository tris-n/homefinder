// React
import {useEffect, useState} from 'react'
import { useNavigate } from 'react-router-dom'

// Firebase
import { getAuth, updateEmail, updateProfile } from 'firebase/auth'
import { updateDoc, doc, collection, getDoc, getDocs, query, where, orderBy, deleteDoc } from 'firebase/firestore'
import {getStorage, ref, deleteObject} from 'firebase/storage'
import { db } from '../firebase.config'

// Toastify
import {toast} from 'react-toastify'

// Components
import Spinner from '../components/Spinner'
import MessageItem from '../components/MessageItem'


const Messages = () => {

	const [userMessages, setUserMessages] = useState(null)
	const [newMessages, setNewMessages] = useState(null)
	const [loading, setLoading] = useState(true)

	const auth = getAuth()
	const navigate = useNavigate()

	useEffect(() => {

		// Get all the messages
		const fetchUserMessages = async () => {

			// Get current user
			const userRef = doc(db, 'users', auth.currentUser.uid)

			// reset newMessages
			await updateDoc(userRef, {
				newMessages: 0
			})

			const docSnap = await getDoc(userRef)

			// If the user exists
			if (docSnap.exists()) {
				
				// save the messages to state
				if (docSnap.data().messages) {
					setUserMessages(docSnap.data().messages.reverse())
				}

				setNewMessages(docSnap.data().newMessages)
			}

			setLoading(false)
		}

		fetchUserMessages()

	}, [])


	// reply button
	const onReply = async (from, to, type, location, redirect) => {
		navigate(`/contact?from=${from}&to=${to}&type=${type}&location=${location}&redirect=${redirect}`)
	}

	// delete button
	const onDelete = async (location) => {

			// filter userMessages to remove the specific messages
			let filteredMessages = userMessages.filter((message) => (message.id !== location))

			// then update the user's messages with this new array
			// Get current user
			const userRef = doc(db, 'users', auth.currentUser.uid)

			// reset newMessages
			await updateDoc(userRef, {
				messages: filteredMessages
			})

			// set the messages in state
			setUserMessages(filteredMessages)

			toast.success('Successfully deleted message')

	}



	// Set spinner
	if (loading) {
		return <Spinner />
	}


	return (
		<div className='pageContainer'>
			<header style={{paddingBottom: "20px"}}>
				<p className="pageHeader">Messages</p>
			</header>


			<main>
				{userMessages ? (
					userMessages.map((message, index) => (
						<MessageItem key={index} message={message} onReply={onReply} onDelete={onDelete} />
					))
				): (
					<p>No messages.</p>
				)}
			</main>

		</div>
	)
}
export default Messages