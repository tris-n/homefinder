import {useState, useEffect, useRef} from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import {getAuth, onAuthStateChanged} from 'firebase/auth'
import {getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject} from 'firebase/storage'
import {doc, updateDoc, getDoc, serverTimestamp} from 'firebase/firestore'
import {db} from '../firebase.config'
import {v4 as uuidv4} from 'uuid'

import {toast} from 'react-toastify'
import Spinner from '../components/Spinner'



function EditListing() {

	// eslint-disable-next-line
	const [geolocationEnabled, setGeolocationEnabled] = useState(true) // set this to false in production OR use google's geocoding API instead of positionStack which is buggy
	const [loading, setLoading] = useState(false)
	const [listing, setListing] = useState(false)

	// create array for images the user wants to delete
	const [imagesToRemove, setImagesToRemove] = useState([]) 
	
	const [formData, setFormData] = useState({
		type: 'rent',
		name: '',
		bedrooms: 1,
		bathrooms: 1,
		parking: false,
		furnished: false,
		address: '',
		offer: false,
		regularPrice: 0,
		discountedPrice: 0,
		images: {},
		latitude: 0,
		longitude: 0,
	})

	const {type, name, bedrooms, bathrooms, parking, furnished, address, offer, regularPrice, discountedPrice, images, latitude, longitude} = formData

	const auth = getAuth()
	const navigate = useNavigate()
	const params = useParams()
	const isMounted = useRef(true)

	const [isAdmin, setIsAdmin] = useState(false)

	// Redirect if listing is not users
	useEffect(() => {

		// Check if logged in user is admin
		const getUserRole = async () => {

			const userRef = doc(db, 'users', auth.currentUser.uid)
			const docSnap = await getDoc(userRef)

			if (docSnap.exists()) {
				if (docSnap.data().role === "admin") {
					setIsAdmin(true)
				}
			}

		}

		getUserRole()

		if (listing && listing.userRef !== auth.currentUser.uid && isAdmin === false) {
			toast.error('You can not edit that listing')
			navigate('/')
		}
	}, [auth.currentUser.uid, listing, navigate, isAdmin])

	// Fetch listing to edit
	useEffect(() => {

		setLoading(true)
		const fetchListing = async () => {
			const docRef = doc(db, 'listings', params.listingId)
			const docSnap = await getDoc(docRef)

			if (docSnap.exists()) {
				setListing(docSnap.data())
				setFormData({
					...docSnap.data(), address: docSnap.data().location
				})
				setLoading(false)
			} else {
				navigate('/')
				toast.error('Listing does not exist')
			}
		}

		fetchListing()

	}, [params.listingId, navigate])

	// Sets userRef to logged in user
	useEffect(() => {

		if (isMounted) {
			onAuthStateChanged(auth, (user) => {
				if (user) {
					setFormData({
						...formData,
						userRef: user.uid,
					})
				} else {
					navigate('/sign-in')
				}
			})
		}

		return () => {
			isMounted.current = false
		}

	}, [isMounted])


	// When form is submitted
	const onSubmit = async (e) => {
		e.preventDefault()
		
		setLoading(true)

		// Form check
		if (+discountedPrice >= +regularPrice) {
			setLoading(false)
			toast.error('Discounted price needs to be less than regular price')
			return
		}

		// Get geolocation from PositionStack
		let geolocation = {}
		let location

		let APIKEY = process.env.REACT_APP_GEOCODE_API_KEY

		if (geolocationEnabled) {

			const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${APIKEY}`)

			const data = await response.json()

			geolocation.lat = data.results[0]?.geometry.location.lat ?? 0
			geolocation.lng = data.results[0]?.geometry.location.lng ?? 0

			location = data.status === 'ZERO_RESULTS' ? undefined : data.results[0]?.formatted_address

			if (location === undefined || location.includes('undefined')) {
				setLoading(false)
				toast.error('Please enter a correct address... street, suburb, state, postcode')
				return
			}

		} else {
			geolocation.lat = latitude
			geolocation.lng = longitude
		}

		// Store images in firebase
		const storeImage = async (image) => {
			return new Promise((resolve, reject) => {
				const storage = getStorage()
				const fileName = `${params.listingId}-${image.name}-${uuidv4()}`

				const storageRef = ref(storage, 'images/' + fileName)

				const uploadTask = uploadBytesResumable(storageRef, image)

				uploadTask.on(
					'state_changed',
					(snapshot) => {
						const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
						
						// console.log('Upload is ' + progress + '% done')

						switch (snapshot.state) {
							case 'paused':
								console.log('Upload is paused')
								break
							case 'running':
								console.log('Upload is running')
								break
							default:
								break
						}
					},
					(error) => {
						reject(error)
					},
					() => {
					// Handle successful uploads on complete
					// For instance, get the download URL: https://firebasestorage.googleapis.com/...
						getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
							resolve(downloadURL)
						})
					}
				)

			})
		}


		// Throw an error if new image TOTAL is not 6 or less
		const availableImageStorage = 6 - listing.imageUrls.length + imagesToRemove.length
		// Return an error only if new images were added AND the total files exceeds 6
		if (images && images.length > availableImageStorage) {
			setLoading(false)
			toast.error('Image Upload failed - too many total images for this listing')
			return
		}

		// IF new images were uploaded, store the returned imageUrls in a new array
		let newImageUrls
		if (images) {
			newImageUrls = await Promise.all(
				[...images].map((image) => storeImage(image))
			).catch(() => {
				setLoading(false)
				toast.error('Images not uploaded')
				return
			})
		}


		
		// Delete pictures from firebase filestorage
		// WARNING: THIS WILL BREAK YOUR BACKEDUP REFERENCES AS THEY WILL POINT TO DELETED IMAGES

		// // Function to delete an image from storage
		const deleteImage = async (imgUrl) => {
			// Split url to get the filename in the middle
			let fileName = imgUrl.split('images%2F')
			fileName = fileName[1].split('?alt')
			fileName = fileName[0]

			const storage = getStorage()

			// Create a reference to the file to delete
			const imgRef = ref(storage, `images/${fileName}`)

			// Returns a promise
			return deleteObject(imgRef)
		}

		// Delete each image in imagesToRemove from storage
		imagesToRemove.forEach(async (imgUrl) => {
			await deleteImage(imgUrl)
				.then(() => {
					toast.success('Image was successfully removed from storage')
				})
				.catch((error) => {
					// console.log(error)
					toast.error('Deletion failed')
					setLoading(false)
				})
		})



		// Remove all imagesToRemove from current imageUrls for this listing
		const remainingListingImages = listing.imageUrls.filter(
			(val) => !imagesToRemove.includes(val)
		)

		// Merge ImageUrls with newImageUrls (if defined) > Then delete newImageUrls
		let mergedImageUrls
		if (newImageUrls) {
			mergedImageUrls = [...remainingListingImages, ...newImageUrls]
		} else {
			mergedImageUrls = [...remainingListingImages]
		}


		const formDataCopy = {
			...formData,
			imageUrls: mergedImageUrls,
			geolocation,
			timestamp: serverTimestamp()
		}

		formDataCopy.location = address
		delete formDataCopy.images
		delete formDataCopy.address
		!formDataCopy.offer && delete formDataCopy.discountedPrice

		// Update listing
		const docRef = doc(db, 'listings', params.listingId)
		await updateDoc(docRef, formDataCopy)
	
		setLoading(false)

		toast.success('Listing saved')

		navigate(`/category/${formDataCopy.type}/${docRef.id}`)
	}
	


	// Handles form data changes
	const onMutate = (e) => {
		
		// let boolean = null
		let newValue = e.target.value

		if (e.target.value === 'true') {
			newValue = true
		}
		
		if (e.target.value === 'false') {
			newValue = false
		}

		// Files
		if (e.target.files) {
			setFormData((prevState) => ({
				...prevState,
				images: e.target.files
			}))
		}

		// Text/Booleans/Numbers
		if (!e.target.files) {
			setFormData((prevState) => ({
				...prevState,
				[e.target.id]: newValue
			}))
		}
	}


	// handleChange on image checkboxes
	const handleChange = (e) => {

		if (e.target.checked) {
			// Case 1: The user checks the box
			setImagesToRemove([...imagesToRemove, e.target.value])
		} else {
			// Case 2: The user unchecks the box
			setImagesToRemove((current) => 
				current.filter((url) => {
					return url !== e.target.value
				})
			)
		}
	}



	if (loading) {
		return <Spinner />
	}

	return (
		<div className="profile">
			<header>
				<div className="pageHeader">Edit Listing</div>
			</header>

			<main>
				<form onSubmit={onSubmit}>
					<label className='formLabel'> Sell / Rent</label>
					<div className="formButtons">
						
						<button type='button' className={type === 'sale' ? 'formButtonActive' : 'formButton'} id="type" value='sale' onClick={onMutate}>
							Sell
						</button>
						
						<button type='button' className={type === 'rent' ? 'formButtonActive' : 'formButton'} id="type" value='rent' onClick={onMutate}>
							Rent
						</button>

					</div>

					<label className='formLabel'>Name</label>
					<input
						className='formInputName'
						type='text'
						id='name'
						value={name}
						onChange={onMutate}
						maxLength='32'
						minLength='10'
						required
					/>

					<div className='formRooms flex'>
						<div>
							<label className='formLabel'>Bedrooms</label>
							<input
								className='formInputSmall'
								type='number'
								id='bedrooms'
								value={bedrooms}
								onChange={onMutate}
								min='1'
								max='50'
								required
							/>
						</div>

						<div>
							<label className='formLabel'>Bathrooms</label>
							<input
								className='formInputSmall'
								type='number'
								id='bathrooms'
								value={bathrooms}
								onChange={onMutate}
								min='1'
								max='50'
								required
							/>
						</div>
					</div>

					<label className='formLabel'>Parking spot</label>
					<div className='formButtons'>
						<button
							className={parking ? 'formButtonActive' : 'formButton'}
							type='button'
							id='parking'
							value={true}
							onClick={onMutate}
							min='1'
							max='50'
						>
							Yes
						</button>
						<button
							className={
							!parking && parking !== null ? 'formButtonActive' : 'formButton'
							}
							type='button'
							id='parking'
							value={false}
							onClick={onMutate}
						>
							No
						</button>
					</div>

					<label className='formLabel'>Furnished</label>
					<div className='formButtons'>
						<button
							className={furnished ? 'formButtonActive' : 'formButton'}
							type='button'
							id='furnished'
							value={true}
							onClick={onMutate}
						>
							Yes
						</button>
						<button
							className={
							!furnished && furnished !== null
							? 'formButtonActive'
							: 'formButton'
							}
							type='button'
							id='furnished'
							value={false}
							onClick={onMutate}
						>
							No
						</button>
					</div>

					<label className='formLabel'>Address</label>
					<textarea
						className='formInputAddress'
						type='text'
						id='address'
						value={address}
						onChange={onMutate}
						required
					/>

					{!geolocationEnabled && (
						<div className='formLatLng flex'>
							<div>
								<label className='formLabel'>Latitude</label>
								<input
									className='formInputSmall'
									type='number'
									id='latitude'
									value={latitude}
									onChange={onMutate}
									required
								/>
							</div>
							<div>
								<label className='formLabel'>Longitude</label>
								<input
									className='formInputSmall'
									type='number'
									id='longitude'
									value={longitude}
									onChange={onMutate}
									required
								/>
							</div>
						</div>
					)}

					<label className='formLabel'>Offer</label>
					<div className='formButtons'>
						<button
							className={offer ? 'formButtonActive' : 'formButton'}
							type='button'
							id='offer'
							value={true}
							onClick={onMutate}
						>
							Yes
						</button>
						<button
							className={
							!offer && offer !== null ? 'formButtonActive' : 'formButton'
							}
							type='button'
							id='offer'
							value={false}
							onClick={onMutate}
						>
							No
						</button>
					</div>

					<label className='formLabel'>Regular Price</label>
					<div className='formPriceDiv'>
						<input
							className='formInputSmall'
							type='number'
							id='regularPrice'
							value={regularPrice}
							onChange={onMutate}
							min='50'
							max='750000000'
							required
						/>
						{type === 'rent' && <p className='formPriceText'>$ / Month</p>}
					</div>

					{offer && (
						<>
							<label className='formLabel'>Discounted Price</label>
							<input
								className='formInputSmall'
								type='number'
								id='discountedPrice'
								value={discountedPrice}
								onChange={onMutate}
								min='50'
								max='750000000'
								required={offer}
							/>
						</>
					)}

					{/* Display Current Images (noting cover) with Delete Buttons -> Then display "Add Image" option */}
					<label className='formLabel'>Listing Images</label>
					<p style={{ paddingLeft: '10px', fontSize: '0.8rem'}}>
						DELETE: Check the box of each image you wish to delete
					</p>
					<div className="editListingImgContainer" style={{
						display: 'flex', 
						flexWrap: 'wrap',
						gap: '25px',
					}}>
						{listing?.imageUrls && listing.imageUrls.map((img, index) => (
							<div key={index} className="editListingImg" style={{
								background: `url(${img}) center no-repeat`, 
								backgroundSize: 'cover',
								width: '290px',
								height: '230px',
								borderRadius: '0.5rem',
								position: 'relative',
							}}>
								{index === 0 && <p className='editListingImgText' style={{
									position: 'absolute',
									top: '5px',
									padding: '10px',
									fontWeight: 'bold',
									color: 'white',
									backgroundColor: 'black',
								}}>Cover</p>}
								<input type="checkbox" id='imageDelete' name='imageDelete' value={img} onChange={handleChange} style={{
									position: 'absolute',
									top: '20px',
									right: '20px',
									height: '30px',
									width: '30px',
									borderRadius: '0.5rem',
								}} />
							</div>
						))}
					</div>

					{/* Displays the number of remaining spots available after checked images are deleted */}
					<p style={{ paddingLeft: '10px', fontSize: '0.8rem'}}>
						ADD: Choose files to add. (
							{listing?.imageUrls && imagesToRemove && ` ${6 - listing.imageUrls.length + imagesToRemove.length} image slots remaining`}{' '}
						- Max 6 total)
					</p>

					<input
						className='formInputFile'
						type='file'
						id='images'
						onChange={onMutate}
						max='6'
						accept='.jpg,.png,.jpeg'
						multiple
					/>
					<button type='submit' className='primaryButton createListingButton'>
						Update Listing
					</button>

				</form>
			</main>
		</div>
	)
}
export default EditListing