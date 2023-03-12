import Id from "../../@shared/domain/value-object/id.value-object";
import { Address } from "../domain/address.value-object";
import InvoiceEntity from "../domain/invoice.entity";
import Product from "../domain/product.entity";
import { InvoiceGateway } from "../gateway/invoice.gateway";
import { InvoiceModel } from "./invoice.model";
import { InvoiceItemModel } from "./item.model";

export default class InvoiceRepository implements InvoiceGateway {

    async create(invoice: InvoiceEntity): Promise<void> {

        await InvoiceModel.create(
            {
                id: invoice.id.id,
                name: invoice.name,
                document: invoice.document,
                street: invoice.address.street,
                number: invoice.address.number,
                complement: invoice.address.complement,
                city: invoice.address.city,
                state: invoice.address.state,
                zipcode: invoice.address.zipCode,
                items: invoice.items.map((item: Product) => ({
                    id: item.id.id,
                    name: item.name,
                    price: item.price
                })),
                total: invoice.total,
                createdAt: invoice.createdAt
            },
            {
                include: [{ model: InvoiceItemModel }]
            }
        );
    }

    async find(id: string): Promise<InvoiceEntity> {

        const products = await this.retrieveInvoiceItems(id);

        const invoiceModel = await InvoiceModel.findOne({
            where: { id },
            raw: true,
            nest: true
        });

        const invoiceProps = {
            id: new Id(invoiceModel.id),
            name: invoiceModel.name,
            document: invoiceModel.document,
            address: new Address({
                street: invoiceModel.street,
                number: invoiceModel.number,
                complement: invoiceModel.complement,
                city: invoiceModel.city,
                state: invoiceModel.state,
                zipCode: invoiceModel.zipcode,
            }),
            items: products
        };
        return new InvoiceEntity(invoiceProps);
    }

    async retrieveInvoiceItems(invoiceId: string): Promise<Product[]> {

        const invoiceItems = await InvoiceItemModel.findAll({
            where: { invoice_id: invoiceId },
            raw: true,
            nest: true
        });

        return invoiceItems.map((invoiceItemModel) => {
            return new Product({
                id: new Id(invoiceItemModel.id),
                name: invoiceItemModel.name,
                price: invoiceItemModel.price
            });
        });
    }

}