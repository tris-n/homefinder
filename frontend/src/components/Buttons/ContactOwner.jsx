const ContactOwner = ({listing}) => {

	return (
		<button className="primaryButton">Contact {listing.type === "sale" ? "owner" : "landlord"}</button>
	)
}
export default ContactOwner