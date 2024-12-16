import './globals.css';
import { Bricolage_Grotesque } from 'next/font/google';
import type { Metadata } from 'next';

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
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang='en'>
            <body className={bricolage.className}>{children}</body>
        </html>
    );
}
