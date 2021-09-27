export interface IRow{
    vendor: string
    vendorCode: string
    available: number
    price: string
}

export interface IRawRow{
    vendor: string[]
    vendorCode: string[]
    available: string
    price: string[]
}