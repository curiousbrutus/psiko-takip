import { Logo } from '@/components/logo';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-background via-teal-50 to-background p-4">
      <div className="absolute top-4 left-4">
        <Logo />
      </div>
      {children}
    </div>
  );
}
