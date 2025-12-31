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
      <div className="bg-primary-gray border border-primary-lightgray rounded-lg p-6 max-w-md w-full shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Confirm Entry</h2>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-white transition-colors disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Raffle Title */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-white mb-2">{raffleTitle}</h3>
        </div>

        {/* User Ticket Holdings */}
        <div className="bg-primary-darker rounded-lg p-4 mb-4">
          <div className="text-sm text-gray-400 mb-1">Your Current Tickets</div>
          <div className="text-2xl font-bold text-primary-green">
            {userCurrentTickets} / {maxUserTickets} (20% limit)
          </div>
          <div className="text-xs text-gray-500 mt-1">
            You can purchase up to {maxAllowedQuantity} more tickets
          </div>
        </div>

        {/* Ticket Quantity Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Number of Tickets
          </label>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1 || isLoading}
              className="w-12 h-12 bg-primary-darker border border-primary-lightgray rounded-lg text-white hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-bold text-xl"
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
              className="flex-1 px-4 py-3 bg-primary-darker border border-primary-lightgray rounded-lg text-white text-center text-xl font-bold focus:outline-none focus:ring-2 focus:ring-primary-green focus:border-transparent disabled:opacity-50"
            />
            <button
              onClick={() => setQuantity(Math.min(maxAllowedQuantity, quantity + 1))}
              disabled={quantity >= maxAllowedQuantity || isLoading}
              className="w-12 h-12 bg-primary-darker border border-primary-lightgray rounded-lg text-white hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-bold text-xl"
            >
              +
            </button>
          </div>
          <div className="text-xs text-gray-400 mt-2 text-center">
            Max: {maxAllowedQuantity} tickets
          </div>
        </div>

        {/* Price Summary */}
        <div className="bg-primary-darker rounded-lg p-4 mb-6 space-y-2">
          <div className="flex justify-between text-gray-300">
            <span>Unit Price:</span>
            <span className="font-semibold">{prizePoolSymbol} {ticketPrice}</span>
          </div>
          <div className="flex justify-between text-gray-300">
            <span>Quantity:</span>
            <span className="font-semibold">{quantity} ticket{quantity !== 1 ? 's' : ''}</span>
          </div>
          <div className="border-t border-primary-lightgray pt-2 mt-2">
            <div className="flex justify-between text-white">
              <span className="font-semibold">Total Price:</span>
              <span className="text-xl font-bold text-primary-green">
                {prizePoolSymbol} {totalPrice.toFixed(6)}
              </span>
            </div>
          </div>
        </div>

        {/* Prize Pool Info */}
        <div className="text-center text-gray-400 text-sm mb-6">
          Prize Pool: <span className="text-primary-green font-semibold">{prizePoolSymbol} {prizePoolAmount.toLocaleString()}</span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 py-3 bg-primary-darker border border-primary-lightgray rounded-lg text-white font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading || quantity < 1 || quantity > maxAllowedQuantity}
            className="flex-1 py-3 bg-primary-green text-primary-darker rounded-lg font-bold hover:bg-primary-green/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Processing...' : 'Confirm Entry'}
          </button>
        </div>
      </div>
    </div>
  );
}

