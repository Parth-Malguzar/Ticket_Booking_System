export interface User{
    id: string,
    name:string,
    email:string,
    role:"user"|"admin"|"vendor",
    balance:number,
    vendorStatus?: "none" | "pending" | "approved" | "rejected"
}