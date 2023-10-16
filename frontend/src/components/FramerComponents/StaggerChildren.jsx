// Framer Motion
import { motion } from "framer-motion"
import { staggerContainer } from "./motionstyles"


const StaggerChildren = ({settings, children}) => {
	return (
		<motion.div
			variants={staggerContainer}
			initial="offscreen"
			whileInView="onscreen"
			viewport={{
				once: true,
				amount: 0.2,
			}}
			transition={{
				staggerChildren: 0.5,
			}}
		>
			{children}
		</motion.div>
	)
}
export default StaggerChildren