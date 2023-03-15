import UseCaseInterface from "../../../@shared/usecase/use-case.interface";
import ClientAdmFacadeInterface from "../../../client-adm/facade/client-adm.facade.interface";
import ProductAdmFacadeInterface from "../../../product-adm/facade/product-adm.facade.interface";
import StoreCatalogFacade from "../../../store-catalog/facade/store-catalog.facade";
import CheckoutGateway from "../../gateway/checkout.gateway";
import Client from "../../domain/client.entity";
import Id from "../../../@shared/domain/value-object/id.value-object";
import Order from "../../domain/order.entity";
import Product from "../../domain/product.entity";
import { PlaceOrderInputDto, PlaceOrderOutputDto } from "./place-order.dto";
import { InvoiceFacadeInterface } from "../../../invoice/facade/invoice.facade.interface";
import PaymentFacadeInterface from "../../../payment/facade/facade.interface";

export default class PlaceOrderUseCase implements UseCaseInterface {

    private _clientFacade: ClientAdmFacadeInterface;
    private _productFacade: ProductAdmFacadeInterface;
    private _catalogFacade: StoreCatalogFacade;
    private _repository: CheckoutGateway;
    private _invoiceFacade: InvoiceFacadeInterface;
    private _paymentFacade: PaymentFacadeInterface;

    constructor(
        clientFacade: ClientAdmFacadeInterface,
        productFacade: ProductAdmFacadeInterface,
        catalogFacade: StoreCatalogFacade,
        repository: CheckoutGateway,
        invoiceFacade: InvoiceFacadeInterface,
        paymentFacade: PaymentFacadeInterface
    ) {
        this._clientFacade = clientFacade;
        this._productFacade = productFacade;
        this._catalogFacade = catalogFacade;
        this._repository = repository;
        this._invoiceFacade = invoiceFacade;
        this._paymentFacade = paymentFacade;
    }

    async execute(input: PlaceOrderInputDto): Promise<PlaceOrderOutputDto> {

        const client = await this._clientFacade.find({ id: input.clientId });

        if (!client) {
            throw new Error("Client not found");
        }

        await this.validateProducts(input);

        const products = await Promise.all(
            input.products.map((p) => {
                return this.getProduct(p.productId);
            })
        );

        const myClient = new Client({
            id: new Id(client.id),
            name: client.name,
            email: client.email,
            address: client.street
        });

        const order = new Order({
            client: myClient,
            products: products
        });

        const payment = await this._paymentFacade.process({
            orderId: order.id.id,
            amount: order.total
        });

        const invoice =
            payment.status === "approved"
                ? await this._invoiceFacade.createInvoice({
                    name: client.name,
                    document: client.document,
                    street: client.street,
                    complement: client.complement,
                    number: client.number,
                    city: client.city,
                    state: client.state,
                    zipCode: client.zipCode,
                    items: products.map((p) => {
                        return {
                            id: p.id.id,
                            name: p.name,
                            price: p.salesPrice
                        };
                    })
                })
                : null;

        payment.status === "approved" && order.approved();
        this._repository.addOrder(order);

        return {
            id: order.id.id,
            invoiceId: payment.status === "approved" ? invoice.id : null,
            status: order.status,
            total: order.total,
            products: order.products.map((p) => {
                return {
                    productId: p.id.id
                };
            })
        };
    }

    private async validateProducts(input: PlaceOrderInputDto) {

        if (input.products.length === 0) {
            throw new Error("No products selected");
        }

        for (const p of input.products) {

            const product = await this._productFacade.checkStock({
                productId: p.productId
            });

            if (product.stock <= 0) {
                throw new Error(
                    `Product ${product.productId} is not available in stock`
                );
            }
        }
    }

    private async getProduct(productId: string): Promise<Product> {

        const product = await this._catalogFacade.find({ id: productId });

        if (!product) {
            throw new Error("Product not found");
        }

        const productProps = {
            id: new Id(product.id),
            name: product.name,
            description: product.description,
            salesPrice: product.salesPrice
        };
        return new Product(productProps);
    }
}
