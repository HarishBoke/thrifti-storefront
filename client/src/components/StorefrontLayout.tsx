import { ReactNode } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import AnimatedBanner from "./AnimatedBanner";
import CartDrawer from "./CartDrawer";

interface StorefrontLayoutProps {
  children: ReactNode;
  showBanner?: boolean;
}

export default function StorefrontLayout({ children, showBanner = true }: StorefrontLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      {showBanner && <AnimatedBanner />}
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <CartDrawer />
    </div>
  );
}
