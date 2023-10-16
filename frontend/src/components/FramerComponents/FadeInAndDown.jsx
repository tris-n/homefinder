// Framer Motion
import { motion } from "framer-motion"
import { welcomeTextAnimate } from "./motionstyles"


const FadeInAndDown = ({settings, children}) => {
	return (
		<motion.div
			variants={welcomeTextAnimate}
		>
			{children}
		</motion.div>
	)
}
export default FadeInAndDown