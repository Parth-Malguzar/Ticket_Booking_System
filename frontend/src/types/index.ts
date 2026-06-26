export interface User{
    id: string,
    name:string,
    email:string,
    role:"user"|"admin"|"vendor",
    balance:number,
    vendorStatus?: "none" | "pending" | "approved" | "rejected",
    verified?: boolean,
    profilePic?: string,
    createdAt?: string
}

export interface CatalogEvent {
    id: string,
    title: string,
    image: string,
    date: string,
    time: string,
    venue: string,
    price: string,
    availableSeats?: number,
    totalSeats?: number,
    occupiedSeats?: number[],
    details: string[]
}

export interface CatalogItem extends CatalogEvent {
    category: "movies" | "train" | "concert",
    status?: "approved" | "pending",
    requestRemoval?: boolean,
    createdAt?: string
}
export interface UserBooking {
    id: string;
    userId: string;
    itemId: string;
    title: string;
    image: string;
    category: "movies" | "train" | "concert";
    date: string;
    time: string;
    seats: number;
    seatNumbers?: number[];
    venue: string;
    price: number;
    totalAmount: number;
    source?: string;
    destination?: string;
    status: "pending" | "confirmed" | "cancelled";
    hiddenByUser?: boolean;
    createdAt: string;
}