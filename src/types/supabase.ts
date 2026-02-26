export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            employees: {
                Row: {
                    id: string
                    created_at: string
                    name: string
                    email: string
                    batch: 1 | 2
                    role: 'user' | 'admin'
                }
                Insert: {
                    id: string
                    created_at?: string
                    name: string
                    email: string
                    batch: 1 | 2
                    role?: 'user' | 'admin'
                }
                Update: {
                    id?: string
                    created_at?: string
                    name?: string
                    email?: string
                    batch?: 1 | 2
                    role?: 'user' | 'admin'
                }
            }
            bookings: {
                Row: {
                    id: string
                    created_at: string
                    employee_id: string
                    date: string
                    seat_number: number
                    status: 'confirmed' | 'cancelled'
                    is_extra: boolean
                }
                Insert: {
                    id?: string
                    created_at?: string
                    employee_id: string
                    date: string
                    seat_number: number
                    status?: 'confirmed' | 'cancelled'
                    is_extra?: boolean
                }
                Update: {
                    id?: string
                    created_at?: string
                    employee_id?: string
                    date?: string
                    seat_number?: number
                    status?: 'confirmed' | 'cancelled'
                    is_extra?: boolean
                }
            }
            leaves: {
                Row: {
                    id: string
                    created_at: string
                    employee_id: string
                    date: string
                }
                Insert: {
                    id?: string
                    created_at?: string
                    employee_id: string
                    date: string
                }
                Update: {
                    id?: string
                    created_at?: string
                    employee_id?: string
                    date?: string
                }
            }
        }
    }
}
