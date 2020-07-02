import { getRepository, In } from 'typeorm';
import csvParse from 'csv-parse'
import fs from 'fs'

import Category from '../models/Category';
import Transaction from '../models/Transaction';

interface TransactionCSV{
  title: string;
  type:  'income' | 'outcome';
  value: number;
  category: string;
}
interface CategoryCSV{
  title: string;
}

class ImportTransactionsService {
   async execute(path:string): Promise<Transaction[]>{
    const transactionRepository = getRepository(Transaction)
    const categoryRepository = getRepository(Category)

    const readCSV = fs.createReadStream(path)
    const parseStream = csvParse({
      from_line: 2,
      ltrim: true,
      rtrim: true
    })
    const parseCSV = readCSV.pipe(parseStream)
    
    const categories: any[]= []
    const transactions: TransactionCSV[] = []

    parseCSV.on('data', (line:string[])=>{
      console.log(line);
      const [title, type, value, category] = line.map((el)=> (
        el.trim()
        ))
      const transaction = {title, type, value:Number(value), category}
      if(!title || !type || !value) return
      transactions.push(transaction)
      categories.push(category)
    })
    await new Promise(resolve=>{
      parseCSV.on('end' ,resolve)
    })
    //verifica quais categorias (do arquivo) estão salvas no banco de dados
    const savedCategories = await categoryRepository.find({
      where: {
        title: In(categories)}
    })
    //seleciona o title destas categorias salvas
    const existedCategories = savedCategories.map(elem=>
      elem.title)  

    // filtra categorias tirando as duplicadas do arquivo 
    // filtra novamente deixando somente as que não estão no DB
    //essas serao criadas
    const newCategories = categories.filter((elem, index, array)=>
                array.indexOf(elem) == index)
                .filter(category=> !existedCategories.includes(category))
                .map(title=>{
                  return {title}
                })

    const categorias = categoryRepository.create(newCategories)
    await categoryRepository.save(categorias)

    const allCategories = [...savedCategories, ...categorias]
    const newTransactions = transactionRepository.create(
            transactions.map(transaction=>(
              {
                title: transaction.title,
                value: transaction.value,
                type: transaction.type,
                category: allCategories.find(elem=> elem.title ==transaction.category)
              })))
    await transactionRepository.save(newTransactions)
    await fs.promises.unlink(path)
    return newTransactions
    

  }
}

export default ImportTransactionsService;
