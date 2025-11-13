import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { Dayjs } from 'dayjs';
import { FlightForm } from './FlightForm';
import { type Airport } from '@/pages/flights/services/airports-api';

export interface FlightFormData {
  airline: string;
  flightNumber: string;
  from: string;
  to: string;
  departureDate: Date;
  departureTime: string;
  arrivalDate: Date;
  arrivalTime: string;
  departureTimezoneId?: string;
  arrivalTimezoneId?: string;
}

interface AddFlightDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFlightAdded: (flightData: FlightFormData) => Promise<void>;
}

export function AddFlightDialog({ open, onOpenChange, onFlightAdded }: AddFlightDialogProps) {
  const [airline, setAirline] = useState('');
  const [flightNumber, setFlightNumber] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [departureDate, setDepartureDate] = useState<Date | undefined>();
  const [departureTime, setDepartureTime] = useState<Dayjs | null>(null);
  const [arrivalDate, setArrivalDate] = useState<Date | undefined>();
  const [arrivalTime, setArrivalTime] = useState<Dayjs | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [departureTimezoneId, setDepartureTimezoneId] = useState<string>('UTC');
  const [arrivalTimezoneId, setArrivalTimezoneId] = useState<string>('UTC');

  const handleDialogClose = () => {
    onOpenChange(false);
    // Reset form
    setAirline('');
    setFlightNumber('');
    setFrom('');
    setTo('');
    setDepartureDate(undefined);
    setDepartureTime(null);
    setArrivalDate(undefined);
    setArrivalTime(null);
    setError('');
  };

  const formatTimeToISO = (time: Dayjs): string => {
    // Format time to HH:mm format for the formatToISO function
    return time.format('HH:mm');
  };

  const handleDepartureAirportSelect = (airport: Airport) => {
    if (airport.tzDatabase) {
      setDepartureTimezoneId(airport.tzDatabase);
    }
  };

  const handleArrivalAirportSelect = (airport: Airport) => {
    if (airport.tzDatabase) {
      setArrivalTimezoneId(airport.tzDatabase);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!airline || !flightNumber || !from || !to || !departureDate || !departureTime || !arrivalDate || !arrivalTime) {
      setError('All fields are required');
      return;
    }

    try {
      setIsSubmitting(true);

      const flightData: FlightFormData = {
        airline,
        flightNumber,
        from,
        to,
        departureDate,
        departureTime: formatTimeToISO(departureTime),
        arrivalDate,
        arrivalTime: formatTimeToISO(arrivalTime),
        departureTimezoneId,
        arrivalTimezoneId,
      };

      await onFlightAdded(flightData);
      handleDialogClose();
    } catch (error: any) {
      console.error('Failed to add flight:', error);
      setError(error.response?.data?.error || 'Failed to add flight. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Flight</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <FlightForm
            airline={airline}
            setAirline={setAirline}
            flightNumber={flightNumber}
            setFlightNumber={setFlightNumber}
            from={from}
            setFrom={setFrom}
            to={to}
            setTo={setTo}
            departureDate={departureDate}
            setDepartureDate={setDepartureDate}
            departureTime={departureTime}
            setDepartureTime={setDepartureTime}
            arrivalDate={arrivalDate}
            setArrivalDate={setArrivalDate}
            arrivalTime={arrivalTime}
            setArrivalTime={setArrivalTime}
            isSubmitting={isSubmitting}
            error={error}
            onDepartureAirportSelect={handleDepartureAirportSelect}
            onArrivalAirportSelect={handleArrivalAirportSelect}
          />

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleDialogClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Adding...' : 'Add Flight'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}