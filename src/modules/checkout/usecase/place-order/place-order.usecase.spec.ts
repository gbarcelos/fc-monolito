import Id from "../../../@shared/domain/value-object/id.value-object";
import Product from "../../domain/product.entity";
import { PlaceOrderInputDto } from "./place-order.dto";
import PlaceOrderUseCase from "./place-order.usecase";

const mockDate = new Date(2000, 1, 1);

describe("PlaceOrderUseCase unit test", () => {

    describe("validateProducts method", () => {

        //@ts-expect-error - no params in constructor
        const placeOrderUsecase = new PlaceOrderUseCase();

        it("should throw an error if no products are selected", async () => {

            const input: PlaceOrderInputDto = {
                clientId: "1",
                products: []
            };

            await expect(placeOrderUsecase["validateProducts"](input)).rejects.toThrow(new Error("No products selected"));
        });

        it("should throw an error when product is out of stock", async () => {

            const mockProductFacade = {

                checkStock: jest.fn(({ productId }: { productId: string }) =>
                    Promise.resolve({
                        productId,
                        stock: productId === "1" ? 0 : 10
                    })
                )
            };

            // @ts-expect-error - force set productFacade
            placeOrderUsecase["_productFacade"] = mockProductFacade;

            let input: PlaceOrderInputDto = {
                clientId: "0",
                products: [{ productId: "1" }]
            };

            await expect(placeOrderUsecase["validateProducts"](input)).rejects.toThrow(
                new Error("Product 1 is not available in stock")
            );


            input = {
                clientId: "0",
                products: [{ productId: "0" }, { productId: "1" }]
            };

            await expect(placeOrderUsecase["validateProducts"](input)).rejects.toThrow(new Error("Product 1 is not available in stock"));

            expect(mockProductFacade.checkStock).toHaveBeenCalledTimes(3);

            input = {
                clientId: "0",
                products: [{ productId: "0" }, { productId: "1" }, { productId: "2" }]
            };

            await expect(placeOrderUsecase["validateProducts"](input)).rejects.toThrow(new Error("Product 1 is not available in stock"));

            expect(mockProductFacade.checkStock).toHaveBeenCalledTimes(5);

        });

    });

    describe("getProducts method", () => {

        beforeAll(() => {
            jest.useFakeTimers("modern");
            jest.setSystemTime(mockDate);
        });

        afterAll(() => {
            jest.useRealTimers();
        });

        //@ts-expect-error - no params in constructor
        const placeOrderUsecase = new PlaceOrderUseCase();

        it("should throw an error when product not found", async () => {

            const mockCatalogFacade = {
                find: jest.fn().mockResolvedValue(null)
            };

            //@ts-expect-error - force set catalogFacade
            placeOrderUsecase["_catalogFacade"] = mockCatalogFacade;

            await expect(placeOrderUsecase["getProduct"]("0")).rejects.toThrow(
                new Error("Product not found")
            );

        });

        it("should return a product", async () => {

            const mockCatalogFacade = {
                find: jest.fn().mockResolvedValue({
                    id: "0",
                    name: "Product 0",
                    description: "Product 0 description",
                    salesPrice: 0
                })
            };

            //@ts-expect-error - force set catalogFacade
            placeOrderUsecase["_catalogFacade"] = mockCatalogFacade;

            await expect(placeOrderUsecase["getProduct"]("0")).resolves.toEqual(
                new Product({
                    id: new Id("0"),
                    name: "Product 0",
                    description: "Product 0 description",
                    salesPrice: 0
                })
            );
            expect(mockCatalogFacade.find).toBeCalledTimes(1);
        });

    });

    describe("execute method", () => {

        it("should thrown an error when client not found", async () => {
            const mockClientfacade = {
                find: jest.fn().mockResolvedValue(null),
            }
            //@ts-expect-error - no params in constructor
            const placeOrderUseCase = new PlaceOrderUseCase();
            //@ts-expect-error - force set clientFacade
            placeOrderUseCase["_clientFacade"] = mockClientfacade

            const input: PlaceOrderInputDto = { clientId: "0", products: [] };

            await expect(placeOrderUseCase.execute(input)).rejects.toThrow(
                new Error("Client not found")
            );
        });

        it("should thrown an error when products are not valid", async () => {
            const mockClientfacade = {
                find: jest.fn().mockResolvedValue(true)
            }

            //@ts-expect-error - no params in constructor
            const placeOrderUseCase = new PlaceOrderUseCase();

            const mockValidateProducts = jest
                //@ts-expect-error - spy on private method
                .spyOn(placeOrderUseCase, "validateProducts")
                //@ts-expect-error - not return never
                .mockRejectedValue(new Error("No products selected"));

            //@ts-expect-error - force set clientFacade
            placeOrderUseCase["_clientFacade"] = mockClientfacade

            const input: PlaceOrderInputDto = { clientId: "1", products: [] };
            await expect(placeOrderUseCase.execute(input)).rejects.toThrow(
                new Error("No products selected")
            );
            expect(mockValidateProducts).toHaveBeenCalledTimes(1);
        });

        describe("place an order", () => {

            const clientProps = {
                id: "1c",
                name: "Client 0",
                document: "00000",
                email: "client@user.com",
                street: "some street",
                number: "1",
                complement: "",
                city: "some city",
                state: "some state",
                zipCode: "000"
            };

            const mockClientFacade = {
                find: jest.fn().mockResolvedValue(clientProps)
            };

            const mockPaymentFacade = {
                process: jest.fn()
            };

            const mockCheckoutRepository = {
                addOrder: jest.fn()
            };

            const mockInvoiceFacade = {
                generateInvoice: jest.fn().mockResolvedValue({ id: "1i" })
            };

            const placeOrderUsecase = new PlaceOrderUseCase(
                mockClientFacade as any,
                null,
                null,
                mockCheckoutRepository as any,
                mockInvoiceFacade as any,
                mockPaymentFacade
            );

            const products = {
                "1": new Product({
                    id: new Id("1"),
                    name: "Product 1",
                    description: "some description",
                    salesPrice: 40
                }),
                "2": new Product({
                    id: new Id("2"),
                    name: "Product 2",
                    description: "some description",
                    salesPrice: 30
                }),
            };

            const mockValidateProducts = jest
                //@ts-expect-error - spy on private method
                .spyOn(placeOrderUsecase, "validateProducts")
                //@ts-expect-error - not return never
                .mockResolvedValue(null);

            const mockGetProduct = jest
                //@ts-expect-error - spy on private method
                .spyOn(placeOrderUsecase, "getProduct")
                //@ts-expect-error - not return never
                .mockImplementation((productId: keyof typeof products) => {
                    return products[productId];
                });

            it("should not be approved", async () => {

                mockPaymentFacade.process = mockPaymentFacade.process.mockReturnValue({
                    transactionId: "1t",
                    orderId: "1o",
                    amount: 100,
                    status: "error",
                    createdAt: new Date(),
                    updatedAt: new Date()
                });

                const input: PlaceOrderInputDto = {
                    clientId: "1c",
                    products: [{ productId: "1" }, { productId: "2" }]
                };

                let output = await placeOrderUsecase.execute(input);

                expect(output.invoiceId).toBeNull();
                expect(output.total).toBe(70);
                expect(output.products).toStrictEqual(input.products);//*

                expect(mockClientFacade.find).toHaveBeenCalledTimes(1);
                expect(mockValidateProducts).toHaveBeenCalledWith(input);//*

                expect(mockGetProduct).toHaveBeenCalledTimes(2);

                expect(mockCheckoutRepository.addOrder).toHaveBeenCalledTimes(1);

                expect(mockPaymentFacade.process).toHaveBeenCalledTimes(1);
                expect(mockPaymentFacade.process).toHaveBeenCalledWith({
                    orderId: output.id,
                    amount: output.total
                });
                expect(mockInvoiceFacade.generateInvoice).toHaveBeenCalledTimes(0);
            });

        });
    });
});