/**
 * @fileoverview Shared Animation Variants
 * @description Reusable Framer Motion animation configurations
 */

import { Variants } from 'framer-motion';

// Standard page container animation with staggered children
export const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
};

// Standard item animation for lists/grids
export const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
};

// Fade in animation
export const fadeInVariants: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1 }
};

// Slide up animation
export const slideUpVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

// Scale animation for cards on hover
export const scaleOnHover = {
    whileHover: { scale: 1.02 },
    whileTap: { scale: 0.98 }
};

// Card hover lift effect
export const cardHoverVariants = {
    whileHover: { y: -4, transition: { duration: 0.2 } }
};

