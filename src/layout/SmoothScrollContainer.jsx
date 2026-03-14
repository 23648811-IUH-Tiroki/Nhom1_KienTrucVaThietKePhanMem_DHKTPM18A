import { motion, useScroll, useSpring } from "framer-motion";
import PropTypes from "prop-types";
import { useEffect } from "react";

const SmoothScrollContainer = ({ children }) => {
  const { scrollYProgress } = useScroll();

  const physics = {
    damping: 15,
    mass: 0.1,
    stiffness: 80,
    restDelta: 0.001,
  };

  const springScroll = useSpring(scrollYProgress, physics);

  useEffect(() => {
    const handleRouteChange = () => {
      window.scrollTo(0, 0);
    };
    
    window.addEventListener("popstate", handleRouteChange);
    return () => window.removeEventListener("popstate", handleRouteChange);
  }, []);

  return (
    <>
      <motion.div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: "5px",
          background: "#3b82f6",
          transformOrigin: "0%",
          scaleX: springScroll,
          zIndex: 999,
        }}
      />
      {children}
    </>
  );
};

SmoothScrollContainer.propTypes = {
  children: PropTypes.node.isRequired,
};

export default SmoothScrollContainer;
