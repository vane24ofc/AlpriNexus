import Image from 'next/image';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Added 'dark' class here to ensure auth pages always have a dark theme
  // This is because RootLayout no longer applies a global theme class.
  return (
    <div className="dark flex min-h-screen flex-col items-center justify-center bg-background p-4 selection:bg-primary/40 selection:text-white">
      {children}
      <Image
        src="/Logo-Manchas-SAS (2).png"
        alt="Alprigrama S.A.S"
        width={800} // Ancho original de la imagen
        height={742} // Alto original de la imagen
        className="fixed bottom-5 right-5 z-0 h-auto w-20 opacity-30 pointer-events-none"
        data-ai-hint="brand watermark logo"
      />
    </div>
  );
}
