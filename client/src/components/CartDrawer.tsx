import { X, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@shared/shopifyTypes";

export default function CartDrawer() {
  const { cart, isOpen, isLoading, closeCart, updateQuantity, removeFromCart, goToCheckout } =
    useCart();

  const lines = cart?.lines?.nodes ?? [];
  const subtotal = cart?.cost?.subtotalAmount;
  const total = cart?.cost?.totalAmount;

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
          onClick={closeCart}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[420px] bg-white z-50 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" />
            <h2 className="text-lg font-semibold font-['Space_Grotesk']">
              Your Cart
              {cart && cart.totalQuantity > 0 && (
                <span className="ml-2 text-sm text-muted-foreground font-normal">
                  ({cart.totalQuantity} {cart.totalQuantity === 1 ? "item" : "items"})
                </span>
              )}
            </h2>
          </div>
          <button
            onClick={closeCart}
            className="p-2 rounded-full hover:bg-muted transition-colors"
            aria-label="Close cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-5">
          {lines.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
              <ShoppingBag className="w-16 h-16 text-muted-foreground/30" />
              <div>
                <p className="text-lg font-medium mb-1 font-['Space_Grotesk']">
                  Your cart is empty
                </p>
                <p className="text-sm text-muted-foreground">
                  Add some items to get started
                </p>
              </div>
              <Button
                onClick={closeCart}
                className="bg-[oklch(0.52_0.22_25)] hover:bg-[oklch(0.45_0.22_25)] text-white mt-2"
              >
                Continue Shopping
              </Button>
            </div>
          ) : (
            <ul className="space-y-4">
              {lines.map((line) => (
                <li key={line.id} className="flex gap-3 py-3 border-b border-border/50 last:border-0">
                  {/* Product Image */}
                  <div className="w-20 h-20 flex-shrink-0 rounded-md overflow-hidden bg-muted">
                    {line.merchandise.product.featuredImage ? (
                      <img
                        src={line.merchandise.product.featuredImage.url}
                        alt={line.merchandise.product.featuredImage.altText ?? line.merchandise.product.handle}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingBag className="w-8 h-8 text-muted-foreground/30" />
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm line-clamp-2 mb-0.5 font-['Space_Grotesk']">
                      {line.merchandise.product.title}
                    </p>
                    {line.merchandise.title !== "Default Title" && (
                      <p className="text-xs text-muted-foreground mb-2">{line.merchandise.title}</p>
                    )}
                    <p className="text-sm font-semibold text-[oklch(0.52_0.22_25)]">
                      {formatPrice(line.merchandise.price.amount, line.merchandise.price.currencyCode)}
                    </p>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateQuantity(line.id, line.quantity - 1)}
                        disabled={isLoading}
                        className="w-7 h-7 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-50"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-sm font-medium w-6 text-center">{line.quantity}</span>
                      <button
                        onClick={() => updateQuantity(line.id, line.quantity + 1)}
                        disabled={isLoading}
                        className="w-7 h-7 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-50"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => removeFromCart(line.id)}
                        disabled={isLoading}
                        className="ml-auto p-1.5 rounded-full hover:bg-red-50 hover:text-red-500 transition-colors disabled:opacity-50"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {lines.length > 0 && (
          <div className="p-5 border-t border-border bg-white">
            <div className="space-y-2 mb-4">
              {subtotal && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">
                    {formatPrice(subtotal.amount, subtotal.currencyCode)}
                  </span>
                </div>
              )}
              {total && (
                <div className="flex justify-between text-base font-semibold">
                  <span>Total</span>
                  <span className="text-[oklch(0.52_0.22_25)]">
                    {formatPrice(total.amount, total.currencyCode)}
                  </span>
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground mb-3 text-center">
              Shipping and taxes calculated at checkout
            </p>
            <Button
              onClick={goToCheckout}
              disabled={isLoading}
              className="w-full bg-[oklch(0.52_0.22_25)] hover:bg-[oklch(0.45_0.22_25)] text-white font-semibold py-3 text-base font-['Space_Grotesk']"
            >
              {isLoading ? "Updating..." : "Checkout on Shopify →"}
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
