import { ReactNode } from 'react';
interface ScrollableProps {
  children: ReactNode;
  divClassName?: string;
  className?: string;
  isAnimated?: boolean;
}

export default function Scrollable({
  children,
  className = '',
  divClassName = '',
  isAnimated = false,
}: ScrollableProps) {
  const layoutClass = !isAnimated ? 'max-w-4xl' : '';
  return (
    <div className={`mt-0 mb-4 py-16 h-[90vh] flex justify-center items-center ${divClassName}`}>
      <div
        className={`${layoutClass} h-[75vh] w-full overflow-y-auto
          flex flex-col items-center 
          gap-12 py-2
          scrollbar-none [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${className}`}
      >
        {children}
      </div>
    </div>
  );
}
