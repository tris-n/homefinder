const RentNow = ({listing}) => {

	const buttonSettings = {
		display: listing.type === "rent" ? "initial" : "none"
	}

	return (
		<button className="primaryButton" style={buttonSettings}>Rent now</button>
	)
}
export default RentNow