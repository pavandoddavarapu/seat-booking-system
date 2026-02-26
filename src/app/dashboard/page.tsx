'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { canBook, isRegularDay } from '@/utils/bookingRules';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { format, isSameDay } from 'date-fns';
import { Database } from '@/types/supabase';

type Booking = Database['public']['Tables']['bookings']['Row'];
type Employee = Database['public']['Tables']['employees']['Row'];

export default function Dashboard() {
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [employee, setEmployee] = useState<Employee | null>(null);
    const [bookingsForDay, setBookingsForDay] = useState<Booking[]>([]);
    const [myBooking, setMyBooking] = useState<Booking | null>(null);
    const [loading, setLoading] = useState(true);
    const [bookingInProgress, setBookingInProgress] = useState(false);

    const supabase = createClient();

    useEffect(() => {
        fetchData();
    }, [date]);

    const fetchData = async () => {
        if (!date) return;
        setLoading(true);

        // Get Session
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        // Get Employee
        if (!employee) {
            const { data: empData } = await supabase
                .from('employees')
                .select('*')
                .eq('id', session.user.id)
                .single();
            setEmployee(empData);
        }

        const formattedDate = format(date, 'yyyy-MM-dd');

        // Get Bookings for this day
        const { data: dayBookings } = await supabase
            .from('bookings')
            .select('*')
            .eq('date', formattedDate)
            .eq('status', 'confirmed');

        setBookingsForDay(dayBookings || []);

        const myBookingsToday = (dayBookings || []).find((b: any) => b.employee_id === session.user.id);
        setMyBooking(myBookingsToday || null);

        setLoading(false);
    };

    const handleBook = async (seatNumber: number) => {
        if (!employee || !date || myBooking) return;
        setBookingInProgress(true);

        const ruleCheck = canBook(employee.batch, date, new Date());

        if (!ruleCheck.allowed) {
            toast.error(ruleCheck.reason || "Booking not allowed");
            setBookingInProgress(false);
            return;
        }

        const { data, error } = await supabase
            .from('bookings')
            .insert({
                employee_id: employee.id,
                date: format(date, 'yyyy-MM-dd'),
                seat_number: seatNumber,
                is_extra: ruleCheck.isExtra,
                status: 'confirmed'
            })
            .select()
            .single();

        if (error) {
            toast.error("Failed to book seat. Someone might have just booked it.");
        } else {
            toast.success(`Successfully booked Seat ${seatNumber}`);
            setMyBooking(data);
            setBookingsForDay([...bookingsForDay, data]);
        }
        setBookingInProgress(false);
    };

    const handleCancel = async () => {
        if (!myBooking) return;
        setBookingInProgress(true);

        const { error } = await supabase
            .from('bookings')
            .update({ status: 'cancelled' })
            .eq('id', myBooking.id);

        if (error) {
            toast.error("Failed to cancel booking.");
        } else {
            toast.success("Booking cancelled successfully.");
            setMyBooking(null);
            fetchData(); // Refresh to remove seat claim
        }
        setBookingInProgress(false);
    };

    // Helper arrays for rendering Seats
    const TOTAL_SEATS = 50;
    const bookedSeatNumbers = bookingsForDay.map(b => b.seat_number);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h1>
                {employee && (
                    <Badge variant="outline" className="px-3 py-1 bg-white">
                        {isRegularDay(employee.batch, date || new Date()) ? 'Regular Day' : 'Non-Assigned Day'}
                        {' '}- Batch {employee.batch}
                    </Badge>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Left Col: Calendar and Context */}
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
                                disabled={{ before: new Date() }} // simplified default disable
                            />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Booking Status</CardTitle>
                            <CardDescription>{date ? format(date, 'MMMM d, yyyy') : 'No date selected'}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500">Total Seats</span>
                                <span className="font-semibold">{TOTAL_SEATS}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500">Available</span>
                                <span className="font-semibold text-emerald-600">{TOTAL_SEATS - bookingsForDay.length}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500">Booked</span>
                                <span className="font-semibold text-blue-600">{bookingsForDay.length}</span>
                            </div>

                            <div className="pt-4 border-t mt-4">
                                {myBooking ? (
                                    <div className="space-y-3">
                                        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                                            <p className="text-sm font-medium text-emerald-800">You are booked!</p>
                                            <p className="text-xs text-emerald-600 mt-1">Seat {myBooking.seat_number}</p>
                                        </div>
                                        <Button
                                            variant="destructive"
                                            className="w-full"
                                            onClick={handleCancel}
                                            disabled={bookingInProgress}
                                        >
                                            Cancel Booking
                                        </Button>
                                    </div>
                                ) : (
                                    <p className="text-sm text-slate-500 italic text-center">No active booking for this date.</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Col: Seat Grid */}
                <div className="md:col-span-3">
                    <Card className="h-full">
                        <CardHeader>
                            <CardTitle>Office Layout</CardTitle>
                            <CardDescription>
                                Select an available seat to book.
                                {employee && date && !canBook(employee.batch, date, new Date()).allowed && (
                                    <span className="text-red-500 ml-1 block mt-1">
                                        {canBook(employee.batch, date, new Date()).reason}
                                    </span>
                                )}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="h-[400px] flex items-center justify-center">
                                    <span className="text-slate-400">Loading layout...</span>
                                </div>
                            ) : (
                                <div className="grid grid-cols-5 md:grid-cols-10 gap-3">
                                    {Array.from({ length: TOTAL_SEATS }).map((_, i) => {
                                        const seatNum = i + 1;
                                        const isBooked = bookedSeatNumbers.includes(seatNum);
                                        const isMySeat = myBooking?.seat_number === seatNum;

                                        // Rules
                                        const ruleCheck = employee && date ? canBook(employee.batch, date, new Date()) : { allowed: false };
                                        const isSelectable = !isBooked && !myBooking && ruleCheck.allowed && !bookingInProgress;

                                        return (
                                            <button
                                                key={seatNum}
                                                onClick={() => isSelectable && handleBook(seatNum)}
                                                disabled={!isSelectable && !isMySeat}
                                                className={`
                          h-12 rounded-lg flex items-center justify-center font-medium text-sm transition-all
                          ${isMySeat
                                                        ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-600 ring-offset-2'
                                                        : isBooked
                                                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                                                            : isSelectable
                                                                ? 'bg-white border-2 border-slate-200 text-slate-700 hover:border-emerald-500 hover:bg-emerald-50 cursor-pointer shadow-sm hover:shadow'
                                                                : 'bg-slate-50 border border-slate-200 text-slate-400 cursor-not-allowed opacity-60'}
                        `}
                                            >
                                                {seatNum}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
