import './globals.css';
import Providers from '../components/Providers';

export const metadata = {
  title: 'Realtime Chat App',
  description: 'Premium modern realtime chat built with Next.js, Socket.IO and MongoDB.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
