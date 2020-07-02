import { EntityRepository, Repository, getRepository, PromiseUtils } from 'typeorm';

import Transaction from '../models/Transaction';
import Category from '../models/Category';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}
interface TransactionsFormated{
  id: string;
  title: string;
  value: number;
  type: string; //'income' | 'outcome';
  category: Category | undefined;
  created_at: Date;
  updated_at: Date;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const transactions = await this.all()

    const income = transactions
                .filter(transaction=> transaction.type == 'income')
                .reduce((acum, elem)=> elem.value + acum,0)
    const outcome = transactions
                  .filter(transaction=> transaction.type == 'outcome')
                  .reduce((acum, elem)=> elem.value + acum,0)
    const balance = {income, outcome, total: income-outcome}
    console.log(balance);
    
    return balance
  }

  public async all():Promise<TransactionsFormated[]>{
    const transactionRepository = getRepository(Transaction)
    const categoryRepository = getRepository(Category)
    const transactions = await transactionRepository.find()

    const transactionsFromated = []
    for(let transaction of transactions){
      const categoria = await categoryRepository.findOne(transaction.category_id)
      if(categoria) transaction.category = categoria
      delete transaction.category_id
    }
    console.log(transactions)
    return transactions
   
    }
    
  
}

export default TransactionsRepository;
