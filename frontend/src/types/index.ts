export interface User{
    id: string,
    name:string,
    email:string,
    role:"user"|"admin"|"vendor",
    balance:number,
    vendorStatus?: "none" | "pending" | "approved" | "rejected",
    verified?: boolean,
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
    details: string[]
}

export interface CatalogItem extends CatalogEvent {
    category: "movies" | "train" | "concert",
    status?: "approved" | "pending",
    requestRemoval?: boolean,
    createdAt?: string
}