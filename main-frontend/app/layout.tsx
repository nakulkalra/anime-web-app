import './globals.css'; // Global CSS
import Navbar from './Navbar/Navbar'; 
import { Toaster } from "@/components/ui/toaster"


export const metadata = {
  title: 'My App',
  description: 'A Next.js App',
};

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="en">
      <body>
        
        <Navbar />
        {children}
        <Toaster />
      </body>
    </html>
  );
};

export default RootLayout;
