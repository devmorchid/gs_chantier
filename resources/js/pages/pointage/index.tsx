
import { useState, useRef } from 'react';
import axios from 'axios';
import Webcam from 'react-webcam';
import { cn } from '@/lib/utils';

interface Technicien {
  id: number;
  nom: string;
  photo_url?: string;
  last_action?: 'in' | 'out' | null;
  is_in?: number; // 1 = entré, 0 = sorti
}

interface Props {
  techniciens: Technicien[];
}

export default function PointageIndex({ techniciens }: Props) {
  const [selected, setSelected] = useState<Technicien | null>(null);
  const [action, setAction] = useState<'in' | 'out' | null>(null);
  const [selfie, setSelfie] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<boolean | null>(null);
  const webcamRef = useRef<any>(null);

  // Step 1: Select technicien
  if (selected && !action) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center mb-8">
          <img
            src={selected.photo_url && selected.photo_url !== '' ? selected.photo_url : '/placeholder-user.png'}
            alt={selected.nom || 'بدون اسم'}
            className="w-32 h-32 rounded-full object-cover mb-3 border-4 border-blue-200"
          />
          <span className="text-3xl font-bold text-gray-800 mt-2 mb-8" style={{ letterSpacing: 1 }}>{selected.nom || 'بدون اسم'}</span>
        </div>
        <div className="flex gap-8 w-full max-w-xs">
          {selected.is_in !== 1 && (
            <button className="flex-1 bg-green-500 hover:bg-green-600 text-white text-2xl font-bold py-8 rounded-2xl shadow-lg transition" style={{ minHeight: 100 }} onClick={() => setAction('in')}>
              دخلت
            </button>
          )}
          {selected.is_in === 1 && (
            <button className="flex-1 bg-red-500 hover:bg-red-600 text-white text-2xl font-bold py-8 rounded-2xl shadow-lg transition" style={{ minHeight: 100 }} onClick={() => setAction('out')}>
              خرجت
            </button>
          )}
        </div>
        <button className="mt-12 text-blue-500 underline" onClick={() => setSelected(null)}>
          رجوع
        </button>
      </div>
    );
  }

  // Step 2: Take selfie
  if (selected && action && !selfie) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center mb-8">
          <span className="text-2xl font-bold mb-4">خذ صورة سيلفي للتأكيد</span>
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            className="rounded-2xl border-4 border-blue-200 w-64 h-64 object-cover bg-black"
            videoConstraints={{ facingMode: 'user' }}
          />
          <button
            className="mt-6 bg-blue-600 hover:bg-blue-700 text-white text-xl font-bold py-4 px-10 rounded-xl shadow-lg transition"
            onClick={() => {
              const imageSrc = webcamRef.current?.getScreenshot();
              if (imageSrc) setSelfie(imageSrc);
            }}
          >
            التقط الصورة
          </button>
          <button className="mt-6 text-blue-500 underline" onClick={() => { setAction(null); setSelfie(null); }}>
            رجوع
          </button>
        </div>
      </div>
    );
  }

  // Step 3: Submit selfie and show confirmation
  if (selected && action && selfie) {
    const chantierId = 1; // adapt if needed
    if (success === null && !loading) {
      setLoading(true);
      axios.post('/api/pointage', {
        technicien_id: selected.id,
        chantier_id: chantierId,
        action,
        selfie,
      }).then(() => {
        setSuccess(true);
        setLoading(false);
      }).catch(() => {
        setSuccess(false);
        setLoading(false);
      });
    }
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        {loading ? (
          <div className="text-2xl text-blue-600 font-bold">جاري التسجيل...</div>
        ) : success ? (
          <div className="flex flex-col items-center">
            <span className={`text-3xl font-bold mb-8 ${action === 'in' ? 'text-green-600' : 'text-red-600'}`}>{action === 'in' ? '✅ تم تسجيل الدخول' : '✅ تم تسجيل الخروج'}</span>
            <img src={selfie} alt="selfie" className="w-32 h-32 rounded-full object-cover mb-4 border-4 border-blue-200" />
            <button className="mt-8 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-8 rounded-xl" onClick={() => { setSelected(null); setAction(null); setSelfie(null); setSuccess(null); }}>رجوع</button>
          </div>
        ) : (
          <div className="text-2xl text-red-600 font-bold">حدث خطأ أثناء التسجيل، حاول مرة أخرى.</div>
        )}
      </div>
    );
  }

  // Step 0: Select technicien
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <h1 className="text-3xl font-bold mb-8 text-center">اختر صورتك</h1>
      {techniciens.length === 0 ? (
        <div className="text-2xl text-gray-500 mt-12">لا يوجد تقنيين في هذه الورشة حالياً</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 w-full max-w-3xl">
          {techniciens.map((t) => (
            <button
              key={t.id}
              className={cn(
                'flex flex-col items-center p-4 rounded-xl shadow-lg bg-white hover:bg-blue-50 transition border-2 border-transparent hover:border-blue-400',
                'focus:outline-none focus:ring-4 focus:ring-blue-200'
              )}
              style={{ minHeight: 180 }}
              onClick={() => setSelected(t)}
            >
              <img
                src={t.photo_url && t.photo_url !== '' ? t.photo_url : '/placeholder-user.png'}
                alt={t.nom || 'بدون اسم'}
                className="w-24 h-24 rounded-full object-cover mb-3 border-4 border-blue-200"
              />
              <span className="text-xl font-bold text-gray-800 mt-2" style={{ letterSpacing: 1 }}>{t.nom || 'بدون اسم'}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
