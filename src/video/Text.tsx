import React, { useRef, useState, useLayoutEffect, useCallback } from 'react';

interface TextProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  maxFontSize?: number;
  minFontSize?: number;
}

const Text: React.FC<TextProps> = ({
  children,
  className,
  maxFontSize = 200,
  minFontSize = 10,
  ...props
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [fontSize, setFontSize] = useState(maxFontSize);

  const adjustFontSize = useCallback(() => {
    const container = containerRef.current;
    const text = textRef.current;

    if (!container || !text) {
      return;
    }

    let currentFontSize = maxFontSize;
    text.style.fontSize = `${currentFontSize}px`;

    while (
      (text.scrollWidth > container.clientWidth || text.scrollHeight > container.clientHeight) &&
      currentFontSize > minFontSize
    ) {
      currentFontSize -= 1;
      text.style.fontSize = `${currentFontSize}px`;
    }
    setFontSize(currentFontSize);
  }, [maxFontSize, minFontSize]);

  useLayoutEffect(() => {
    adjustFontSize();
  }, [children, adjustFontSize]);

  return (
    <div
      ref={containerRef}
      className={`w-full h-full flex justify-center items-center overflow-hidden ${className || ''}`}
      {...props}
    >
      <span
        ref={textRef}
        style={{
          fontSize: `${fontSize}px`,
          lineHeight: '1',
          whiteSpace: 'wrap',
          textShadow: `
            -4px -4px 0 #fff,  
            4px -4px 0 #fff,   
            -4px 4px 0 #fff,   
            4px 4px 0 #fff,    
            0px 4px 0 #fff,    
            4px 0px 0 #fff,    
            0px -4px 0 #fff,   
            -4px 0px 0 #fff    
          `,
        }}
        className="text-center"
      >
        {children}
      </span>
    </div>
  );
};

export default Text;