import React from 'react';

interface StrawchellLogoProps {
  className?: string;
  showText?: boolean;
  textClassName?: string;
}

/**
 * Logo vectorial fiel al isotipo oficial de strawchell (fresa minimalista a dos tonos con mordisco lateral)
 */
export const StrawchellLogo: React.FC<StrawchellLogoProps> = ({
  className = 'w-7 h-7',
  showText = true,
  textClassName = 'text-lg font-extrabold tracking-tight text-[#0F172A]',
}) => {
  return (
    <div className="inline-flex items-center gap-2 select-none">
      <svg
        viewBox="0 0 120 140"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        aria-label="strawchell logo"
      >
        <defs>
          <mask id="strawchell-bite-mask">
            <rect width="120" height="140" fill="white" />
            <circle cx="96" cy="54" r="10.5" fill="black" />
            <circle cx="101" cy="68" r="11.5" fill="black" />
            <circle cx="95" cy="81" r="10" fill="black" />
          </mask>
        </defs>
        {/* Hoja izquierda */}
        <path
          d="M58 36 C45 36, 33 27, 32 16 C43 16, 53 23, 58 36 Z"
          fill="#DC2626"
        />
        {/* Hoja derecha */}
        <path
          d="M62 36 C75 36, 87 27, 88 16 C77 16, 67 23, 62 36 Z"
          fill="#B91C1C"
        />
        {/* Tallo central */}
        <path
          d="M57 36 C57 22, 62 12, 67 7 L73 11 C68 17, 63 25, 62 36 Z"
          fill="#DC2626"
        />
        {/* Cuerpo de la fresa en 2 tonos con mordisco a la derecha */}
        <g mask="url(#strawchell-bite-mask)">
          <path
            d="M60 39 C30 39, 18 59, 22 83 C26 105, 48 131, 60 131 L60 39 Z"
            fill="#E12528"
          />
          <path
            d="M60 39 C90 39, 102 59, 98 83 C94 105, 72 131, 60 131 L60 39 Z"
            fill="#C41E22"
          />
        </g>
      </svg>
      {showText && <span className={textClassName}>strawchell</span>}
    </div>
  );
};
