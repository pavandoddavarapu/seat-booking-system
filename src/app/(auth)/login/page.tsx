import { supabase } from '@/lib/supabase/client';
import { Database } from '@/types/supabase';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Check if test environment (using generic password)

        const { data: { session }, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            toast.error(error.message);
            setLoading(false);
            return;
        }

        if (session) {
            // Get user role
            const { data: employeeData } = await supabase
                .from('employees')
                .select('role')
                .eq('id', session.user.id)
                .single();

            const employee = employeeData as { role: string } | null;

            if (employee?.role === 'admin') {
                router.push('/admin');
            } else {
                router.push('/dashboard');
            }
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50">
            <Card className="w-[400px] shadow-lg border-0 ring-1 ring-slate-200">
                <CardHeader className="space-y-1 pb-8">
                    <div className="flex justify-center mb-4">
                        <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-sm">
                            W
                        </div>
                    </div>
                    <CardTitle className="text-2xl text-center font-semibold tracking-tight text-slate-900">
                        Wissen Seats
                    </CardTitle>
                    <CardDescription className="text-center text-slate-500">
                        Enter your credentials to access your account
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-slate-700">Email address</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="name@wissen.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={loading}
                                className="focus-visible:ring-blue-500"
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password" className="text-slate-700">Password</Label>
                            </div>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={loading}
                                className="focus-visible:ring-blue-500"
                            />
                        </div>
                        <Button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                            disabled={loading}
                        >
                            {loading ? 'Signing in...' : 'Sign in'}
                        </Button>
                    </form>

                    <div className="mt-6 text-sm text-center text-slate-500 border-t pt-4">
                        <p>Demo credentials:</p>
                        <p className="mt-1">Admin: admin@wissen.com | password123</p>
                        <p className="mt-1">User: b1.user1@wissen.com | password123</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
