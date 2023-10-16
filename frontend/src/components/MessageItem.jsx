import { useEffect, useState } from "react"

// Firebase
import { updateDoc, doc, collection, getDoc, getDocs, query, where, orderBy, deleteDoc } from 'firebase/firestore'
import {getStorage, ref, deleteObject} from 'firebase/storage'
import { db } from '../firebase.config'

// React Modal
import Modal from 'react-modal'

// Components
import Spinner from './Spinner'
import deleteIcon from '../assets/png/delete.png'
import replyIcon from '../assets/png/reply.png'



const MessageItem = ({message, onReply, onDelete}) => {

	// handle loading state
	const [loading, setLoading] = useState(true)

	// Put message into state
	const [messageInfo, setMessageInfo] = useState({})

	// modal
	const [modalIsOpen, setModalIsOpen] = useState(false)

	// open modal
	const openModal = () => {
		setModalIsOpen(true)
	}
	
	// close modal
	const closeModal = () => {
		setModalIsOpen(false)
	}

	// handle delete click
	const handleMenuDeleteClick = (listingId) => {
		setModalIsOpen(false)
		onDelete(listingId)
	}



	// Fetch the property name and owner name
	useEffect(() => {

		// set message info
		const loadMessage = async () => {

			let newDate = message.sent.toDate().toString().slice(0,21)
	
			setMessageInfo(prevMessageInfo => {
				return {
					...prevMessageInfo,
					to: message.to,
					from: message.from,
					location: message.location,
					type: null,
					sent: newDate,
					text: message.text,
					id: message.id,
				}
			})

		}
		



		// get property name
		const fetchPropertyName = async () => {

			const docRef = doc(db, 'listings', message.location)
			const docSnap = await getDoc(docRef)

			// If the user exists
			if (docSnap.exists()) {
				setMessageInfo(prevMessageInfo => {
					return {
						...prevMessageInfo,
						location: docSnap.data().name,
						type: docSnap.data().type,
					}
				})		
			}
		}

		// get user name
		const fetchUserName = async () => {

			const userRef = doc(db, 'users', message.from)
			const docSnap = await getDoc(userRef)

			// If the user exists
			if (docSnap.exists()) {
				setMessageInfo(prevMessageInfo => {
					return {
						...prevMessageInfo,
						from: docSnap.data().name,
					}
				})		
			}
		}

		// fetch all data and handle loading
		const fetchAllData = async () => {
			
			await loadMessage()
			await fetchPropertyName()
			await fetchUserName()
			
			setLoading(false)

		}

		fetchAllData()


	}, [message])



	if (loading) {
		return <Spinner />
	}



	return (
		<div className="messageItemBox">
			<div className="messageHeader">
				<div className="messageDetails">
					<p><strong>From:</strong> {messageInfo.from}</p>
					<p><strong>Location:</strong> {messageInfo.location}</p>
					<p><strong>Sent:</strong> {messageInfo.sent}</p>
				</div>
				<div className="messageButtons">
					<button onClick={() => onReply(message.to, message.from, messageInfo.type, message.location, "messages")} style={{marginRight: "0.5rem"}}>
						<img src={replyIcon} alt="Reply" />
					</button>

					<button onClick={() => openModal()}>
						<img src={deleteIcon} alt="Delete" />
					</button>
				</div>
			</div>
			<div className="messageBody">
				<p><strong>Message:</strong> {messageInfo.text}</p>
			</div>

			{/* Delete modal */}
			<Modal
				isOpen={modalIsOpen}
				onRequestClose={closeModal}
				style={{
					overlay: {
						zIndex: 1000,
						backgroundColor: "rgba(0,0,0,0.4)"
					},
					content: {
						backgroundColor: "#f2f4f8",
						borderRadius: "1rem",
						display: "flex",
						flexDirection: "column",
						height: "130px",
						maxWidth: "400px",
						margin: "auto"
					}
				}}
			>
				<p>
					Are you sure you want to delete?
				</p>									
				
				<div style={{display: "flex", flexDirection: "row", justifyContent: "flex-end"}}>
					<button onClick={closeModal} className='buttonCancel'>Cancel</button>

					<button onClick={() => handleMenuDeleteClick(message.id)} className='buttonDelete'>Delete</button>

				</div>
			</Modal> 
		</div>
	)
}
export default MessageItem