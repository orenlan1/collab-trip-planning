import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { PiForkKnifeFill } from "react-icons/pi";
import { FaCamera } from "react-icons/fa6";

export type ActivityType = 'DINING' | 'ACTIVITIES';

interface AddActivityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onActivityTypeSelected: (type: ActivityType) => void;
}

export function ChooseActivityTypeDialog({ open, onOpenChange, onActivityTypeSelected }: AddActivityDialogProps) {
 
  const handleActivityTypeClick = (type: ActivityType) => {
    onActivityTypeSelected(type);
    onOpenChange(false);
  };

    return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
            <DialogTitle>Choose Activity Type</DialogTitle>
        </DialogHeader>
            <div className='grid grid-cols-2 gap-4 p-4'>
                <button
                  onClick={() => handleActivityTypeClick('DINING')}
                  className='flex flex-col items-center p-4 rounded-lg cursor-pointer group'
                  type="button"
                >
                    <div className='mb-2 bg-gray-300 p-2 rounded-xl transition-all duration-300 group-hover:bg-orange-500 group-hover:scale-110'>
                        <PiForkKnifeFill className='w-5 h-5 text-slate-500 transition-all duration-300 group-hover:text-white group-hover:scale-110' />
                    </div>
                    <div className="text-sm">Dining</div>
                </button>
                <button
                  onClick={() => handleActivityTypeClick('ACTIVITIES')}
                  className='flex flex-col items-center p-4 rounded-lg cursor-pointer group'
                  type="button"
                >
                    <div className='mb-2 bg-gray-300 p-2 rounded-xl transition-all duration-300 group-hover:bg-green-500 group-hover:scale-110'>
                        <FaCamera className='w-5 h-5 text-slate-500 transition-all duration-300 group-hover:text-white group-hover:scale-110' />
                    </div>
                    <div className="text-sm">Activities & Tours</div>
                </button>
            </div>
        <DialogFooter>
          {/* Submit and Cancel buttons would go here */}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}