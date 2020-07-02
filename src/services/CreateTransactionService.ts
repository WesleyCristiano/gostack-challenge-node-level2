import AppError from '../errors/AppError';
import Transaction from '../models/Transaction';
import {getRepository} from 'typeorm'
import Category from '../models/Category';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface Request{
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({title, type, value, category}:Request): Promise<Transaction> {
    const transactionsRepository = new TransactionsRepository
    const total = (await transactionsRepository.getBalance()).total
    if(value>total && type=='outcome'){
      throw new AppError('The value should not be less than total')
    }
    if(type=='income' || type=='outcome'){  
      const categoryRepository = getRepository(Category)
      const transactionRepository = getRepository(Transaction)
      const existCategory = await categoryRepository.findOne({
        where:{title:category}
      })
      if(!existCategory){
        const newCategory = categoryRepository.create({title:category})
        const categorySaved = await categoryRepository.save(newCategory)
        const transaction = transactionRepository.create({
          title,
          value,
          type,
          category: categorySaved
          //OU category_id: categorySaved.id
        });
        await transactionRepository.save(transaction);
        return transaction;
      }
      const transaction = transactionRepository.create({
        title, 
        value,
        type,
        category: existCategory
        // OU category_id: existCategory.id
      })
      await transactionRepository.save(transaction);
      return transaction;
    }else{
      throw new AppError('The transaction type should be income or outcome')
    }
  }
}

export default CreateTransactionService;
