// Framer Motion
import { motion } from "framer-motion"

// Material UI
import { Stack } from "@mui/material"



const MotionStack = ({children, ...props}) => {
	return (
		<Stack {...props}>
			<motion.div
				initial={"offscreen"}
				whileInView={"onscreen"}
				viewport={{ once: false, amount: 0.5 }}
				transition={{ staggerChildren: 0.5 }}
			>
				{children}
			</motion.div>
		</Stack>
	)
}
export default MotionStack