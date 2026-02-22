import * as React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CalendarClock } from 'lucide-react';

interface DateWarningDialogProps {
  open: boolean;
  date: string;
  onClose: () => void;
  onChangeDate: () => void;
  onWait: () => void;
}

export function DateWarningDialog({ open, date, onClose, onChangeDate, onWait }: DateWarningDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto rounded-xl border bg-gradient-to-br from-red-50 to-white shadow-xl">
        <DialogHeader>
          <div className="flex flex-col items-center gap-2">
            <CalendarClock className="h-10 w-10 text-red-500 animate-bounce" />
            <DialogTitle className="text-red-600 text-xl font-bold">Modification requise</DialogTitle>
          </div>
        </DialogHeader>
        <div className="py-4 px-2 text-center text-base text-gray-700 font-medium">
          <span className="block mb-2">
            <b>Date de fin prévue :</b> {date}
          </span>
          <span className="block mb-2 text-red-700 font-semibold">
            La date de fin prévue n'est pas encore atteinte.<br />
            Veuillez modifier la date de fin prévue avant de terminer le chantier.
          </span>
        </div>
        <DialogFooter>
          <Button onClick={onChangeDate} autoFocus className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold shadow">
            OK, je vais modifier
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
