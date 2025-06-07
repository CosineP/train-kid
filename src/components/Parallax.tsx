import React, { useEffect, useState } from "react";

const Parallax = ({ children, scrollRef }: { children: React.ReactNode, scrollRef: React.RefObject<HTMLElement> }) => {
  const [offsetY, setOffsetY] = useState(0);
  const [offsetX, setOffsetX] = useState(0);

  useEffect(() => {
    if (!scrollRef.current) {
      return;
    }
    const onScrollY = () => {
      setOffsetY(window.scrollY);
    };
    const onScrollX = (e: Event) => {
      // @ts-ignore
      setOffsetX(e.target!.scrollLeft);
    };

    window.addEventListener("scroll", onScrollY, { passive: true });
    scrollRef.current.addEventListener("scroll", onScrollX, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScrollY);
      scrollRef.current?.removeEventListener("scroll", onScrollX);
    }
  }, [scrollRef]);

  return (
    <div
      style={{
        transform: `translate(${offsetX * -0.6}px, ${offsetY * -0.7}px)`,
        pointerEvents: 'none',
        zIndex: 10,
        position: 'relative',
      }}
    >
      {children}
    </div>
  );
};

export default Parallax;
