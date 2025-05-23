export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 selection:bg-primary/40 selection:text-white">
      {children}
    </div>
  );
}
