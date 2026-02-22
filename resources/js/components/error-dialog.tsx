
import * as React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface ErrorDialogProps {
  open: boolean;
  message: string;
  onClose: () => void;
}

export function ErrorDialog({ open, message, onClose }: ErrorDialogProps) {
  // Determine title based on message content
  let title = 'Erreur';
  if (message.toLowerCase().includes('client')) {
    title = 'Suppression impossible';
  } else if (message.toLowerCase().includes('service')) {
    title = 'Services non terminés';
  } else if (message.toLowerCase().includes('chantier')) {
    title = 'Erreur Chantier';
  }
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto rounded-xl border bg-gradient-to-br from-red-50 to-white shadow-xl">
        <DialogHeader>
          <div className="flex flex-col items-center gap-2">
            <AlertTriangle className="h-10 w-10 text-red-500 animate-bounce" />
            <DialogTitle className="text-red-600 text-xl font-bold">{title}</DialogTitle>
          </div>
        </DialogHeader>
        <div className="py-4 px-2 text-center text-base text-gray-700 font-medium">
          <span className="block mb-2">{message}</span>
        </div>
        <DialogFooter>
          <Button onClick={onClose} autoFocus className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold shadow">
            OK, j'ai compris
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
