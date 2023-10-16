// 1. Go to Firebase Console: Open your Firebase project in the Firebase Console at https://console.firebase.google.com/.
// 2. Project Settings: Click on the gear icon (⚙️) next to "Project Overview" in the left-hand menu, then select "Project settings."
// 3. Service Accounts Tab: In the "Project settings" page, click on the "Service accounts" tab.
// 4. Firebase Admin SDK Section: Scroll down to the "Firebase Admin SDK" section.
// 5. Generate New Private Key: Under the "Firebase Admin SDK" section, you should see a button labeled "Generate new private key." Click on that button.
// 6. Download the File: A popup will appear asking if you want to generate a new private key. Click "Generate key" to create the file. The serviceAccountKey.json file will be downloaded to your computer.
// 7. Move the File: Move the downloaded serviceAccountKey.json file to a secure location in your backend project directory. You'll use this file to initialize the Firebase Admin SDK and authenticate your server with Firebase services.
// 8. Load the Service Account Key: In your backend code (where you set up Firebase Admin SDK), use the path to the serviceAccountKey.json file to initialize the Firebase Admin SDK.

// Firebase
import admin from 'firebase-admin'
import serviceAccount from '../serviceAccountKey.json' assert { type: 'json' }

admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
})

const firestore = admin.firestore()



// Get the current time
export const timeNow = () => {
	return new Date().toLocaleString()
}



// GET A SINGLE COLLECTION
export const getCollection = async (collectionName) => {

	let results = []
	
	try {

		const snapshot = await firestore.collection(collectionName).get()

		if (snapshot.empty) {
			console.log('No listings found.')
			return
		}

		snapshot.forEach((doc) => {
			results.push({
				_id: doc.id,
				data: doc.data(),
			})

		})

		return results

	} catch (error) {
		console.error('Error fetching listings:', error)
	}

}



// BACKUP COLLECTIONS
export const backupCollections = async () => {

	// Get all collections
	const listings = await getCollection("listings")
	const users = await getCollection("users")

	// Create backup
	try {
		
		const newBackupRef = firestore.collection('backup').doc()
		await newBackupRef.set({
			listings,
			users,
			timestamp: admin.firestore.FieldValue.serverTimestamp(),
		})

		console.log(`Backup successfully written to Firestore!`)

	} catch (error) {
		console.error('Error writing listing to Firestore:', error)
	}

}


// DELETE SINGLE COLLECTION
export const deleteCollection = async (collectionName) => {

	try {

		const collectionRef = firestore.collection(collectionName)

		const querySnapshot = await collectionRef.get()
		const batch = firestore.batch()

		if (querySnapshot.empty) {
			console.log(`No documents found in '${collectionName}' to delete.`)
			return null
		}

		querySnapshot.forEach((doc) => {
			batch.delete(doc.ref)
		})

		await batch.commit()

		console.log(`All documents in '${collectionName}' collection deleted.`)

	} catch (error) {
		console.error(`Error deleting collection '${collectionName}':`, error)
	}
}



// GET SINGLE BACKUP DOCUMENT
export const getBackupDocument = async (collectionName) => {

	console.log(`hitting ${collectionName}`)
	try {

		const querySnapshot = await firestore.collection(collectionName)
			// .orderBy('timestamp') // gets oldest
			.orderBy('timestamp', 'desc') // gets latest
			.limit(1)
			.get()

		if (querySnapshot.empty) {
			console.log(`No documents found in the ${collectionName} collection.`)
			return null
		}

		// get the first document
		const oldestDocument = querySnapshot.docs[0].data()

		return oldestDocument
		
	} catch (error) {
		console.error('Error getting oldest document:', error)
		return null
	}
}



// SAVE SINGLE DOCUMENT TO FIREBASE
export const saveSingleDocument = async (collectionName, documentData) => {
	
	try {
					
		const newBackupRef = firestore.collection(collectionName).doc(documentData._id)
		await newBackupRef.set(documentData.data)
	
		console.log(`${collectionName} successfully written to Firestore!`)
	
	} catch (error) {
		console.error(`Error writing ${collectionName} to Firestore:`, error)
	}

}



// REPOPULATE COLLECTIONS
export const repopulateCollection = async () => {

	// GET FIRST BACKUP
	const backup = await getBackupDocument('backup')

	// DELETE ALL COLLECTIONS
	await deleteCollection('listings')
	await deleteCollection('users')

	// LOOP THROUGH BACKUP
		// SAVE EACH OBJECT IN EACH COLLECTION TO FIREBASE
		
		// listings
		for (const listing of backup.listings) {
			await saveSingleDocument('listings', listing)
		}
		
		// users
		for (const user of backup.users) {
			await saveSingleDocument('users', user)
		}

		console.log(`\nRepopulated the database at ${timeNow()}.\n`)

}



// AUTOMATED REPOPULATION
export const automatedRollback = async () => {

	console.log(`Automated Rollback running.`)

	// run once on start
	await repopulateCollection()

	// then run every 24 hours (start with 2 minutes 120,000)
	// 24 * 60 * 60 * 1000 = 86400000
	let updateFrequency = 24 * 60 * 60 * 1000 // 86,400,000 // 1000 = 1second

	setInterval(() => {

		repopulateCollection()

	}, updateFrequency)


}