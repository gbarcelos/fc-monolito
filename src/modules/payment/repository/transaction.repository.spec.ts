import { Sequelize } from "sequelize-typescript";
import Id from "../../@shared/domain/value-object/id.value-object";
import Transaction from "../domain/transaction";
import TransactionModel from "./transaction.model";
import TransactionRepostiory from "./transaction.repository";

describe("TransactionRepository test", () => {

    let sequelize: Sequelize;

    beforeEach(async () => {
        sequelize = new Sequelize({
            dialect: "sqlite",
            storage: ":memory:",
            logging: false,
            sync: { force: true }
        });

        await sequelize.addModels([TransactionModel]);
        await sequelize.sync();
    });

    afterEach(async () => {
        await sequelize.close();
    });

    it("should save a transaction", async () => {

        const transaction = new Transaction({
            id: new Id("1"),
            amount: 100,
            orderId: "1"
        });
        transaction.approve();

        const repository = new TransactionRepostiory();
        await repository.save(transaction);

        const transactionDb = await TransactionModel.findOne({
            where: { id: "1" },
            raw: true,
            nest: true
        });

        expect(transactionDb).toBeDefined();
        expect(transactionDb.id).toBe(transaction.id.id);
        expect(transactionDb.amount).toBe(transaction.amount);
        expect(transactionDb.orderId).toBe(transaction.orderId);
    });
});
