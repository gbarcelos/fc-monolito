import UseCaseInterface from "../../@shared/usecase/use-case.interface";
import {
    InvoiceFacadeInterface, GenerateInvoiceFacadeInputDto,
    GenerateInvoiceFacadeOutputDto, FindInvoiceFacadeOutputDto
} from "./invoice.facade.interface";

export interface UseCasesProps {
    generateInvoiceUseCase: UseCaseInterface;
    findInvoiceUseCase: UseCaseInterface;
}

export default class InvoiceFacade implements InvoiceFacadeInterface {

    private _generateInvoiceUseCase: UseCaseInterface;
    private _findInvoiceUseCase: UseCaseInterface;

    constructor(usecasesProps: UseCasesProps) {
        this._generateInvoiceUseCase = usecasesProps.generateInvoiceUseCase;
        this._findInvoiceUseCase = usecasesProps.findInvoiceUseCase;
    }

    async createInvoice(invoice: GenerateInvoiceFacadeInputDto): Promise<GenerateInvoiceFacadeOutputDto> {
        return await this._generateInvoiceUseCase.execute(invoice);
    }

    async findInvoice(id: string): Promise<FindInvoiceFacadeOutputDto> {
        return await this._findInvoiceUseCase.execute({ id });
    }
}