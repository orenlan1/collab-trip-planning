import { useState } from 'react';
import { IoSwapHorizontalOutline } from "react-icons/io5";
import { FaPlane } from "react-icons/fa";
import { FaCalendarAlt } from "react-icons/fa";
import { PassengerSelector } from './PassengerSelector';

interface SearchFormData {
  from: string;
  to: string;
  departDate: string;
  returnDate?: string;
  passengers: {
    adults: number;
    children: number;
  };
  tripType: 'oneWay' | 'roundTrip';
}

export function FlightSearchForm({ onSearch }: { onSearch: (data: SearchFormData) => void }) {
  const [searchData, setSearchData] = useState<SearchFormData>({
    from: '',
    to: '',
    departDate: '',
    returnDate: '',
    passengers: {
      adults: 1,
      children: 0
    },
    tripType: 'roundTrip'
  });

  const handleSwapLocations = () => {
    setSearchData(prev => ({
      ...prev,
      from: prev.to,
      to: prev.from
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchData);
  
  };

  return (
    <form onSubmit={handleSubmit} className="">
      <div className="flex gap-4 mb-4">
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="tripType"
            value="roundTrip"
            checked={searchData.tripType === 'roundTrip'}
            onChange={() => setSearchData(prev => ({ ...prev, tripType: 'roundTrip' }))}
            className="text-indigo-500"
          />
          <span>Round Trip</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="tripType"
            value="oneWay"
            checked={searchData.tripType === 'oneWay'}
            onChange={() => setSearchData(prev => ({ ...prev, tripType: 'oneWay' }))}
            className="text-indigo-500"
          />
          <span>One Way</span>
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="relative">
          <div className="flex items-center border rounded-lg p-3 bg-white">
            <FaPlane className="text-indigo-500 mr-2" />
            <input
              type="text"
              placeholder="From"
              value={searchData.from}
              onChange={(e) => setSearchData(prev => ({ ...prev, from: e.target.value }))}
              className="w-full outline-none"
              required
            />
          </div>
          <button
            type="button"
            onClick={handleSwapLocations}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 bg-indigo-500 text-white p-2 rounded-full z-10 hover:bg-indigo-600 transition-colors"
          >
            <IoSwapHorizontalOutline className="text-lg" />
          </button>
        </div>

        <div className="flex items-center border rounded-lg p-3 bg-white">
          <FaPlane className="text-indigo-500 mr-2" />
          <input
            type="text"
            placeholder="To"
            value={searchData.to}
            onChange={(e) => setSearchData(prev => ({ ...prev, to: e.target.value }))}
            className="w-full outline-none"
            required
          />
        </div>

        <div className="flex items-center border rounded-lg p-3 bg-white">
          <FaCalendarAlt className="text-indigo-500 mr-2" />
          <input
            type="date"
            value={searchData.departDate}
            onChange={(e) => setSearchData(prev => ({ ...prev, departDate: e.target.value }))}
            className="w-full outline-none"
            required
          />
        </div>

        {searchData.tripType === 'roundTrip' && (
          <div className="flex items-center border rounded-lg p-3 bg-white">
            <FaCalendarAlt className="text-indigo-500 mr-2" />
            <input
              type="date"
              value={searchData.returnDate}
              onChange={(e) => setSearchData(prev => ({ ...prev, returnDate: e.target.value }))}
              className="w-full outline-none"
              required={searchData.tripType === 'roundTrip'}
            />
          </div>
        )}

        <div>
          <PassengerSelector
            passengers={searchData.passengers}
            onChange={(passengers) => setSearchData(prev => ({ ...prev, passengers }))}
          />
        </div>
      </div>

      <div className="mt-6 flex justify-center">
        <button
          type="submit"
          className="bg-indigo-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-600 transition-colors"
        >
          Search Flights
        </button>
      </div>
    </form>
  );
}
