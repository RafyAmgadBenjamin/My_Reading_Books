import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { BookItem } from '../../models/BookItem'
import { getUserId } from '../utils'
import { validateBookItem } from '../../BusinessLayer/books'
import { BooksRepository } from '../../dataLayer/books'
import { createLogger } from '../../utils/logger'

const logger = createLogger('auth')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const bookId = event.pathParameters.bookId
    logger.info('DeleteBook event fired', {
        event: event,
    })

    const userId = getUserId(event)
    let booksRepository = new BooksRepository()
    const result = await booksRepository.getBookItem(bookId)
    const bookItem = result.Item as BookItem
    // Validate bookItem 
    validateBookItem(bookItem, userId)
    // Delete Item from DB
    await booksRepository.deleteBookItem(bookItem.bookId)
    return {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify(bookItem.bookId)
    }
}



