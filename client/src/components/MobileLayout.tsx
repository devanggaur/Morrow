import { ReactNode } from "react";

interface MobileLayoutProps {
  children: ReactNode;
}

export default function MobileLayout({ children }: MobileLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-full max-w-[390px] h-[844px] bg-background shadow-2xl overflow-hidden relative">
        {children}
      </div>
    </div>
  );
}
