'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Database } from '@/types/supabase';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

type Booking = Database['public']['Tables']['bookings']['Row'] & {
    employees: { name: string; batch: number; email: string; }
};

export default function AdminDashboard() {
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [bookingsForDay, setBookingsForDay] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);

    const supabase = createClient();

    useEffect(() => {
        fetchData();
    }, [date]);

    const fetchData = async () => {
        if (!date) return;
        setLoading(true);

        const formattedDate = format(date, 'yyyy-MM-dd');

        // Get Bookings + Employee details
        const { data: dayBookings, error } = await supabase
            .from('bookings')
            .select(`
        *,
        employees (name, batch, email)
      `)
            .eq('date', formattedDate)
            .eq('status', 'confirmed');

        if (error) {
            toast.error("Failed to load bookings");
        } else {
            setBookingsForDay((dayBookings as unknown as Booking[]) || []);
        }

        setLoading(false);
    };

    const cancelBooking = async (id: string) => {
        const { error } = await supabase
            .from('bookings')
            .update({ status: 'cancelled' })
            .eq('id', id);

        if (error) toast.error("Failed to cancel booking");
        else {
            toast.success("Booking cancelled");
            fetchData(); // reload
        }
    };

    const TOTAL_SEATS = 50;
    const bookedSeatsCount = bookingsForDay.length;
    const occupancyRate = Math.round((bookedSeatsCount / TOTAL_SEATS) * 100);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Admin Overview</h1>
                    <p className="text-slate-500 mt-1">Manage all employee bookings and view occupancy.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="space-y-6 md:col-span-1">
                    <Card>
                        <CardHeader>
                            <CardTitle>Select Date</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Calendar
                                mode="single"
                                selected={date}
                                onSelect={setDate}
                                className="rounded-md border shadow-sm mx-auto"
                            />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Daily Occupancy</CardTitle>
                            <CardDescription>{date ? format(date, 'MMMM d, yyyy') : 'No date selected'}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500">Total Seats</span>
                                <span className="font-semibold">{TOTAL_SEATS}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500">Available</span>
                                <span className="font-semibold text-emerald-600">{TOTAL_SEATS - bookedSeatsCount}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500">Booked</span>
                                <span className="font-semibold text-blue-600">{bookedSeatsCount}</span>
                            </div>
                        </CardContent>
                        <CardFooter className="flex-col pb-6 bg-slate-50 border-t items-start pt-4">
                            <p className="text-sm font-medium mb-2">Occupancy Rate</p>
                            <div className="h-4 w-full bg-slate-200 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-blue-600 transition-all duration-500"
                                    style={{ width: `${occupancyRate}%` }}
                                />
                            </div>
                            <p className="text-xs text-slate-500 mt-2">{occupancyRate}% Full</p>
                        </CardFooter>
                    </Card>
                </div>

                <div className="md:col-span-3">
                    <Card className="h-full">
                        <CardHeader>
                            <CardTitle>Bookings Details</CardTitle>
                            <CardDescription>
                                List of all employees confirmed for {date ? format(date, 'MMM d, yyyy') : 'selected day'}.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="py-12 flex justify-center text-slate-400">Loading bookings...</div>
                            ) : bookingsForDay.length === 0 ? (
                                <div className="py-12 text-center text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                                    <p>No bookings for this date.</p>
                                </div>
                            ) : (
                                <div className="rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Employee</TableHead>
                                                <TableHead>Batch</TableHead>
                                                <TableHead>Seat #</TableHead>
                                                <TableHead>Type</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {bookingsForDay.map((b) => (
                                                <TableRow key={b.id}>
                                                    <TableCell className="font-medium">
                                                        <div className="flex flex-col">
                                                            <span>{b.employees?.name}</span>
                                                            <span className="text-xs text-slate-500">{b.employees?.email}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline">Batch {b.employees?.batch}</Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="font-mono bg-slate-100 px-2 py-1 rounded-md text-slate-700">
                                                            #{b.seat_number}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>
                                                        {b.is_extra ? (
                                                            <Badge variant="secondary" className="bg-purple-100 text-purple-800 hover:bg-purple-100">Extra</Badge>
                                                        ) : (
                                                            <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-100">Regular</Badge>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => cancelBooking(b.id)}
                                                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                        >
                                                            Revoke
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
