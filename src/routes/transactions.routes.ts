import { Router } from 'express';

 import TransactionsRepository from '../repositories/TransactionsRepository';
 import CreateTransactionService from '../services/CreateTransactionService';

import DeleteTransactionService from '../services/DeleteTransactionService';
// import ImportTransactionsService from '../services/ImportTransactionsService';

const transactionsRouter = Router();

transactionsRouter.get('/', async (request, response) => {

    const transactionRepoitory = new TransactionsRepository()
    const balance =  await transactionRepoitory.getBalance()
    const transactions = await transactionRepoitory.all()
    const statement = {transactions: transactions, balance: balance}
    return response.json(statement)
 });

transactionsRouter.post('/', async (request, response) => {

  const {title, value, type, category} = request.body
  const valueNumber = Number(value)
  const createTransactionService = new CreateTransactionService()
  const transaction = await createTransactionService.execute({
    title,
    value: valueNumber,
    type,
    category,
  })
  console.log(transaction);
  return response.json(transaction)
});

transactionsRouter.delete('/:id', async (request, response) => {
    try{
      const {id} = request.params
      const deleteService = new DeleteTransactionService()
      await deleteService.execute(id)
    }catch(err){
      return response.status(err.statusCode).json({error: err.message})
    }
    return response.status(204).send()
});


import multer from 'multer';
import fileConfig from '../config/fileConfig'
import ImportTransactionsService from '../services/ImportTransactionsService';
const upload = multer(fileConfig)

transactionsRouter.post('/import', upload.single('arquivo'), async (request, response) => {
    const importService = new ImportTransactionsService()
    const retorno = await importService.execute(request.file.path)
    return response.json(retorno)
});

export default transactionsRouter;
