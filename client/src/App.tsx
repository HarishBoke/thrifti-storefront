import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { CartProvider } from "./contexts/CartContext";
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Collections from "./pages/Collections";
import CollectionDetail from "./pages/CollectionDetail";
import Sell from "./pages/Sell";
import Account from "./pages/Account";
import About from "./pages/About";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/products" component={Products} />
      <Route path="/products/:handle" component={ProductDetail} />
      <Route path="/collections" component={Collections} />
      <Route path="/collections/:handle" component={CollectionDetail} />
      <Route path="/sell" component={Sell} />
      <Route path="/account" component={Account} />
      <Route path="/about" component={About} />
      {/* Static info pages — redirect to About for now */}
      <Route path="/how-it-works" component={About} />
      <Route path="/faqs" component={About} />
      <Route path="/contact" component={About} />
      <Route path="/partner" component={About} />
      <Route path="/returns" component={About} />
      <Route path="/shipping" component={About} />
      <Route path="/terms" component={About} />
      <Route path="/privacy" component={About} />
      <Route path="/404" component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <CartProvider>
          <TooltipProvider>
            <Toaster richColors position="top-right" />
            <Router />
          </TooltipProvider>
        </CartProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
