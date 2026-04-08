import { useState } from 'react';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { LogIn, LogOut, User } from 'lucide-react';

export default function TechnicienMain() {
  const [status, setStatus] = useState<'in' | 'out' | null>(null);
  const [message, setMessage] = useState('');
  const [now, setNow] = useState(() => new Date());

  // Update clock every second
  useState(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  });

  const handleEntry = (type: 'in' | 'out') => {
    setStatus(type);
    setMessage(type === 'in' ? '🟢 تم تسجيل الدخول بنجاح' : '🔴 تم تسجيل الخروج');
    // TODO: Add GPS/selfie logic here
  };

  return (
    <AppLayout breadcrumbs={[]}> {/* No breadcrumbs for main */}
      <Head title="واجهة التقني" />
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        {/* صورة التقني */}
        <div className="flex flex-col items-center mb-6">
          <User className="h-20 w-20 rounded-full bg-blue-200 text-blue-600 mb-2" />
          <div className="font-bold text-lg">[اسم التقني]</div>
        </div>
        {/* الساعة */}
        <div className="text-5xl font-mono mb-8">{now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</div>
        {/* أزرار كبار */}
        <div className="flex gap-8 mb-8">
          <Button size="xl" className="bg-green-600 hover:bg-green-700 text-white text-2xl px-10 py-6 rounded-xl flex flex-col items-center" onClick={() => handleEntry('in')}>
            <LogIn className="h-10 w-10 mb-2" /> دخول
          </Button>
          <Button size="xl" className="bg-red-600 hover:bg-red-700 text-white text-2xl px-10 py-6 rounded-xl flex flex-col items-center" onClick={() => handleEntry('out')}>
            <LogOut className="h-10 w-10 mb-2" /> خروج
          </Button>
        </div>
        {/* رسالة */}
        {message && (
          <div className={`text-2xl font-bold mb-4 ${status === 'in' ? 'text-green-600' : 'text-red-600'}`}>{message}</div>
        )}
        {/* آخر دخول/خروج */}
        <div className="text-gray-500 text-lg mt-8">آخر دخول: 08:05 | آخر خروج: 17:12</div>
      </div>
    </AppLayout>
  );
}
