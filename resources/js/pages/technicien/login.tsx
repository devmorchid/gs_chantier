import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { Lock, User } from 'lucide-react';

export default function TechnicienLogin() {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Replace with real PIN validation
    if (pin.length !== 4) {
      setError('المرجو إدخال 4 أرقام');
      return;
    }
    // Simulate login
    setError('');
    // Redirect to main interface (to be implemented)
    // router.visit('/technicien/main');
  };

  return (
    <AppLayout breadcrumbs={[]}> {/* No breadcrumbs for login */}
      <Head title="دخول التقني" />
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <Card className="w-full max-w-sm mt-24">
          <CardHeader>
            <CardTitle className="text-center text-2xl font-bold">
              <User className="mx-auto mb-2 h-10 w-10 text-blue-600" />
              دخول التقني
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-6">
              <Input
                type="password"
                inputMode="numeric"
                maxLength={4}
                minLength={4}
                pattern="[0-9]{4}"
                placeholder="أدخل رقم PIN (4 أرقام)"
                value={pin}
                onChange={e => setPin(e.target.value.replace(/[^0-9]/g, ''))}
                className="text-center text-xl tracking-widest"
              />
              {error && <div className="text-red-600 text-center text-sm">{error}</div>}
              <Button type="submit" size="lg" className="w-full text-lg">
                <Lock className="mr-2 h-5 w-5" /> دخول
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
