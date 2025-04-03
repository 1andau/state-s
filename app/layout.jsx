import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "./components/header/header";
import { SocketProvider } from "./providers/SocketProvider";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Header />
        <div className="content">
        <SocketProvider>{children}</SocketProvider>
        </div>
      </body>
    </html>
  );
}
