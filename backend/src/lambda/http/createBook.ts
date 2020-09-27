import 'source-map-support/register'
import { BooksRepository } from '../../dataLayer/books'
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { CreateBookRequest } from '../../requests/CreateBookRequest'
import { BookItem } from '../../models/BookItem'
import { getUserId } from '../utils'
import { createSingleBook } from '../../BusinessLayer/books'
import { createLogger } from '../../utils/logger'



const logger = createLogger('auth')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const newBook: CreateBookRequest = JSON.parse(event.body)

    logger.info('CreateBook event fired', {
        event: event,
    })

    const userId = getUserId(event)
    // Create the new Book item
    let item: BookItem;
    item = await createSingleBook(userId, newBook)
    // Store the new Book
    let booksRepository = new BooksRepository()

    await booksRepository.addBookItem(item)
    return {
        statusCode: 201,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify({
            item
        })
    }
}


