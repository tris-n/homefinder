<a name="readme-top"></a>

<!-- PROJECT LOGO -->
<div align="left">
  <a href="https://github.com/tris-n/homefinder">
    <img src="readme/images/logo.jpg" alt="Logo" width="74" height="74">
  </a>
  
<!-- ## project_title -->
<h3 align="left" style="font-size: 24px">HomeFinder</h3>

  <p align="left">
    A dynamic platform for buying, selling, and renting properties.
    <br />
    <br />
    <a href="https://www.homefinder-app.com">View Demo</a>
    ·
    <a href="https://github.com/tris-n/homefinder/issues">Report Bug</a>
	<br />
	<br />
  </p>
</div>



<!-- TABLE OF CONTENTS -->
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#features">Features</a></li>
      </ul>
    </li>
    <li>
      <a href="#built-with">Built With</a>
      <ul>
        <li><a href="#frontend">Frontend</a></li>
        <li><a href="#backend">Backend</a></li>
        <li><a href="#database">Database</a></li>
        <li><a href="#apis">APIs</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
        <li><a href="#deployment-notes">Deployment Notes</a></li>
      </ul>
    </li>
    <li>
		<a href="#usage">Usage</a>
	</li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
  </ol>
  <br />



<!-- ABOUT THE PROJECT -->
## About The Project

HomeFinder is a one-stop platform for individuals looking to buy, sell, or rent properties. Equipped with a user-friendly interface and powerful backend, HomeFinder streamlines the property listing and transaction process.

![explore]


### Features

* Fullstack CRUD operations.
* User account creation and property listing management.
* Firebase and Firestore for robust database and resource management.
* Dynamic pricing and discount features.
* Image uploads for property showcases.
* Real-time property bidding system.
* Messaging and notification system for seamless user interaction.
* Integration with Google Maps to display property listings.
* Dynamic image carousel for recommended properties.

<p align="right">(<a href="#readme-top">back to top</a>)</p>



## Built With

### Frontend
![Javascript]
![React]
![Framer Motion]
![Leaflet]
![Swiper]
![Toastify]

### Backend
![NodeJS]
![Mongoose]
![Express]
![Firebase-Admin]
![bcryptjs]

### Database
![Firebase]
![Firestore]

### APIs
![GoogleMaps API]
![Google OAuth]



<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- GETTING STARTED -->
## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
	- Add storage to your project.
	- Set the storage rules as follows:
		```sh
		rules_version = '2';
		service firebase.storage {
			match /b/{bucket}/o {
				match /{allPaths=**} {
				allow read; 
				allow write: if request.resource.metadata.authenticated != null;
				allow delete: if resource.metadata.authenticated != null;
				}
			}
		}
		```
	- Add authentication to your project.
	- Add Firestore database to your project.
	- Set the database rules as follows:
		```sh
		rules_version = '2';
		service cloud.firestore {
			match /databases/{database}/documents {
				
				// Listings
				match /listings/{listing} {
					allow read;
					allow create: if request.auth != null && request.resource.data.imageUrls.size() < 7;
					allow delete: if request.auth != null;
					allow update: if request.auth != null;
				}
			
				// Users
				match /users/{user} {
					allow read;
					allow create;
					allow update: if request.auth != null;
				}
				
				// Backups
				match /backups/{backup} {
					allow read;
					allow create;
					allow delete: if request.auth != null;
					allow update: if request.auth != null;
				}
				
			}
		}
		```
	- Create `listings`, `users`, and `backup` collections.
	- Create the following indexes:
		![indexes]
	- If you want to create an `admin` account, add a `role: "admin` field to a user.
		
2. Create a Firebase private key.
	- In your project's `Project Settings`, select `Service Accounts`.
	- In the Firebase Admin SDK panel, select `Generate new private key`.
	- Save this to `backend/serviceAccountKey.json`.

