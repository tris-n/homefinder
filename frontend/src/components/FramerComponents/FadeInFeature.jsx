// Framer Motion
import { motion } from "framer-motion"
import { featureAnimate } from "./motionstyles"


const FadeInFeature = ({settings, children}) => {
	return (
		<motion.div
			variants={featureAnimate}
		>
			{children}
		</motion.div>
	)
}
export default FadeInFeature