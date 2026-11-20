import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'Agassi — Le monde est ton terrain de jeu', description: 'Des animaux aux étoiles : des leçons, des activités et des quiz pour les petits curieux de 6 à 10 ans.' };
export default function RootLayout({children}: Readonly<{children: React.ReactNode}>) { return <html lang="fr"><body>{children}</body></html>; }
