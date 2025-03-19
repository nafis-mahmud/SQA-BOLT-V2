import { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="border-b bg-white py-4">
        <div className="container mx-auto flex items-center justify-between px-4">
          <h1 className="text-xl font-bold text-slate-900">Supply Chain Hub</h1>
        </div>
      </header>
      <main className="flex flex-1 items-center justify-center p-4">
        {children}
      </main>
      <footer className="border-t bg-white py-4 text-center text-sm text-slate-500">
        <div className="container mx-auto px-4">
          &copy; {new Date().getFullYear()} Supply Chain Hub. All rights
          reserved.
        </div>
      </footer>
    </div>
  );
}
