
import React from 'react';
import type { IconName } from '../types';

interface IconProps {
  name: IconName;
  className?: string;
}

const icons: Record<IconName, JSX.Element> = {
  player: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  ),
  bomb: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9.75v2.25m6-4.5h-3.75a1.5 1.5 0 01-1.5-1.5V3.75m-3.75 0V7.5m-6 4.5h3.75a1.5 1.5 0 011.5 1.5v3.75m3.75 0V16.5m-1.5-9l-3.75 3.75" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 100-18 9 9 0 000 18z" />
    </svg>
  ),
  enemy: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m-7.5-2.72a3 3 0 00-4.682 2.72 9.094 9.094 0 003.741.479m-4.5-4.5L9 12m0 0l2.25 2.25M9 12l2.25-2.25M9 12H3m12 0h6M12 9V3m0 18v-6" />
    </svg>
  ),
  item: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-6h6" />
    </svg>
  ),
  stage: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.5-10.5h-7a.5.5 0 00-.5.5v12.5a.5.5 0 00.5.5h7a.5.5 0 00.5-.5V6.5a.5.5 0 00-.5-.5z" />
    </svg>
  ),
  vip: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 21.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
    </svg>
  ),
};

const Icon: React.FC<IconProps> = ({ name, className = 'w-6 h-6' }) => {
  const Svg = icons[name];
  return <div className={className}>{Svg}</div>;
};

export default Icon;
