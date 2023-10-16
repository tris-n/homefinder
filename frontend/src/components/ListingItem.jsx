import { useEffect, useState } from 'react'
import {Link, useLocation} from 'react-router-dom'

// Firebase
import { updateDoc, doc, collection, getDoc, getDocs, query, where, orderBy, deleteDoc } from 'firebase/firestore'
import { db } from '../firebase.config'

// React Modal
import Modal from 'react-modal'

// Components
import bedIcon from '../assets/svg/bedIcon.svg'
import bathtubIcon from '../assets/svg/bathtubIcon.svg'
import deleteIcon from '../assets/png/delete.png'
import editIcon from '../assets/png/draw.png'



function ListingItem({listing, id, onDelete, onEdit, admin, currentUser}) {

	const location = useLocation()

	const [ownerName, setOwnerName] = useState(null)
	const [rentedToName, setRentedToName] = useState(null)
	const [soldToName, setSoldToName] = useState(null)
	const [bidderName, setBidderName] = useState(null)


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


	useEffect(() => {

		const fetchNames = async () => {

			// function to get user name from reference
			const getUserName = async (user) => {
				const userRef = doc(db, 'users', user)
				const docSnap = await getDoc(userRef)
	
				if (docSnap.exists()) {
					return docSnap.data().name
				} else {
					console.log("No such document!")
					return null
				}
			}

			// set owner name
			const owner = await getUserName(listing.userRef)
			setOwnerName(owner)
			
			// set rentedTo name
			if (listing.rentedTo) {
				if (currentUser === listing.rentedTo) {
					setRentedToName("you!")
				} else {
					const renter = await getUserName(listing.rentedTo)
					setRentedToName(renter)
				}
			}
			
			// set soldTo name
			if (listing.soldTo) {
				if (currentUser === listing.soldTo) {
					setSoldToName("you!")
				} else {
					const buyer = await getUserName(listing.soldTo)
					setSoldToName(buyer)
				}
			}

			// set bidder name
			if (listing.bidder) {
				if (currentUser === listing.bidder) {
					setBidderName("you!")
				} else {
					const bidder = await getUserName(listing.bidder)
					setBidderName(bidder)
				}
			}
		}

		fetchNames()

	}, [])




	return (
		<li className="categoryListing">
			<Link to={`/category/${listing.type}/${id}`} className="categoryListingLink">
				<div className="imageRatioBox">
					<img src={listing.imageUrls[0]} alt={listing.name} className='categoryListingImg' />
				</div>

				<div className="categoryListingDetails">
					{admin && (
						<p className="categoryListingLocation">Owner: {ownerName}</p>
					)}
					<p className="categoryListingLocation">{listing.location}</p>
					<p className="categoryListingName">{listing.name}</p>
					<div className="categoryListingPriceHoldingDiv">
						<p className="categoryListingPrice">
							${listing.offer ? listing.discountedPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') : listing.regularPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}

							{listing.type === 'rent' && ' / Month'}
						</p>
						{ listing.offer && (
							<p className="discountPrice">
								${(listing.regularPrice - listing.discountedPrice).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')} discount
							</p>
						)}
					</div>
					<div className="categoryListingInfoDiv">
						<div className='categoryListingInfoHolder'>
							<img src={bedIcon} alt="bed" />
							<p className="categoryListingInfoText">
								{listing.bedrooms > 1 ? `${listing.bedrooms} Bedrooms` : `1 Bedroom`}
							</p>
						</div>
						<div className='categoryListingInfoHolder'>
							<img src={bathtubIcon} alt="bath" />
							<p className="categoryListingInfoText">
								{listing.bathrooms > 1 ? `${listing.bathrooms} Bathrooms` : `1 Bathroom`}
							</p>
						</div>
					</div>
					
					{/* listing types */}
					<div style={{marginTop: "5px"}}>

						{/* Rented */}
						{ listing.rented && <div className="listingType listingSuccess">Rented {location.pathname === "/profile" && `to ${rentedToName}`}</div>}

						{/* Sold */}
						{ listing.sold && <div className="listingType listingSuccess">Sold {location.pathname === "/profile" && `to ${soldToName}`}</div>}

						{/* For Rent */}
						{ (listing.type === 'rent' && !listing.rented) && <div className="listingType">For Rent</div>}

						{/* For Sale */}
						{ (listing.type === 'sale' && !listing.sold) && <div className="listingType">For Sale</div>}

						{/* If bid */}
						{ (listing.type === 'sale' && !listing.sold && listing.bidder) && <div className="listingType listingSuccess">Current bid of ${listing.bid} {location.pathname === "/profile" && `from ${bidderName}`}</div>}
						
					</div>




				</div>
			</Link>

			{onEdit && (currentUser === listing.userRef || admin) && (
				<button className='editIcon' onClick={() => onEdit(id)} style={{marginRight: "0.5rem"}}>
					<img src={editIcon} alt="Edit" />
				</button>
			)}

			{onDelete && (currentUser === listing.userRef || admin) && (
				<button className='removeIcon' onClick={() => openModal()}>
					<img src={deleteIcon} alt="Delete" />
				</button>
			)}

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

				<button onClick={() => onDelete(listing.id, listing.name)} className='buttonDelete'>Delete</button>

			</div>
		</Modal> 

		</li>
	)
}
export default ListingItem