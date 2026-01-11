// Force rebuild
import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Check, Copy, X, Zap, AlertCircle, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/useToast';
import { usePaymentStatus, useWebLNPayment } from '@/hooks/useAlbyPayments';
import { formatSats, formatPrice } from '@/types/marketplace';
import type { Payment } from '@/hooks/useAlbyPayments';

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  payment: Payment;
  itemTitle: string;
  btcPriceGBP?: number;
}

export function PaymentModal({
  open,
  onClose,
  payment,
  itemTitle,
  btcPriceGBP = 50000,
}: PaymentModalProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const { isWebLNAvailable, checkWebLN, payWithWebLN } = useWebLNPayment();
  const [isPayingWithWebLN, setIsPayingWithWebLN] = useState(false);

  const { data: paymentStatus, isLoading } = usePaymentStatus(payment.paymentHash);

  useEffect(() => {
    if (open) {
      checkWebLN();
    }
  }, [open]);

  useEffect(() => {
    // Close modal when payment is confirmed
    if (paymentStatus?.status === 'paid') {
      toast({
        title: 'Payment Received! ⚡',
        description: 'Your payment has been confirmed. The seller will be notified.',
      });
      setTimeout(() => {
        onClose();
      }, 2000);
    }
  }, [paymentStatus?.status, onClose, toast]);

  const handleCopyInvoice = () => {
    navigator.clipboard.writeText(payment.invoice);
    setCopied(true);
    toast({
      title: 'Copied!',
      description: 'Lightning invoice copied to clipboard',
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWebLNPayment = async () => {
    setIsPayingWithWebLN(true);
    try {
      await payWithWebLN(payment.invoice);
      toast({
        title: 'Payment Sent! ⚡',
        description: 'Waiting for confirmation...',
      });
    } catch (error) {
      toast({
        title: 'Payment Failed',
        description: error instanceof Error ? error.message : 'Failed to send payment',
        variant: 'destructive',
      });
    } finally {
      setIsPayingWithWebLN(false);
    }
  };

  const gbpAmount = (payment.totalAmount / 100_000_000) * btcPriceGBP;
  const gbpItemPrice = (payment.itemPrice / 100_000_000) * btcPriceGBP;
  const gbpFee = (payment.platformFee / 100_000_000) * btcPriceGBP;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            Pay with Lightning
          </DialogTitle>
          <DialogDescription>
            Scan QR code or copy invoice to pay with your Lightning wallet
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Amount Summary */}
          <div className="bg-accent/30 rounded-lg p-4 space-y-3">
            <div>
              <div className="text-sm text-muted-foreground mb-1">{itemTitle}</div>
              <div className="text-2xl font-bold">{formatSats(payment.totalAmount)}</div>
              <div className="text-sm text-muted-foreground">
                ≈ {formatPrice(gbpAmount, 'GBP')}
              </div>
            </div>

            <div className="border-t pt-3 space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Item price:</span>
                <span>
                  {formatSats(payment.itemPrice)} (≈ {formatPrice(gbpItemPrice, 'GBP')})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Platform fee (2%):</span>
                <span>
                  {formatSats(payment.platformFee)} (≈ {formatPrice(gbpFee, 'GBP')})
                </span>
              </div>
            </div>
          </div>

          {/* Payment Status */}
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Checking payment status...</span>
            </div>
          ) : paymentStatus?.status === 'paid' ? (
            <Alert className="bg-green-500/10 border-green-500/20">
              <Check className="h-4 w-4 text-green-500" />
              <AlertDescription className="text-green-700 dark:text-green-400">
                Payment confirmed! ⚡
              </AlertDescription>
            </Alert>
          ) : paymentStatus?.status === 'failed' ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>Payment failed. Please try again.</AlertDescription>
            </Alert>
          ) : (
            <>
              {/* WebLN Payment Button */}
              {isWebLNAvailable && (
                <div>
                  <Button
                    onClick={handleWebLNPayment}
                    disabled={isPayingWithWebLN}
                    className="w-full"
                    size="lg"
                  >
                    {isPayingWithWebLN ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Zap className="mr-2 h-5 w-5" />
                        Pay with WebLN
                      </>
                    )}
                  </Button>
                  <div className="text-center my-4">
                    <span className="text-sm text-muted-foreground">or scan QR code</span>
                  </div>
                </div>
              )}

              {/* QR Code */}
              <div className="flex justify-center">
                <div className="bg-white p-4 rounded-lg">
                  <QRCodeSVG value={payment.invoice} size={200} level="M" />
                </div>
              </div>

              {/* Invoice String */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Lightning Invoice</label>
                <div className="flex gap-2">
                  <div className="flex-1 bg-muted rounded-lg px-3 py-2 text-xs font-mono overflow-hidden">
                    <div className="truncate">{payment.invoice}</div>
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleCopyInvoice}
                    className="flex-shrink-0"
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Instructions */}
              <Alert>
                <Zap className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  <strong>To pay:</strong>
                  <ol className="list-decimal list-inside mt-2 space-y-1">
                    <li>Open your Lightning wallet (Alby, Phoenix, Muun, etc.)</li>
                    <li>Scan the QR code or paste the invoice</li>
                    <li>Confirm the payment</li>
                  </ol>
                </AlertDescription>
              </Alert>

              {/* Pending indicator */}
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Waiting for payment...</span>
              </div>
            </>
          )}

          {/* Close Button */}
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
