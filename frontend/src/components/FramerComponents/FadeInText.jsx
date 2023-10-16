// Framer Motion
import { motion } from "framer-motion"
import { textAnimate } from "./motionstyles"


const FadeInText = ({settings, children}) => {
	return (
		<motion.div
			variants={textAnimate}
		>
			{children}
		</motion.div>
	)
}
export default FadeInText