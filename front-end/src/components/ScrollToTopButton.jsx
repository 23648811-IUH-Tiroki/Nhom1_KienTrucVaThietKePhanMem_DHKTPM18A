import { useState, useEffect } from "react";
import { FaArrowUp } from "react-icons/fa6";

const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      setIsVisible(scrollTop > 300); // Hiện nút khi lướt xuống > 300px
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Hàm scroll mượt với easeInOutQuad
  const scrollToTop = () => {
    const duration = 800;
    const start = window.scrollY || document.documentElement.scrollTop;
    const startTime = performance.now();

    const easeInOutQuad = (t) =>
      t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

    const animateScroll = (currentTime) => {
      const elapsedTime = currentTime - startTime;
      const progress = Math.min(elapsedTime / duration, 1);
      const easeProgress = easeInOutQuad(progress);

      window.scrollTo(0, start * (1 - easeProgress));

      if (progress < 1) {
        requestAnimationFrame(animateScroll);
      }
    };
    requestAnimationFrame(animateScroll);
  };

  return (
    <button
      className={`fixed bottom-10 right-10 p-4 rounded-full bg-[#e17100] text-white shadow-xl border-3 border-white transition-all duration-300 cursor-pointer
        transform ${
          isVisible
            ? "opacity-100 scale-100"
            : "opacity-0 scale-90 pointer-events-none"
        }
        hover:bg-[#d06a03] hover:scale-110 hover:border-opacity-80 active:scale-95`}
      aria-label="Scroll to top"
      onClick={scrollToTop}
    >
      <FaArrowUp className="w-6 h-6" />
    </button>
  );
};

export default ScrollToTopButton;
