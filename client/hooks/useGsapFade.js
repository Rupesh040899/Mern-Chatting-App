'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

export const useGsapFade = () => {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;
    gsap.fromTo(
      ref.current,
      { autoAlpha: 0, y: 30 },
      { autoAlpha: 1, y: 0, duration: 0.9, ease: 'power3.out' }
    );
  }, []);

  return ref;
};
