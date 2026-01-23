'use client';

import { useEffect, useState } from 'react';
import { X, ChevronDown } from 'lucide-react';
import { PAYMENT_METHODS, PaymentMethod, getDefaultPaymentMethod } from '@/lib/paymentMethods';

interface EntryConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (quantity: number, paymentMethod: PaymentMethod) => void;
  raffleTitle: string;
  ticketPrice: number;
  prizePoolSymbol: string;
  prizePoolAmount: number;
  maxTickets: number;
  userCurrentTickets: number;
  maxUserTickets: number;
  initialQuantity?: number;
  isLoading?: boolean;
}

export default function EntryConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  raffleTitle,
  ticketPrice,
  prizePoolSymbol,
  prizePoolAmount,
  maxTickets,
  userCurrentTickets,
  maxUserTickets,
  initialQuantity = 1,
  isLoading = false,
}: EntryConfirmationModalProps) {
  const [quantity, setQuantity] = useState(initialQuantity);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>(getDefaultPaymentMethod());
  const [showPaymentDropdown, setShowPaymentDropdown] = useState(false);

  useEffect(() => {
    setQuantity(initialQuantity);
    // Set payment method based on raffle's prize pool symbol
    const matchingMethod = PAYMENT_METHODS.find(
      method => method.symbol.toUpperCase() === prizePoolSymbol.toUpperCase()
    );
    setSelectedPaymentMethod(matchingMethod || getDefaultPaymentMethod());
  }, [initialQuantity, isOpen, prizePoolSymbol]);

  if (!isOpen) return null;

  const totalPrice = ticketPrice * quantity;
  const maxAllowedQuantity = Math.min(
    100, // Maximum per transaction
    maxUserTickets - userCurrentTickets, // Remaining allowed for user
    maxTickets // Maximum for raffle
  );

  const handleConfirm = () => {
    if (quantity >= 1 && quantity <= maxAllowedQuantity) {
      onConfirm(quantity, selectedPaymentMethod);
    }
  };

  const handleQuantityChange = (value: string) => {
    const numValue = parseInt(value, 10);
    if (isNaN(numValue)) {
      setQuantity(1);
    } else if (numValue < 1) {
      setQuantity(1);
    } else if (numValue > maxAllowedQuantity) {
      setQuantity(maxAllowedQuantity);
    } else {
      setQuantity(numValue);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-primary-gray border border-primary-lightgray rounded-lg p-6 max-w-sm w-full shadow-2xl">
        {/* Header with Close Button */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Enter Raffle</h2>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-white transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Ticket Price */}
        <div className="mb-4">
          <label className="block text-sm text-gray-400 mb-1">Ticket Price</label>
          <div className="text-2xl font-bold text-primary-green">
            {prizePoolSymbol} {ticketPrice}
          </div>
        </div>

        {/* Payment Method Selection */}
        <div className="mb-4">
          <label className="block text-sm text-gray-400 mb-2">Pay With</label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowPaymentDropdown(!showPaymentDropdown)}
              disabled={isLoading}
              className="w-full px-4 py-3 bg-primary-darker border border-primary-lightgray rounded-lg text-white text-left flex items-center justify-between hover:bg-primary-dark transition-colors disabled:opacity-50"
            >
              <div className="flex items-center gap-2">
                <span className="font-semibold">{selectedPaymentMethod.symbol}</span>
                <span className="text-gray-400 text-sm">({selectedPaymentMethod.name})</span>
              </div>
              <ChevronDown className={`w-4 h-4 transition-transform ${showPaymentDropdown ? 'rotate-180' : ''}`} />
            </button>
            
            {showPaymentDropdown && (
              <div className="absolute z-10 w-full mt-2 bg-primary-darker border border-primary-lightgray rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {PAYMENT_METHODS.map((method) => (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => {
                      setSelectedPaymentMethod(method);
                      setShowPaymentDropdown(false);
                    }}
                    className={`w-full px-4 py-3 text-left hover:bg-primary-gray transition-colors ${
                      selectedPaymentMethod.id === method.id
                        ? 'bg-primary-green/20 border-l-2 border-primary-green'
                        : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-white">{method.symbol}</div>
                        <div className="text-xs text-gray-400">{method.name}</div>
                      </div>
                      {selectedPaymentMethod.id === method.id && (
                        <div className="w-2 h-2 bg-primary-green rounded-full"></div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quantity */}
        <div className="mb-6">
          <label className="block text-sm text-gray-400 mb-2">Quantity</label>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1 || isLoading}
              className="w-10 h-10 bg-primary-darker border border-primary-lightgray rounded-lg text-white hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-bold"
            >
              -
            </button>
            <input
              type="number"
              value={quantity}
              onChange={(e) => handleQuantityChange(e.target.value)}
              onBlur={(e) => {
                const value = parseInt(e.target.value, 10);
                if (isNaN(value) || value < 1) {
                  setQuantity(1);
                } else if (value > maxAllowedQuantity) {
                  setQuantity(maxAllowedQuantity);
                }
              }}
              min={1}
              max={maxAllowedQuantity}
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-primary-darker border border-primary-lightgray rounded-lg text-white text-center font-semibold focus:outline-none focus:ring-2 focus:ring-primary-green focus:border-transparent disabled:opacity-50"
            />
            <button
              onClick={() => setQuantity(Math.min(maxAllowedQuantity, quantity + 1))}
              disabled={quantity >= maxAllowedQuantity || isLoading}
              className="w-10 h-10 bg-primary-darker border border-primary-lightgray rounded-lg text-white hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-bold"
            >
              +
            </button>
          </div>
        </div>

        {/* Total Price Display */}
        <div className="mb-6 p-3 bg-primary-darker rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Total:</span>
            <span className="text-xl font-bold text-primary-green">
              {selectedPaymentMethod.symbol} {totalPrice.toFixed(selectedPaymentMethod.decimals === 6 ? 6 : 2)}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <button
            onClick={handleConfirm}
            disabled={isLoading || quantity < 1 || quantity > maxAllowedQuantity}
            className="w-full py-3 bg-primary-green text-primary-darker rounded-lg font-bold hover:bg-primary-green/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Processing...' : 'Confirm Entry'}
          </button>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="w-full py-2 bg-primary-darker border border-primary-lightgray rounded-lg text-white font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

