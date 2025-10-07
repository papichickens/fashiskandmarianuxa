// src/app/layout.tsx
'use client';

import type { Metadata } from 'next'; // Metadata is typically server-only, but we can manage it.
// For client components, you might need to move Metadata to a `head.tsx` or use a wrapper.
// For now, we'll keep it simple for demonstration. In a real app, you might use a <title> tag directly.
import { Inter } from 'next/font/google';
import './globals.css';
import { colors } from '../../styles/color';
import { AuthProvider, useAuth } from './context/AuthContext'; // Import AuthProvider and useAuth
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, ReactNode } from 'react';

const inter = Inter({ subsets: ['latin'] });

// We define Metadata separately as a constant because client components cannot export metadata directly
// In a real app, you might manage this using a dedicated head.tsx or a more advanced approach.
const appMetadata: Metadata = {
  title: 'Antes Do Casamento',
  description: 'Olá dos vossos futuros pais Zé Raúl e Maria Artur',
};


// Inner component to handle auth logic and render children
function AuthWrapper({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // If not loading, no user, and not on the sign-in page, redirect to sign-in
    if (!loading && !user && pathname !== '/signin') {
      router.push('/signin');
    }
    // If loading or user exists, but on the sign-in page, redirect to home
    if ((loading || user) && pathname === '/signin') {
      router.push('/');
    }
  }, [user, loading, pathname, router]);

  // If loading, show a global loading indicator
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: colors.background, color: colors.subheadingText }}>
        Loading application...
      </div>
    );
  }

  // If user is not logged in AND not on the sign-in page, we are actively redirecting, so show nothing or a redirect message.
  if (!user && pathname !== '/signin') {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: colors.background, color: colors.subheadingText }}>
        Redirecting to sign-in...
      </div>
    );
  }

  // Otherwise, render the children (the actual page content)
  return <>{children}</>;
}


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Manually include title/description if `metadata` export is removed due to 'use client' */}
        <title>{appMetadata.title as string}</title>
        <meta name="description" content={appMetadata.description as string} />
        {/* PWA: Manifest & Icons */}
        <link rel="manifest" href="manifest.json" />
        {/* iOS home screen icon */}
        <link rel="apple-touch-icon" href="/icons/icon-96x96.png" />
        {/* Fallback favicon (browsers/tab icon) */}
        <link rel="icon" href="/favicon.ico" />

        {/* iOS PWA settings */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Antes Do Casamento" />

        {/* Theme color for Android status bar / PWA */}
        <meta name="theme-color" content="#ffffff" />
      </head>
      <body className={inter.className} style={{ backgroundColor: colors.background }} suppressHydrationWarning>
        <AuthProvider>
          <AuthWrapper> {/* Wrap children with AuthWrapper */}
            <main className="min-h-screen">
              {children}
            </main>
            <footer
              style={{
                padding: '1rem',
                borderTop: `1px solid ${colors.borderGray}`,
                textAlign: 'center',
                fontSize: '0.8rem',
                color: colors.subheadingText,
                backgroundColor: colors.cardBackground
              }}
            >
              <p>&copy; {new Date().getFullYear()} My Couple App | Version 1.0</p>
            </footer>
          </AuthWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}