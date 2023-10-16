import {useState, useEffect} from 'react'
import {Link, useNavigate, useParams} from 'react-router-dom'
import {getDoc, doc, updateDoc, arrayUnion, Timestamp} from 'firebase/firestore'
import {getAuth} from 'firebase/auth'
import {db} from '../firebase.config'

// Leaflet
import {MapContainer, Marker, Popup, TileLayer} from 'react-leaflet'

// Swiper
import { Navigation, Pagination, Scrollbar, A11y } from 'swiper'
import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import 'swiper/css/scrollbar'
import 'swiper/css/a11y'

// Toastify
import { toast } from 'react-toastify'

// UUID
import {v4 as uuidv4} from 'uuid'

// React Modal
import Modal from 'react-modal'

import Spinner from '../components/Spinner'
import shareIcon from '../assets/svg/shareIcon.svg'

import bedIcon from '../assets/svg/bedIcon.svg'
import bathtubIcon from '../assets/svg/bathtubIcon.svg'
import parkingIcon from '../assets/png/car.png'
import furnitureIcon from '../assets/png/furnitures.png'



function Listing() {

	const [listing, setListing] = useState(null)
	const [loading, setLoading] = useState(true)
	const [shareLinkCopied, setShareLinkCopied] = useState(false)
	const [bidNumber, setBidNumber] = useState(null)
	const [modalIsOpen, setIsOpen] = useState(false)

	const navigate = useNavigate()
	const params = useParams()
	const auth = getAuth()

	// Get Listing
	const fetchListing = async () => {
		const docRef = doc(db, 'listings', params.listingId)
		const docSnap = await getDoc(docRef)

		if (docSnap.exists()) {
			setListing(docSnap.data())
			setLoading(false)

		}
	}

	useEffect(() => {
		fetchListing()
	}, [navigate, params.listingId])

	// Bid form value
	const onChange = (e) => {
		setBidNumber(e.target.value)
	}


	// Button Logic
	const buyNow = async () => {

		if (auth.currentUser) {

			try {
				
				// Update the property
				const docRef = doc(db, 'listings', params.listingId)
				await updateDoc(docRef, {
					sold: !listing.sold,
					soldTo: auth.currentUser.uid,
					bid: null,
					bidder: null,
				})

				// Send message to owner
				const userRef = doc(db, 'users', listing.userRef)
				const docSnap = await getDoc(userRef)
				let newMessages = docSnap.data().newMessages

				await updateDoc(userRef, {
					messages: arrayUnion({
						from: auth.currentUser.uid,
						to: listing.userRef,
						location: params.listingId,
						type: listing.type,
						sent: Timestamp.fromDate(new Date()),
						id: uuidv4(),
						text: `Congratulations! Your property sold to ${auth.currentUser.displayName}!`,
					}),
					newMessages: newMessages + 1,
				})
	
				toast.success('Successfully bought!')
				fetchListing()
	
			} catch (error) {
				toast.error('Unable to purchase right now.')
			}

		} else {
			navigate(`/sign-in?type=${listing.type}&location=${params.listingId}`)
		}

	}


	const makeABid = async (bidValue) => {

		if (auth.currentUser) { 

			// check that bid value is more than current bidvalue
			if (bidValue < listing.bid) {
				toast.error(`Please bid more than the current bid of $${listing.bid}.`)
				return null
			}
		
			try {
				
				// Update the property
				const docRef = doc(db, 'listings', params.listingId)
				await updateDoc(docRef, {
					bid: bidValue,
					bidder: auth.currentUser.uid
				})

				// Send message to owner
				const userRef = doc(db, 'users', listing.userRef)
				const docSnap = await getDoc(userRef)
				let newMessages = docSnap.data().newMessages

				await updateDoc(userRef, {
					messages: arrayUnion({
						from: auth.currentUser.uid,
						to: listing.userRef,
						location: params.listingId,
						type: listing.type,
						sent: Timestamp.fromDate(new Date()),
						id: uuidv4(),
						text: `Congratulations! ${auth.currentUser.displayName} bid $${bidValue} on your property!`,
					}),
					newMessages: newMessages + 1,
				})
	
				toast.success('Successfully bid!')
				fetchListing()
				closeModal()
	
			} catch (error) {
				toast.error('Unable to lodge bid right now.')
			}

		} else {
			navigate(`/sign-in?type=${listing.type}&location=${params.listingId}`)
		}
	}


	const rentNow = async () => {

		if (auth.currentUser) {
		
			try {
				
				// Update the property
				const docRef = doc(db, 'listings', params.listingId)
				await updateDoc(docRef, {
					rented: !listing.rented,
					rentedTo: auth.currentUser.uid
				})

				// Send message to owner
				const userRef = doc(db, 'users', listing.userRef)
				const docSnap = await getDoc(userRef)
				let newMessages = docSnap.data().newMessages

				await updateDoc(userRef, {
					messages: arrayUnion({
						from: auth.currentUser.uid,
						to: listing.userRef,
						location: params.listingId,
						type: listing.type,
						sent: Timestamp.fromDate(new Date()),
						id: uuidv4(),
						text: `Congratulations! Your property was just leased to ${auth.currentUser.displayName}!`,
					}),
					newMessages: newMessages + 1,
				})
	
				toast.success('Successfully rented!')
				fetchListing()
	
			} catch (error) {
				toast.error('Unable to rent right now.')
			}

		} else {
			navigate(`/sign-in?type=${listing.type}&location=${params.listingId}`)
		}
	}
	
	
	
	const contactOwner = async () => {

		if (auth.currentUser) {
			// if the user is logged in
			navigate(`/contact?from=${auth.currentUser.uid}&to=${listing.userRef}&type=${listing.type}&location=${params.listingId}`)
		} else {
			// if the user isnt signed in
			// we pass in the category type and the listingId
			// in order to return to the right page
			navigate(`/sign-in?type=${listing.type}&location=${params.listingId}`)
		}
	}



	// Modal settings
	const openModal = () => {
		if (auth.currentUser) {
			setIsOpen(true)
		} else {
			navigate(`/sign-in?type=${listing.type}&location=${params.listingId}`)
		}
	}
	
	const closeModal = () => {
		setIsOpen(false)
	}



	if (loading) {
		return <Spinner />
	}

	return (
		<main>

			<Swiper modules={[Navigation, Pagination, Scrollbar, A11y]} slidesPerView={1} pagination={{clickable: true}} navigation className='swiperStyle swiperStyleListingPage'>
				{listing.imageUrls.map((url, index) => {
					return (
						<SwiperSlide key={index}>
							<div className='swiperSlideDiv' style={{background: `url(${listing.imageUrls[index]}) center no-repeat`, backgroundSize: 'cover'}}></div>
						</SwiperSlide>
					)
				})}
			</Swiper>

			<div className="shareIconDiv" onClick={() => {
				navigator.clipboard.writeText(window.location.href)
				setShareLinkCopied(true)
				setTimeout(() => {
					setShareLinkCopied(false)
				}, 2000)
			}}>
				<img src={shareIcon} alt="" />
			</div>

			{shareLinkCopied && <p className='linkCopied'>Link Copied!</p>}

			<div className="listingDetails">
				<p className="listingName">
					{listing.name} - ${listing.offer ? listing.discountedPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') : listing.regularPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}

					{listing.type === 'rent' && ' / Month'}
				</p>
				<p className="listingLocation">{listing.location}</p>

				{/* Rented */}
				{ listing.rented && <div className="listingType listingSuccess">Rented</div>}

				{/* Sold */}
				{ listing.sold && <div className="listingType listingSuccess">Sold</div>}

				{/* For Rent */}
				{ (listing.type === 'rent' && !listing.rented) && <div className="listingType">For Rent</div>}

				{/* For Sale */}
				{ (listing.type === 'sale' && !listing.sold) && <div className="listingType">For Sale</div>}

				{/* If bid */}
				{ (listing.type === 'sale' && !listing.sold && listing.bidder) && <div className="listingType listingSuccess">Current bid of ${listing.bid}</div>}

				{/* Discount amount */}
				{listing.offer && (
					<p className="discountPrice">
						${(listing.regularPrice - listing.discountedPrice).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')} discount
					</p>
				)}

				<ul className="listingDetailsList">
					<li>
						<img src={bedIcon} alt="bed" />
						{listing.bedrooms > 1 ? `${listing.bedrooms} Bedrooms` : `1 Bedroom`}
					</li>
					<li>
						<img src={bathtubIcon} alt="bath" />
						{listing.bathrooms > 1 ? `${listing.bathrooms} Bathrooms` : `1 Bathroom`}
					</li>
					<li>
						{listing.parking && (<><img src={parkingIcon} alt="parking" />Parking Spot</>)}
					</li>
					<li>
						{listing.furnished && (<><img src={furnitureIcon} alt="furniture" />Furnished</>)}
					</li>
				</ul>

				<p className="listingLocationTitle">Location</p>

				<div className="leafletContainer">
					<MapContainer style={{height: '100%', width: '100%'}} center={[listing.geolocation.lat, listing.geolocation.lng]} zoom={13} scrollWheelZoom={false}>
						<TileLayer attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors' url='https://{s}.tile.openstreetmap.de/tiles/osmde/{z}/{x}/{y}.png' />

						<Marker position={[listing.geolocation.lat, listing.geolocation.lng]}>
							<Popup>{listing.location}</Popup>
						</Marker>

					</MapContainer>
				</div>


				{/* if listing is the current owner, hide this the listing buttons */}
				{ auth.currentUser?.uid !== listing.userRef ? (

					<div className="listingButtonsBox">

						{/* Sale - not sold */}
						{(listing.type === "sale" && !listing.sold) && (
							<button onClick={buyNow} className="primaryButton">Buy now</button>
						)}

						{/* Sale - sold */}
						{(listing.type === "sale" && listing.sold) && (
							<button className='primaryButtonDisabled' disabled>Property sold!</button>
						)}

						{/* Bids - no bids */}
						{(listing.type === "sale" && !listing.sold && !listing.bid) && (
							<button onClick={openModal} className="primaryButton">Make a bid</button>
						)}

						{/* Bid - bid - but not from current user */}
						{(listing.type === "sale" && !listing.sold && listing.bid && listing.bidder !== auth.currentUser?.uid) && (
							<button onClick={openModal} className="primaryButton">Make a bid</button>
						)}
						
						{/* Bid - bid - from current user */}
						{(listing.type === "sale" && !listing.sold && listing.bid && listing.bidder === auth.currentUser?.uid) && (
							<button className='primaryButtonDisabled' disabled>You're the leading bidder!</button>
						)}

						{/* Rent - not rented */}
						{(listing.type === "rent" && !listing.rented) && (
							<button onClick={rentNow} className="primaryButton">Rent now</button>
						)}

						{/* Rent - rented */}
						{(listing.type === "rent" && listing.rented) && (
							<button className='primaryButtonDisabled' disabled>Property rented!</button>
						)}

						{/* Contact */}
						{!(listing.sold || listing.rented) && (
							<button onClick={contactOwner} className='primaryButton'>Contact {listing.type === "sale" ? "owner" : "landlord"}</button>
						)}
					</div>

				):(
					<div className="listingButtonsBox">
						{(listing.sold || listing.rented) ? (
							<button className='primaryButtonDisabled' disabled>Congratulations! Your property was {listing.type === "sale" ? "sold" : "rented"}!</button>
						):(
							<Link to={`/edit-listing/${params.listingId}`} className='primaryButton'>Update your listing</Link>
						)}
					</div>
				)}

			</div>

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
						height: "210px",
						margin: "auto"
					}
				}}
			>
				<p className='listingName' style={{margin: "0rem 0rem 1rem 0rem"}}>Make a bid. {listing.bid && `Current bid at $${listing.bid}.`}</p>
				<input className="bidInput" type="number" required data-type="number" onChange={onChange} />
				<button className="primaryButton" onClick={()=> makeABid(bidNumber)}>Enter bid</button>
			</Modal>
		</main>
	)
}
export default Listing