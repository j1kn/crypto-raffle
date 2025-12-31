'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

interface EntryConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (quantity: number) => void;
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

  useEffect(() => {
    setQuantity(initialQuantity);
  }, [initialQuantity, isOpen]);

  if (!isOpen) return null;

  const totalPrice = ticketPrice * quantity;
  const maxAllowedQuantity = Math.min(
    100, // Maximum per transaction
    maxUserTickets - userCurrentTickets, // Remaining allowed for user
    maxTickets // Maximum for raffle
  );

  const handleConfirm = () => {
    if (quantity >= 1 && quantity <= maxAllowedQuantity) {
      onConfirm(quantity);
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

