import ProductAdmFacade from "../facade/product-adm.facade";
import ProductRepository from "../repository/product.repository";
import AddProductUseCase from "../usecase/add-product/add-product.usecase";
import CheckStockUseCase from "../usecase/check-stock/check-stock.usecase";

export default class ProductAdmFacadeFactory {

    static create() {
        const productRepository = new ProductRepository();

        return new ProductAdmFacade({
            addUseCase: new AddProductUseCase(productRepository),
            stockUseCase: new CheckStockUseCase(productRepository)
        });
    }
}
