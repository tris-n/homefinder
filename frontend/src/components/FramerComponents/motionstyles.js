export const welcomeTextAnimate = {
	offscreen: {
		y: -10, 
		opacity:0
	},
	onscreen: {
		y: 0,
		opacity: 1,
		transition: {
			type: "spring",
			bounce: 0.4,
			duration: 2.5
		},
	},
}

export const textAnimate = {
	offscreen: {
		opacity:0
	},
	onscreen: {
		opacity: 1,
		transition: {
			type: "spring",
			bounce: 0.4,
			duration: 2.5
		},
	},
}

export const featureAnimate = {
	offscreen: {
		opacity:0
	},
	onscreen: {
		opacity: 1,
		transition: {
			type: "spring",
			bounce: 0.4,
			duration: 2.5
		},
	},
}


export const staggerContainer = {
    offscreen: {},
    onscreen: {
        transition: {
            staggerChildren: 0.3
        }
    }
}


export const hoverThumbnail = {
	hidden: { opacity: 0 },
	visible: { opacity: 1 },
}