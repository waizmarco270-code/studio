
"use client";

import { useState, useEffect, useRef } from 'react';

export function useTypingEffect(
  texts: string[],
  typingSpeed = 100,
  deletingSpeed = 50,
  pauseDuration = 1000
) {
  const [textIndex, setTextIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleTyping = () => {
      const currentText = texts[textIndex];
      if (isDeleting) {
        if (displayedText.length > 0) {
          setDisplayedText(currentText.substring(0, displayedText.length - 1));
          timeoutRef.current = setTimeout(handleTyping, deletingSpeed);
        } else {
          setIsDeleting(false);
          setTextIndex((prevIndex) => (prevIndex + 1) % texts.length);
        }
      } else {
        if (displayedText.length < currentText.length) {
          setDisplayedText(currentText.substring(0, displayedText.length + 1));
          timeoutRef.current = setTimeout(handleTyping, typingSpeed);
        } else {
          timeoutRef.current = setTimeout(() => setIsDeleting(true), pauseDuration);
        }
      }
    };

    timeoutRef.current = setTimeout(handleTyping, isDeleting ? deletingSpeed : typingSpeed);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [displayedText, isDeleting, textIndex, texts, typingSpeed, deletingSpeed, pauseDuration]);

  return displayedText;
}
