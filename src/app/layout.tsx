import './globals.css';
import { Bricolage_Grotesque } from 'next/font/google';
import type { Metadata } from 'next';
import { Providers } from '@/components/providers/Providers';
import { Toaster } from '@/components/ui/toaster';

const bricolage = Bricolage_Grotesque({
    subsets: ['latin'],
    display: 'swap',
});

export const metadata: Metadata = {
    title: 'Pawmodoro',
    description: 'Crush your tasks with Pawmodoro.',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang='en'>
            <body className={bricolage.className}>
                <Providers>{children}</Providers>
                <Toaster />
            </body>
        </html>
    );
}
