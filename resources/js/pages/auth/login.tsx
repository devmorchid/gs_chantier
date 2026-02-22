import InputError from '@/components/input-error';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription } from '@/components/ui/alert-dialog';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

type Props = {
    status?: string;
    canResetPassword: boolean;
    canRegister: boolean;
};

export default function Login({
    status,
    canResetPassword,
    canRegister,
}: Props) {
    const showDialog = status === 'Votre compte est désactivé.';

    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/login', {
            onFinish: () => reset('password'),
        });
    };

    return (
        <AuthLayout
            title="Log in to your account"
            description="Enter your email and password below to log in"
        >
            <Head title="Log in" />

            {showDialog && (
                <AlertDialog open>
                    <AlertDialogContent className="bg-gradient-to-br from-red-900 via-zinc-900 to-black border-2 border-red-700 shadow-2xl text-center animate-in fade-in duration-300">
                        <AlertDialogHeader>
                            <div className="flex flex-col items-center gap-2">
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="text-red-500 mb-2">
                                    <circle cx="12" cy="12" r="12" fill="#ef4444"/>
                                    <path d="M12 8v4" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
                                    <circle cx="12" cy="16" r="1" fill="#fff"/>
                                </svg>
                                <AlertDialogTitle className="text-2xl font-bold text-red-200 drop-shadow">Compte désactivé</AlertDialogTitle>
                                <AlertDialogDescription className="text-base text-red-100 mt-2 mb-4">
                                    Votre compte est <span className="font-semibold text-red-300">désactivé</span>.<br />Veuillez contacter l'administrateur pour réactivation.<br />
                                </AlertDialogDescription>
                                <button
                                    className="mt-4 px-6 py-2 rounded-lg bg-red-600 text-white font-semibold shadow hover:bg-red-700 transition"
                                    onClick={() => window.location.reload()}
                                >
                                    OK
                                </button>
                            </div>
                        </AlertDialogHeader>
                    </AlertDialogContent>
                </AlertDialog>
            )}

            <form onSubmit={submit} className="flex flex-col gap-6">
                <div className="grid gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email address</Label>
                        <Input
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            required
                            autoFocus
                            tabIndex={1}
                            autoComplete="email"
                            placeholder="email@example.com"
                        />
                        <InputError message={errors.email} />
                    </div>

                    <div className="grid gap-2">
                        <div className="flex items-center">
                            <Label htmlFor="password">Password</Label>
                            {canResetPassword && (
                                <TextLink
                                    href="/forgot-password"
                                    className="ml-auto text-sm"
                                    tabIndex={5}
                                >
                                    Forgot password?
                                </TextLink>
                            )}
                        </div>
                        <Input
                            id="password"
                            type="password"
                            name="password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            required
                            tabIndex={2}
                            autoComplete="current-password"
                            placeholder="Password"
                        />
                        <InputError message={errors.password} />
                    </div>

                    <div className="flex items-center space-x-3">
                        <Checkbox
                            id="remember"
                            name="remember"
                            checked={data.remember}
                            onCheckedChange={(checked) => setData('remember', checked as boolean)}
                            tabIndex={3}
                        />
                        <Label htmlFor="remember">Remember me</Label>
                    </div>

                    <Button
                        type="submit"
                        className="mt-4 w-full"
                        tabIndex={4}
                        disabled={processing}
                        data-test="login-button"
                    >
                        {processing && <Spinner />}
                        Log in
                    </Button>
                </div>

                {canRegister && (
                    <div className="text-center text-sm text-muted-foreground">
                        Don't have an account?{' '}
                        <TextLink href="/register" tabIndex={5}>
                            Sign up
                        </TextLink>
                    </div>
                )}
            </form>

            {status && status !== 'Votre compte est désactivé.' && (
                <div className="mb-4 text-center text-sm font-medium text-green-600">
                    {status}
                </div>
            )}
        </AuthLayout>
    );
}
