import { useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

interface ParallaxBackgroundProps {
  children?: React.ReactNode;
}

export function ParallaxBackground({ children }: ParallaxBackgroundProps) {
  const { scrollY } = useScroll();
  
  const y1 = useTransform(scrollY, [0, 1000], [0, -200]);
  const y2 = useTransform(scrollY, [0, 1000], [0, -100]);
  const y3 = useTransform(scrollY, [0, 1000], [0, -50]);

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background Layer 1 - Slowest */}
      <motion.div
        style={{ y: y1 }}
        className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5"
      />
      
      {/* Background Layer 2 - Medium */}
      <motion.div
        style={{ y: y2 }}
        className="absolute inset-0 bg-gradient-radial from-transparent via-primary/3 to-transparent"
      />
      
      {/* Background Layer 3 - Fastest */}
      <motion.div
        style={{ y: y3 }}
        className="absolute inset-0 bg-gradient-to-t from-accent/3 via-transparent to-primary/3"
      />
      
      {/* Animated Grid */}
      <div className="absolute inset-0 opacity-20">
        <div className="h-full w-full bg-grid animate-pulse" />
      </div>
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}