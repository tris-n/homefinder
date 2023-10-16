import {useEffect, useState} from 'react'
import {useParams} from 'react-router-dom'
import {collection, getDocs, query, where, orderBy, limit, startAfter} from 'firebase/firestore'
import {db} from '../firebase.config'

import {toast} from 'react-toastify'

import Spinner from '../components/Spinner'
import ListingItem from '../components/ListingItem'


function Category() {

	const [listings, setListings] = useState(null)
	const [loading, setLoading] = useState(true)
	const [lastFetchedListing, setLastFetchedListing] = useState(null)

	const params = useParams()

	const resultsPerPage = 4



	useEffect(() => {

		const fetchListings = async () => {

			try {
				// Set per page variable
				const perPage = resultsPerPage

				// Get reference
				const listingsRef = collection(db, 'listings')

				// Create a query
				const q = query(
					listingsRef, 
					where('type', '==', params.categoryName),
					orderBy('timestamp', 'desc'), 
					limit(perPage + 1) // we want to grab an addition doc to check if it exists
				)

				// Execute query
				const querySnap = await getDocs(q)

				// Set last visible
				setLastFetchedListing(
					// Check if the next element exists
					// Ex: if perPage = 10, then we can get the 11th element by using the same perPage variable -> .docs[10] = 11th element
					querySnap.docs[perPage] ? querySnap.docs[querySnap.docs.length - 2] : null
				)

				// You have to loop through querySnap and add the info to an array
				const listings = []

				querySnap.forEach((doc) => {
					return listings.push({
						id: doc.id,
						data: doc.data()
					})
				})

				// If we're provided more docs than perPage, then remove the last one
				querySnap.docs.length > perPage && listings.pop()

				setListings(listings)
				setLoading(false)

			} catch (error) {
				
				toast.error('Could not fetch listings')

			}
		}

		fetchListings()

	}, [params.categoryName])


	// Pagination / Load More
	const onFetchMoreListings = async () => {

		try {

			// Set per page variable
			const perPage = resultsPerPage

			// Get reference
			const listingsRef = collection(db, 'listings')

			// Create a query
			const q = query(
				listingsRef, 
				where('type', '==', params.categoryName), 
				orderBy('timestamp', 'desc'), 
				startAfter(lastFetchedListing), 
				limit(perPage + 1))

			// Execute query
			const querySnap = await getDocs(q)

			// // Get last listing
			setLastFetchedListing(
				querySnap.docs[perPage] ? querySnap.docs[querySnap.docs.length - 2] : null
			)

			// You have to loop through querySnap and add the info to an array
			const listings = []

			querySnap.forEach((doc) => {
				return listings.push({
					id: doc.id,
					data: doc.data()
				})
			})

			querySnap.docs.length > perPage && listings.pop()

			setListings((prevState) => [...prevState, ...listings])
			setLoading(false)

		} catch (error) {
			
			toast.error('Could not fetch listings')

		}
	}



	return (
		<div className="category">
			<header>
				<div className="pageHeader">
					{params.categoryName === 'rent' ? 'Places for rent' : 'Places for sale'}
				</div>
			</header>

			{loading ? <Spinner /> : (
				listings && listings.length > 0 ? <>
					<main>
						<ul className="categoryListings">
							{listings.map((listing) => (
								<ListingItem listing={listing.data} id={listing.id} key={listing.id} />
							))}
						</ul>
					</main>

					{lastFetchedListing && (
						<p className="loadMore" onClick={onFetchMoreListings}>Load More</p>
					)}
					
				</> : <p>No listings for {params.categoryName}</p>
			)}
		</div>
	)
}
export default Category