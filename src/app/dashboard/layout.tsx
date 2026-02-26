import { Sidebar } from '@/components/layout/Sidebar';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const cookieStore = cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
            },
        }
    );

    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
        redirect('/login');
    }

    const { data: employee } = await supabase
        .from('employees')
        .select('*')
        .eq('id', session.user.id)
        .single();

    if (!employee) {
        // Edge case: auth user exists but no employee record
        await supabase.auth.signOut();
        redirect('/login');
    }

    if (employee.role === 'admin') {
        redirect('/admin');
    }

    return (
        <div className="flex min-h-screen bg-slate-50">
            <Sidebar role="user" name={employee.name} batch={employee.batch as 1 | 2} />
            <main className="flex-1 ml-64 p-8 overflow-y-auto w-full">
                {children}
            </main>
        </div>
    );
}
