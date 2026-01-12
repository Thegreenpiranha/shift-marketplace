import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Copy, Check } from 'lucide-react';
import type { Payment } from '@/hooks/useAlbyPayments';
import { useDMContext } from '@/hooks/useDMContext';
import { MESSAGE_PROTOCOL } from '@/lib/dmConstants';
import { useCurrentUser } from '@/hooks/useCurrentUser';

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  payment: Payment;
  itemTitle: string;
}

export function PaymentModal({ open, onClose, payment, itemTitle }: PaymentModalProps) {
  const [copied, setCopied] = useState(false);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const { user } = useCurrentUser();
  const { sendMessage } = useDMContext();

  if (!open) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(payment.invoice);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirmPayment = async () => {
    setPaymentConfirmed(true);
    
    // Update payment status in localStorage
    const payments = JSON.parse(localStorage.getItem("shift:payments") || "[]");
    const paymentIndex = payments.findIndex((p: Payment) => p.id === payment.id);
    if (paymentIndex !== -1) {
      payments[paymentIndex].status = "paid";
      payments[paymentIndex].paidAt = Date.now();
      localStorage.setItem("shift:payments", JSON.stringify(payments));
    }

    // Send DM to seller
    if (user) {
      await sendMessage({
        recipientPubkey: payment.sellerPubkey,
        protocol: MESSAGE_PROTOCOL.NIP17,
        content: `I have paid the Lightning invoice for listing ${payment.listingId}. Transaction total: ${payment.totalAmount} sats. Please verify and ship when ready!`
      });
    }

    setTimeout(() => onClose(), 2000);
  };

  const gbpAmount = '£' + (payment.totalAmount / 100000).toFixed(2);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-white dark:bg-gray-900 rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-xl font-bold">⚡ Pay with Lightning</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{itemTitle}</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Amount */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6 text-center">
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {payment.totalAmount.toLocaleString()} sats
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            ≈ {gbpAmount}
          </div>
          <div className="text-xs text-gray-500 mt-2 space-y-1">
            <div>Item: {payment.itemPrice.toLocaleString()} sats</div>
            <div>Fee (2%): {payment.platformFee.toLocaleString()} sats</div>
          </div>
        </div>

        {/* QR Code */}
        <div className="flex justify-center mb-6">
          <div className="bg-white p-4 rounded-lg shadow-md">
            <QRCodeSVG value={payment.invoice} size={250} />
          </div>
        </div>

        {/* Invoice */}
        <div className="mb-6">
          <label className="text-sm font-medium mb-2 block">Lightning Invoice</label>
          <div className="flex gap-2">
            <textarea
              readOnly
              value={payment.invoice}
              className="flex-1 bg-gray-100 dark:bg-gray-800 rounded p-3 text-xs font-mono resize-none"
              rows={3}
            />
            <button
              onClick={handleCopy}
              className="px-4 bg-blue-600 hover:bg-blue-700 text-white rounded flex items-center gap-2"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-gray-100 dark:bg-gray-800 rounded p-4 text-sm">
          <p className="font-medium mb-2">How to pay:</p>
          <ol className="list-decimal list-inside space-y-1 text-gray-700 dark:text-gray-300">
            <li>Open your Lightning wallet (Phoenix, Alby, etc.)</li>
            <li>Scan the QR code or paste the invoice</li>
            <li>Confirm the payment</li>
          </ol>
        </div>

        {/* Close Button */}
        {!paymentConfirmed ? (
          <button
            onClick={handleConfirmPayment}
            className="w-full mb-3 bg-green-600 hover:bg-green-700 text-white py-3 rounded font-medium"
          >
            ✓ I've Paid
          </button>
        ) : (
          <div className="mb-3 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 py-3 rounded text-center font-medium">
            ✓ Payment confirmed! Seller notified.
          </div>
        )}
        <button
          onClick={onClose}
          className="w-full mt-6 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 py-3 rounded font-medium"
        >
          Close
        </button>
      </div>
    </div>
  );
}