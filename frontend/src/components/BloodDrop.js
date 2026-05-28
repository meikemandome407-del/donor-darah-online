import React from 'react';

/**
 * BloodDrop - reusable SVG tetes darah yang selaras dengan warna tema utama (#d32f2f).
 * Props:
 *  - size  : ukuran (default '1em'), bisa '24px', '2rem', dll.
 *  - color : warna fill (default 'var(--primary)')
 *  - style : tambahan style inline
 *  - className : tambahan class
 */
const BloodDrop = ({ size = '1em', color = 'var(--primary)', style = {}, className = '' }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill={color}
    className={className}
    style={{ verticalAlign: 'middle', flexShrink: 0, ...style }}
    aria-hidden="true"
  >
    <path d="M12 2C12 2 4 9.4 4 15a8 8 0 0 0 16 0C20 9.4 12 2 12 2Z" />
    <path
      d="M12 21.5C10.2 21.5 8.7 20.5 8 19a5 5 0 0 0 8 0c-.7 1.5-2.2 2.5-4 2.5Z"
      fill="white"
      fillOpacity="0.25"
    />
  </svg>
);

export default BloodDrop;
