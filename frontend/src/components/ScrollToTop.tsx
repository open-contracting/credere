import { useEffect } from "react";

function ScrollToTop() {
  useEffect(() => {
    // "document.documentElement.scrollTo" is the magic for React Router Dom v6
    document.documentElement.scrollTo({
      top: 0,
      left: 0,
    });
  }, []);

  return null;
}

export default ScrollToTop;
