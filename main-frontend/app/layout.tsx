import './globals.css'; // Global CSS
import Navbar from './Navbar/Navbar';
import { Toaster } from "@/components/ui/toaster";
import { SessionProvider } from '@/context/SessionContext';

export const metadata = {
  title: 'My App',
  description: 'A Next.js App',
};

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="en">
      <body>
        <SessionProvider>
          <Navbar />
          {children}
          <Toaster />
        </SessionProvider>
      </body>
    </html>
  );
};

export default RootLayout;
