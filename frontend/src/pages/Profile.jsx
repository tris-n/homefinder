import {useEffect, useState} from 'react'

import { getAuth, updateEmail, updateProfile } from 'firebase/auth'
import { updateDoc, doc, collection, getDoc, getDocs, query, where, orderBy, deleteDoc } from 'firebase/firestore'
import {getStorage, ref, deleteObject} from 'firebase/storage'
import { db } from '../firebase.config'

import { useNavigate, Link } from 'react-router-dom'
import {toast} from 'react-toastify'

import ListingItem from '../components/ListingItem'

import arrowRight from '../assets/svg/keyboardArrowRightIcon.svg'
import homeIcon from '../assets/svg/homeIcon.svg'
import emailIcon from '../assets/png/email.png'


function Profile() {
	
	const auth = getAuth()

	const [changeDetails, setChangeDetails] = useState(false)
	const [loading, setLoading] = useState(true)
	const [listings, setListings] = useState(null)
	const [admin, setAdmin] = useState(false)
	const [messages, setMessages] = useState({})

	let userInfo

	const [formData, setFormData] = useState({
		name: auth.currentUser.displayName,
		email: auth.currentUser.email,
	})

	const {name, email} = formData

	const navigate = useNavigate()
	


	useEffect(() => {

		// Get all the listings
		const fetchUserListings = async () => {

			const listingsRef = collection(db, 'listings')
			const userId = auth.currentUser.uid


			// GET USER INFO
			const docSnap = await getDoc(doc(db, 'users', auth.currentUser.uid))

			// check if admin
			if (docSnap.data().role === 'admin') {
				setAdmin(true)
			}

			// set messages
			if (docSnap.data().messages) {
				setMessages({
					messageTotal: docSnap.data().messages.length,
					newMessages: docSnap.data().newMessages
				})
			} else {
				setMessages({
					messageTotal: 0,
					newMessages: 0
				})
			}


			// GET LISTINGS
			let querySnap

			// if admin, get all listings
			if (docSnap.data().role) {
				
				querySnap = await getDocs(listingsRef)
	
			} else {

				// properties the user has listed
				const userRefQuery = query(listingsRef, where('userRef', '==', userId), orderBy('timestamp', 'desc'))
				const userRefDocs = await getDocs(userRefQuery)
				
				// properties the user has rented
				const rentedToQuery = query(listingsRef, where('rentedTo', '==', userId), orderBy('timestamp', 'desc'))
				const rentedToDocs = await getDocs(rentedToQuery)
				
				// properties the user has bought
				const soldToQuery = query(listingsRef, where('soldTo', '==', userId), orderBy('timestamp', 'desc'))
				const soldToDocs = await getDocs(soldToQuery)
				
				// properties the user has bid on
				const bidderQuery = query(listingsRef, where('bidder', '==', userId), orderBy('timestamp', 'desc'))
				const bidderDocs = await getDocs(bidderQuery)

				// merge results and sort
				querySnap = [...userRefDocs.docs, ...rentedToDocs.docs, ...soldToDocs.docs, ...bidderDocs.docs].sort((a, b) => b.data().timestamp - a.data().timestamp)

			}



			let listings = []

			querySnap.forEach((doc) => {		

				return listings.push({
					id: doc.id,
					data: doc.data()
				})
			})

			setListings(listings)
		}


		// Controls the loading and data fetching
		const fetchData = async () => {

			await fetchUserListings()

			setLoading(false)
		}

		fetchData()		

	}, [])

	
	
	// Signing out
	const onLogout = () => {
		auth.signOut()
		navigate('/')
	}

	// Update profile details in firebase
	const onSubmit = async () => {
		try {
			
			// Update display name in firebase
			auth.currentUser.displayName !== name && (
				await updateProfile(auth.currentUser, {
					displayName: name
				})
			)
			
			// Update email address in firebase
			auth.currentUser.email !== email && (
				await updateEmail(auth.currentUser, email)
			)
				
			// Update in firestore
			const userRef = doc(db, 'users', auth.currentUser.uid)
			await updateDoc(userRef, {
				name,
				email,
			})

			toast.success('Successfully updated details')
			
		} catch (error) {
			toast.error('Could not update profile details')
		}
	}

	// Update form details
	const onChange = (e) => {
		setFormData((prevState) => ({
			...prevState,
			[e.target.id]: e.target.value,
		}))
	}

	// Delete from firestore
	const onDelete = async (listingId) => {

			// Delete pictures from firebase filestorage
			// WARNING: THIS WILL BREAK YOUR BACKEDUP REFERENCES AS THEY WILL POINT TO DELETED IMAGES
			
			const storage = getStorage()

			const imagesToDelete = listings.filter((listing) => listing.id === listingId)

			const imagesArray = imagesToDelete[0].data.imageUrls

			imagesArray.forEach((urlToDelete) => {

				// Get the filename from the upload URL
				let fileName = urlToDelete.split('/').pop().split('#')[0].split('?')[0]

				
				// Replace "%2F" in the URL with "/"
				fileName = fileName.replace("%2F", "/")
				
				const imageToDeleteRef = ref(storage, `${fileName}`)
				
				// Delete the file
				deleteObject(imageToDeleteRef).then(() => {
					toast.success('Images deleted')
				}).catch((error) => {
					toast.error('Failed to delete images')
				})
			})



			// Delete firestore record
			await deleteDoc(doc(db, 'listings', listingId))

			// Update UI to show newest state after deletion
			const updatedListings = listings.filter((listing) => listing.id !== listingId)
			setListings(updatedListings)
			toast.success('Successfully deleted listing')
		// }
	}

	// Edit listing
	const onEdit = (listingId) => navigate(`/edit-listing/${listingId}`)


	return <div className="profile">
		<header className="profileHeader">
			<div className="pageHeader">My Profile {admin ? "(admin)" : ''}</div>
			<button type='button' className="logOut" onClick={onLogout}>
				Logout
			</button>
		</header>

		<main>
			
			<div className="profileDetailsHeader">
				<p className="profileDetailsText">Personal Details</p>
				<p className="changePersonalDetails" onClick={() => {
					changeDetails && onSubmit()
					setChangeDetails((prevState) => !prevState)
				}}>
					{changeDetails ? 'done' : 'change'}
				</p>
			</div>

			<div className="profileCard">
				<form>
					<input type="text" id="name" className={!changeDetails ? 'profileName' : 'profileNameActive'} disabled={!changeDetails} value={name} onChange={onChange} />
				
					<input type="text" id="email" className={!changeDetails ? 'profileEmail' : 'profileEmailActive'} disabled={!changeDetails} value={email} onChange={onChange} />
				</form>
			</div>

			<Link to="/create-listing" className='createListing'>
				<img src={homeIcon} alt="home" />
				<p>Sell or rent your home</p>
				<img src={arrowRight} alt="arrow right" />
			</Link>
			
			{messages.messageTotal > 0 && (
				<Link to="/messages" className='createListing'>
					<img src={emailIcon} alt="email" style={{width: "20px", marginLeft: "4px"}} />
					<p>You have {messages.messageTotal} message{messages.messageTotal == 1 ? "" : "s"}. {messages.newMessages} unread.</p>
					<img src={arrowRight} alt="arrow right" />
				</Link>
			)}

			{!loading && listings?.length > 0 && (
				<>
					<p className="listingText">{admin ? "All Listings" : "Your Listings"}</p>
					<ul className="listingsList">
						{listings.map((listing) => (
							<ListingItem key={listing.id} listing={listing.data} id={listing.id} admin={admin} onDelete={() => onDelete(listing.id)} onEdit={() => onEdit(listing.id)} currentUser={auth.currentUser.uid} />
						))}
					</ul>
				</>
			)}

		</main>

	</div>
}
export default Profile