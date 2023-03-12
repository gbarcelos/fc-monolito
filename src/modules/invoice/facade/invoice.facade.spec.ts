import { Sequelize } from "sequelize-typescript";
import InvoiceFacadeFactory from "../factory/invoice.facade.factory";
import { InvoiceModel } from "../repository/invoice.model";
import { InvoiceItemModel } from "../repository/item.model";

describe("InvoiceFacade test", () => {

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

    it("should create a invoice", async () => {

        const input = {
            name: "Invoice test",
            document: "123456789",
            street: "street",
            number: "123",
            complement: "complement",
            city: "city",
            state: "state",
            zipCode: "12345678",
            items: [
                {
                    id: "1",
                    name: "item 1",
                    price: 10
                },
                {
                    id: "2",
                    name: "item 2",
                    price: 20
                }
            ]
        };

        const invoiceFacade = InvoiceFacadeFactory.create();

        const invoideCreated = await invoiceFacade.createInvoice(input);

        expect(invoideCreated).toBeDefined();
        expect(invoideCreated.id).toBeDefined();
        expect(invoideCreated.name).toBe(input.name);
        expect(invoideCreated.document).toBe(input.document);
        expect(invoideCreated.street).toBe(input.street);
        expect(invoideCreated.number).toBe(input.number);
        expect(invoideCreated.complement).toBe(input.complement);
        expect(invoideCreated.city).toBe(input.city);
        expect(invoideCreated.state).toBe(input.state);
        expect(invoideCreated.zipCode).toBe(input.zipCode);
        expect(invoideCreated.items.length).toBe(input.items.length);
        expect(invoideCreated.total).toBe(
            input.items.reduce((acc, item) => acc + item.price, 0)
        );
    });

    it("should find a invoice", async () => {

        const input = {
            name: "Invoice test",
            document: "123456789",
            street: "street",
            number: "123",
            complement: "complement",
            city: "city",
            state: "state",
            zipCode: "12345678",
            items: [
                {
                    id: "1",
                    name: "item 1",
                    price: 10
                },
                {
                    id: "2",
                    name: "item 2",
                    price: 20
                }
            ]
        };

        const invoiceFacade = InvoiceFacadeFactory.create();

        const invoideCreated = await invoiceFacade.createInvoice(input);
        const invoideFound = await invoiceFacade.findInvoice(invoideCreated.id);

        expect(invoideFound).toBeDefined();
        expect(invoideFound.id).toBeDefined();
        expect(invoideFound.name).toBe(input.name);
        expect(invoideFound.document).toBe(input.document);
        expect(invoideFound.address.street).toBe(input.street);
        expect(invoideFound.address.number).toBe(input.number);
        expect(invoideFound.address.complement).toBe(input.complement);
        expect(invoideFound.address.city).toBe(input.city);
        expect(invoideFound.address.state).toBe(input.state);
        expect(invoideFound.address.zipCode).toBe(input.zipCode);
        expect(invoideFound.items.length).toBe(input.items.length);
        expect(invoideFound.total).toBe(
            input.items.reduce((acc, item) => acc + item.price, 0)
        );
    });
});