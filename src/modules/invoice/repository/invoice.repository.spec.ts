import { Sequelize } from "sequelize-typescript";
import Id from "../../@shared/domain/value-object/id.value-object";
import { Address } from "../domain/address.value-object";
import Invoice from "../domain/invoice.entity";
import Product from "../domain/product.entity";
import { InvoiceModel } from "./invoice.model";
import InvoiceRepository from "./invoice.repository";
import { InvoiceItemModel } from "./item.model";

describe("InvoiceRepository test", () => {

    let sequelize: Sequelize;

    beforeEach(async () => {
        sequelize = new Sequelize({
            dialect: "sqlite",
            storage: ":memory:",
            logging: false,
            sync: { force: true }
        });

        await sequelize.addModels([InvoiceModel, InvoiceItemModel]);
        await sequelize.sync();
    });

    afterEach(async () => {
        await sequelize.close();
    });

    it("should create an invoice", async () => {

        const invoice = new Invoice({
            id: new Id("1"),
            name: "Invoice 1",
            document: "document 123",
            address: new Address({
                street: "street 123",
                number: "123",
                complement: "complement 123",
                city: "city 123",
                state: "state 123",
                zipCode: "87654321"
            }),
            items: [
                new Product({
                    id: new Id("11"),
                    name: "Product 11",
                    price: 10
                }),
                new Product({
                    id: new Id("21"),
                    name: "Product 21",
                    price: 20
                })
            ]
        });

        const repository = new InvoiceRepository();
        await repository.create(invoice);

        const result = await InvoiceModel.findOne({
            where: { id: "1" },
            raw: true,
            nest: true
        });

        expect(result).toBeDefined();
        expect(result.id).toBe(invoice.id.id);
        expect(result.name).toBe(invoice.name);
        expect(result.document).toBe(invoice.document);
        expect(result.street).toBe(invoice.address.street);
        expect(result.number).toBe(invoice.address.number);
        expect(result.complement).toBe(invoice.address.complement);
        expect(result.city).toBe(invoice.address.city);
        expect(result.state).toBe(invoice.address.state);
        expect(result.zipcode).toBe(invoice.address.zipCode);

        const invoiceItems = await InvoiceItemModel.findAll({
            where: { invoice_id: invoice.id.id },
            raw: true,
            nest: true
        });

        const products = invoiceItems.map((invoiceItemModel) => {
            return new Product({
                id: new Id(invoiceItemModel.id),
                name: invoiceItemModel.name,
                price: invoiceItemModel.price
            });
        });

        expect(products[0].id.id).toBe(invoice.items[0].id.id);
        expect(products[0].name).toBe(invoice.items[0].name);
        expect(products[0].price).toBe(invoice.items[0].price);

        expect(products[1].id.id).toBe(invoice.items[1].id.id);
        expect(products[1].name).toBe(invoice.items[1].name);
        expect(products[1].price).toBe(invoice.items[1].price);

        expect(result.total).toBe(30);
    });

    it("should find an invoice", async () => {

        const invoice = new Invoice({
            id: new Id("1"),
            name: "Invoice 1",
            document: "document 123",
            address: new Address({
                street: "street 123",
                number: "123",
                complement: "complement 123",
                city: "city 123",
                state: "state 123",
                zipCode: "87654321"
            }),
            items: [
                new Product({
                    id: new Id("11"),
                    name: "Product 11",
                    price: 10,
                }),
                new Product({
                    id: new Id("21"),
                    name: "Product 21",
                    price: 20
                })
            ]
        });

        const repository = new InvoiceRepository();
        await repository.create(invoice);

        const result = await repository.find(invoice.id.id);

        expect(result).toBeDefined();
        expect(result.id.id).toBe(invoice.id.id);
        expect(result.name).toBe(invoice.name);
        expect(result.document).toBe(invoice.document);

        expect(result.address.street).toBe(invoice.address.street);
        expect(result.address.number).toBe(invoice.address.number);
        expect(result.address.complement).toBe(invoice.address.complement);
        expect(result.address.city).toBe(invoice.address.city);
        expect(result.address.state).toBe(invoice.address.state);
        expect(result.address.zipCode).toBe(invoice.address.zipCode);

        expect(result.items[0].id.id).toBe(invoice.items[0].id.id);
        expect(result.items[0].name).toBe(invoice.items[0].name);
        expect(result.items[0].price).toBe(invoice.items[0].price);

        expect(result.items[1].id.id).toBe(invoice.items[1].id.id);
        expect(result.items[1].name).toBe(invoice.items[1].name);
        expect(result.items[1].price).toBe(invoice.items[1].price);

        expect(result.total).toBe(30);
    });
});