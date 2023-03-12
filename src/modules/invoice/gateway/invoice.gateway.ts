import Invoice  from "../domain/invoice.entity";

export interface InvoiceGateway {

    create(invoice: Invoice): Promise<void>;

    find(id: string): Promise<Invoice>;
}