import './globals.css'; // Global CSS
import Navbar from './Navbar/Navbar'; // Adjust the path to your Navbar component

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
      </body>
    </html>
  );
};

export default RootLayout;
