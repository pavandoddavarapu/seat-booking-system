-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Employees table
create table public.employees (
    id uuid references auth.users not null primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    name text not null,
    email text not null unique,
    batch integer not null check (batch in (1, 2)),
    role text not null default 'user' check (role in ('user', 'admin'))
);

-- Enable RLS
alter table public.employees enable row level security;

-- Policies for employees
create policy "Employees can view their own profile."
    on public.employees for select
    using (auth.uid() = id);

create policy "Admins can view all employees."
    on public.employees for select
    using (
        exists (
            select 1 from public.employees
            where id = auth.uid() and role = 'admin'
        )
    );

-- Bookings table
create table public.bookings (
    id uuid default uuid_generate_v4() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    employee_id uuid references public.employees(id) not null,
    date date not null,
    seat_number integer not null check (seat_number between 1 and 50),
    status text not null default 'confirmed' check (status in ('confirmed', 'cancelled')),
    is_extra boolean not null default false,
    
    unique(date, seat_number, status) -- Ensure no double booking for same seat/date when confirmed
);

-- Compound index for faster querying
create index idx_bookings_date on public.bookings(date);
create index idx_bookings_employee_date on public.bookings(employee_id, date);

-- Enable RLS
alter table public.bookings enable row level security;

-- Policies for bookings
create policy "Users can view all confirmed bookings."
    on public.bookings for select
    using (true);

create policy "Users can insert their own bookings."
    on public.bookings for insert
    with check (auth.uid() = employee_id);

create policy "Users can update their own bookings."
    on public.bookings for update
    using (auth.uid() = employee_id);

create policy "Admins can manage all bookings."
    on public.bookings for all
    using (
        exists (
            select 1 from public.employees
            where id = auth.uid() and role = 'admin'
        )
    );

-- Leaves table
create table public.leaves (
    id uuid default uuid_generate_v4() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    employee_id uuid references public.employees(id) not null,
    date date not null,
    
    unique(employee_id, date)
);

-- Enable RLS
alter table public.leaves enable row level security;

create policy "Everyone can view leaves."
    on public.leaves for select
    using (true);

create policy "Admins can manage leaves."
    on public.leaves for all
    using (
        exists (
            select 1 from public.employees
            where id = auth.uid() and role = 'admin'
        )
    );
