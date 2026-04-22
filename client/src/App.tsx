import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { CartProvider } from "./contexts/CartContext";
import { ShopifyAuthProvider } from "./contexts/ShopifyAuthContext";
import ScrollToTop from "./components/ScrollToTop";
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Collections from "./pages/Collections";
import CollectionDetail from "./pages/CollectionDetail";
import Sell from "./pages/Sell";
import Account from "./pages/Account";
import Login from "./pages/Login";
import About from "./pages/About";
import HowItWorks from "./pages/HowItWorks";
import FAQ from "./pages/FAQ";
import Contact from "./pages/Contact";
import Partner from "./pages/Partner";
import Returns from "./pages/Returns";
import Shipping from "./pages/Shipping";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Cart from "./pages/Cart";
import Wishlist from "./pages/Wishlist";

function Router() {
  return (
    <>
      <ScrollToTop />
      <Switch>
        {/* Core pages */}
        <Route path="/" component={Home} />
        <Route path="/products" component={Products} />
        <Route path="/products/:handle" component={ProductDetail} />
        <Route path="/collections" component={Collections} />
        <Route path="/collections/:handle" component={CollectionDetail} />
        <Route path="/sell" component={Sell} />
        <Route path="/account" component={Account} />
        <Route path="/login" component={Login} />

        {/* About column */}
        <Route path="/about" component={About} />
        <Route path="/how-it-works" component={HowItWorks} />

        {/* Community column */}
        <Route path="/faqs" component={FAQ} />
        <Route path="/contact" component={Contact} />
        <Route path="/partner" component={Partner} />

        {/* Help column */}
        <Route path="/returns" component={Returns} />
        <Route path="/shipping" component={Shipping} />
        <Route path="/terms" component={Terms} />
        <Route path="/privacy" component={Privacy} />

        {/* Cart page */}
        <Route path="/cart" component={Cart} />
        <Route path="/wishlist" component={Wishlist} />

        {/* Fallback */}
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <ShopifyAuthProvider>
          <CartProvider>
            <TooltipProvider>
              <Toaster richColors position="top-right" />
              <Router />
            </TooltipProvider>
          </CartProvider>
        </ShopifyAuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
