import React from 'react';

interface AppLayoutProps {
  children: React.ReactNode;
  currentScreen: 'menu' | 'game' | 'settings' | 'profiles' | 'achievements';
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children, currentScreen }) => {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#18473f_0%,#0d221f_34%,#060b10_100%)]">
      <main className={`${currentScreen === 'game' ? '' : 'py-4'} relative`}>
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(232,199,121,0.12),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(16,120,89,0.18),transparent_30%)]" />
        <div className="relative mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
};
