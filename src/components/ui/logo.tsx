// src/components/BlindAppLogo.jsx
"use client";

import React from "react";
import { useTheme } from "next-themes";

const BlindAppLogo = ({ className = "" }) => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const textColorMain = isDark ? "#FFFFFF" : "#1F2937"; // gray-800
  // const textColorSub = isDark ? "#9CA3AF" : "#4B5563"; // gray-400
  const rectColor = isDark ? "#111827" : "#FFFFFF"; // gray-900 / white

  return (
    <div className={`inline-flex items-center ${className}`}>
      <svg
        width="220"
        height="50"
        viewBox="0 0 220 50"
        xmlns="http://www.w3.org/2000/svg"
        className="h-10 w-auto transition-colors duration-300"
      >
        {/* "Blind" text */}
        <text
          x="20"
          y="35"
          fontFamily="Helvetica, Arial, sans-serif"
          fontSize="32"
          fontWeight="bold"
          fill={textColorMain}
        >
          Blind
        </text>

        {/* "app" text */}
        {/*<text*/}
        {/*    x="128"*/}
        {/*    y="35"*/}
        {/*    fontFamily="Helvetica, Arial, sans-serif"*/}
        {/*    fontSize="32"*/}
        {/*    fontWeight="300"*/}
        {/*    fill={textColorSub}*/}
        {/*>*/}
        {/*    app*/}
        {/*</text>*/}

        {/* Bar over 'B' */}
        <rect x="20" y="19" width="22" height="4" fill={rectColor} />
      </svg>
    </div>
  );
};

export default BlindAppLogo;