3. Create a Google Maps API key at [Google Cloud Console](https://developers.google.com/maps/documentation/geocoding/cloud-setup).
	- In `APIs and Services`, select `Credentials`.
	- Then select `Create Credentials` and then `API key`.

4. Create a MongoDB database at [MongoDB Cloud](https://cloud.mongodb.com/). _(Note: This is only necessary if you want to have an automated backup and rollback of the site.)_

### Installation

1. Clone the repo:
	```sh
	git clone https://github.com/tris-n/homefinder.git
	```
	
2. Enter the API details in the `backendenv.example` file:
	- For `MONGO_URI`, you'll need the MongoDB connection string.
	- You can find the connection string by clicking 'Connect' on your MongoDB database page, then selecting 'Connect to your application - drivers'.
	- Your connection string should look something like:
	```sh
	mongodb+srv://<username>:<password>@<databasename>.abc123.mongodb.net/?retryWrites=true&w=majority
	```
	- For `JWT_SECRET`, you can set it to anything you like.

3. Enter the API details in the `frontendenv.example` file (it is inside the frontend folder):
	- Here you can set the login details for the demo accounts after you have created them.
	- You'll need to put in your Google Cloud API key for `REACT_APP_GEOCODE_API_KEY`.
	- You'll also need to put in your Firebase project details for `REACT_APP_FIREBASE_CONFIG`.
	- These can be found by logging into [Firebase Console](https://console.firebase.google.com/), selecting your project, then selecting 'Project Settings' from the cog icon next to 'Project Overview' in the top left of the screen.
	- Scroll down and grab the `firebaseConfig` object, converting it to JSON (by putting the keys in quotation marks, i.e., `{"apiKey": "1234", "authDomain": "www.firebaseapp.com", etc.}`) before you paste it into the `frontendenv.example` file.

4. Rename `backendenv.example` and `frontendenv.example` files to `.env`.

5. `cd` to the root folder of the project if you're not already there.
6. Install the backend dependencies:
	```sh
	npm install
	```
7. Run the server:
	```sh
	npm run server
	```

8. `cd` to the `/frontend/` folder.
9. Install the frontend dependencies:
	```sh
	npm install
	```
10. Start the frontend:
	```sh
	npm run start
	```

### Deployment Notes
- When deploying, change `.env NODE_ENV` to 'production'.
- If using Heroku, it will autobuild the frontend.
- Remember to put your frontend and backend `.env` variables into Heroku.
- Remember to comment out the automated rollback and backup functions as needed.
- Alternatively, if you don't care about backups, you can just deploy the frontend to somewhere like Vercel and it will work 100% as intended.


<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- USAGE EXAMPLES -->
## Usage

### The Homepage
Displays the most recent listings in a carousel.

![explore]

### Explore
You can either view listings based on rent/sale categories or show the listings that have discount offers. Each listing displays its price, any discounts, the number of bedrooms, bathrooms, parking spots, and its current sale status.

![listings]

### Getting Started
Create an account at [https://www.homefinder-app.com/sign-up](https://www.homefinder-app.com/sign-up). Upon registration, it will automatically log you in.

![register]

### Your Profile
This is where you can manage your listed properties, and view your current bids and successful purchases. It will also show you if you have any unread messages.

![profile]

### Creating a Listing
From your profile page, select `Sell or rent your home`.

![create]

You can choose whether to `sell` or `rent`. List how many bedrooms and bathrooms it has, whether it has a parking spot, and if it's furnished. Set the price, offer a discount, and upload photos of your property.

### Listings
When you view an individual listing, you'll be able to see all of its information, browse a carousel of photos, and see where it is located on Google Maps.

![singlelisting]

You can also immediately buy the property.

![sold]

Or make a bid on the property.

![bid]

### Messaging System
There is a messaging system where people can contact and communicate with the owners.

![contact]

![contact2]

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- CONTRIBUTING -->
## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- LICENSE -->
## License

Distributed under the MIT License. See `LICENSE.txt` for more information.

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- CONTACT -->
## Contact

Tristan - [trisn.work@gmail.com](mailto:trisn.work@gmail.com)

Project Link: [https://github.com/tris-n/homefinder](https://github.com/tris-n/homefinder)

<p align="right">(<a href="#readme-top">back to top</a>)</p>


<!-- MARKDOWN LINKS & IMAGES -->
<!-- Frontend -->
[Javascript]: https://img.shields.io/badge/Javascript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black
[React]: https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
[Material-UI]: https://img.shields.io/badge/Material--UI-0081CB?style=for-the-badge&logo=material-ui&logoColor=white
[Redux]: https://img.shields.io/badge/Redux-764ABC?style=for-the-badge&logo=redux&logoColor=white
[Firebase]: https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black
[Firestore]: https://img.shields.io/badge/Firestore-007ACC?style=for-the-badge&logo=firebase&logoColor=white
[Framer Motion]: https://img.shields.io/badge/Framer%20Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white
[ApexCharts]: https://img.shields.io/badge/ApexCharts-000000?style=for-the-badge&logo=chart-dot-js&logoColor=white
[Dayjs]: https://img.shields.io/badge/Dayjs-2D2D2D?style=for-the-badge&logo=calendar&logoColor=white
[Leaflet]: https://img.shields.io/badge/Leaflet-199900?style=for-the-badge&logo=leaflet&logoColor=white
[Swiper]: https://img.shields.io/badge/Swiper-e63327?style=for-the-badge&logo=swiper&logoColor=white
[Toastify]: https://img.shields.io/badge/Toastify-FFCA28?style=for-the-badge&logo=react-toastify&logoColor=black

<!-- Backend -->
[NodeJS]: https://img.shields.io/badge/NodeJS-339933?style=for-the-badge&logo=node-dot-js&logoColor=white
[Mongoose]: https://img.shields.io/badge/Mongoose-880000?style=for-the-badge&logo=database&logoColor=white
[Express]: https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white
[bcryptjs]: https://img.shields.io/badge/bcrypt-023E8A?style=for-the-badge&logo=bcrypt&logoColor=white
[Firebase-Admin]: https://img.shields.io/badge/Firebase_Admin-FFCA28?style=for-the-badge&logo=firebase&logoColor=black

<!-- Database -->
[MongoDB]: https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white

<!-- APIs -->
[GoogleMaps API]: https://img.shields.io/badge/GoogleMaps_API-4285F4?style=for-the-badge&logo=google-maps&logoColor=white
[Google OAuth]: https://img.shields.io/badge/Google_OAuth-4285F4?style=for-the-badge&logo=google&logoColor=white






<!-- Screenshots -->
[register]: readme/images/register.jpg
[explore]: readme/images/explore.jpg
[indexes]: readme/images/indexes.jpg

[listings]: readme/images/listings.jpg
[singlelisting]: readme/images/singlelisting.jpg
[sold]: readme/images/sold.jpg
[bid]: readme/images/bid.jpg
[contact]: readme/images/contact.jpg
[contact2]: readme/images/contact2.jpg
[profile]: readme/images/profile.jpg
[create]: readme/images/create.jpg