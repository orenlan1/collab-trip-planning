interface Flight {
  id: string;
  from: string;
  to: string;
  departDate: string;
  returnDate: string;
  price: number;
  airline: string;
  duration: string;
  departureTime: string;
  arrivalTime: string;
  returnFlight: {
    duration: string;
    departureTime: string;
    arrivalTime: string;
  };
}

export const mockFlights: Flight[] = [
  {
    id: '1',
    from: 'New York (JFK)',
    to: 'London (LHR)',
    departDate: '2025-09-01',
    returnDate: '2025-09-08',
    price: 850,
    airline: 'British Airways',
    duration: '7h 20m',
    departureTime: '10:30',
    arrivalTime: '22:50',
    returnFlight: {
      duration: '7h 45m',
      departureTime: '09:15',
      arrivalTime: '12:00'
    }
  },
  {
    id: '2',
    from: 'New York (JFK)',
    to: 'London (LHR)',
    departDate: '2025-09-01',
    returnDate: '2025-09-08',
    price: 750,
    airline: 'American Airlines',
    duration: '7h 45m',
    departureTime: '14:15',
    arrivalTime: '03:00',
    returnFlight: {
      duration: '7h 30m',
      departureTime: '11:30',
      arrivalTime: '14:00'
    }
  },
  {
    id: '3',
    from: 'New York (JFK)',
    to: 'London (LHR)',
    departDate: '2025-09-01',
    returnDate: '2025-09-08',
    price: 920,
    airline: 'Virgin Atlantic',
    duration: '7h 15m',
    departureTime: '19:45',
    arrivalTime: '08:00',
    returnFlight: {
      duration: '7h 20m',
      departureTime: '14:45',
      arrivalTime: '17:05'
    }
  }
];

export type { Flight };
