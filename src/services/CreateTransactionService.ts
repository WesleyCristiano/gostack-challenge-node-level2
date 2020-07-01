import AppError from '../errors/AppError';
import Transaction from '../models/Transaction';
import {getRepository} from 'typeorm'
import Category from '../models/Category';

interface Request{
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({title, type, value, category}:Request): Promise<Transaction> {
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
          category_id: categorySaved.id});
        await transactionRepository.save(transaction);
        return transaction;
      }
      const transaction = transactionRepository.create({
        title, 
        value,
        type,
        category_id: existCategory.id
      })
      await transactionRepository.save(transaction);
      return transaction;
  }
}

export default CreateTransactionService;
