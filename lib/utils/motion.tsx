/**
 * @fileoverview Shared Motion Components
 * @description Pre-configured motion components for consistent animations
 */

'use client';

import { Card, Box } from '@mui/material';
import { motion } from 'framer-motion';

// Motion-enabled MUI components
export const MotionCard = motion.create(Card);
export const MotionBox = motion.create(Box);

// Re-export animation variants for convenience
export { containerVariants, itemVariants, fadeInVariants, slideUpVariants, cardHoverVariants, scaleOnHover } from './animations';

