const MakeABid = ({action, listing}) => {

	const buttonClass = listing.sold ? "primaryButtonDisabled" : "primaryButton"
	const buttonDisabled = listing.sold ? true : false
	const buttonVisibility = {display: listing.type === "sale" ? "initial" : "none"}
	const buttonText = listing.sold ? "Sold!" : "Buy now"

	return (
		<button 
			className={buttonClass}
			style={buttonVisibility}
			onClick={action}
			disabled={buttonDisabled}
		>
			{buttonText}
		</button>
	)
}
export default MakeABid