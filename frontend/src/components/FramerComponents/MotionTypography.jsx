// Framer Motion
import { motion } from "framer-motion"

// Material UI
import { Typography } from "@mui/material"

// Motion Settings
const CustomMotionTypography = motion(Typography)

const animateText = {
	offscreen: {
		y: -50, 
		opacity: 0,
	},
	onscreen: {
		y: 0,
		opacity: 1,
	},
	transition: {
		type: "spring",
		bounce: 0.4,
		duration: 1,
	},
}

const MotionTypography = ({children, ...props}) => {
	return (
		<CustomMotionTypography
			variants={animateText}
			initial={"offscreen"}
			animate={"onscreen"}
			{...props}
		>
			{children}
		</CustomMotionTypography>
	)
}
export default MotionTypography