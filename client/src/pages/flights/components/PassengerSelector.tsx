import { useState } from 'react';
import { FaUsers } from "react-icons/fa";

interface PassengerCount {
  adults: number;
  children: number;
}

interface PassengerSelectorProps {
  passengers: PassengerCount;
  onChange: (passengers: PassengerCount) => void;
}

export function PassengerSelector({ passengers, onChange }: PassengerSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleIncrement = (type: 'adults' | 'children') => {
    const maxPassengers = 9;
    const totalPassengers = passengers.adults + passengers.children;
    
    if (totalPassengers < maxPassengers) {
      onChange({
        ...passengers,
        [type]: passengers[type] + 1
      });
    }
  };

  const handleDecrement = (type: 'adults' | 'children') => {
    if (type === 'adults' && passengers.adults > 1) {
      onChange({
        ...passengers,
        adults: passengers.adults - 1
      });
    } else if (type === 'children' && passengers.children > 0) {
      onChange({
        ...passengers,
        children: passengers.children - 1
      });
    }
  };

  const totalPassengers = passengers.adults + passengers.children;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center border rounded-lg p-3 bg-white"
      >
        <FaUsers className="text-indigo-500 mr-2" />
        <span className="flex-1 text-left">
          {totalPassengers} Passenger{totalPassengers !== 1 ? 's' : ''}
        </span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          ></div>
          <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-lg z-20 border border-gray-100">
            <div className="p-4">
              {/* Adults */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="font-semibold">Adults</p>
                  <p className="text-sm text-gray-500">Age 13+</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleDecrement('adults')}
                    disabled={passengers.adults <= 1}
                    className={`w-8 h-8 rounded-full flex items-center justify-center border ${
                      passengers.adults <= 1
                        ? 'border-gray-200 text-gray-300'
                        : 'border-indigo-500 text-indigo-500 hover:bg-indigo-50'
                    }`}
                  >
                    -
                  </button>
                  <span className="w-8 text-center">{passengers.adults}</span>
                  <button
                    type="button"
                    onClick={() => handleIncrement('adults')}
                    disabled={totalPassengers >= 9}
                    className={`w-8 h-8 rounded-full flex items-center justify-center border ${
                      totalPassengers >= 9
                        ? 'border-gray-200 text-gray-300'
                        : 'border-indigo-500 text-indigo-500 hover:bg-indigo-50'
                    }`}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Children */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">Children</p>
                  <p className="text-sm text-gray-500">Age 2-12</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleDecrement('children')}
                    disabled={passengers.children <= 0}
                    className={`w-8 h-8 rounded-full flex items-center justify-center border ${
                      passengers.children <= 0
                        ? 'border-gray-200 text-gray-300'
                        : 'border-indigo-500 text-indigo-500 hover:bg-indigo-50'
                    }`}
                  >
                    -
                  </button>
                  <span className="w-8 text-center">{passengers.children}</span>
                  <button
                    type="button"
                    onClick={() => handleIncrement('children')}
                    disabled={totalPassengers >= 9}
                    className={`w-8 h-8 rounded-full flex items-center justify-center border ${
                      totalPassengers >= 9
                        ? 'border-gray-200 text-gray-300'
                        : 'border-indigo-500 text-indigo-500 hover:bg-indigo-50'
                    }`}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
