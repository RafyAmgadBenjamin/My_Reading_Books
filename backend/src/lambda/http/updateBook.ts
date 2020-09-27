import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { UpdateBookRequest } from '../../requests/UpdateBookRequest'
import { BookItem } from '../../models/BookItem'
import { getUserId } from '../utils'
import { BooksRepository } from '../../dataLayer/books'
import { validateBookItem } from '../../BusinessLayer/books'
import { createLogger } from '../../utils/logger'

const logger = createLogger('auth')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('UpdateBook event fired', {
        event: event,
    })

    const bookId = event.pathParameters.bookId
    const updatedBook: UpdateBookRequest = JSON.parse(event.body)

    // Update a Book item with the provided id using values in the "updatedBook" object

    const userId = getUserId(event)
    let booksRepository = new BooksRepository()
    const result = await booksRepository.getBookItem(bookId)
    const bookItem = result.Item as BookItem

    // Validate bookItem 
    validateBookItem(bookItem, userId)

    // Update Book item in the DB
    await booksRepository.updateBookItem(updatedBook, bookId)

    return {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify(bookItem.bookId)
    }
}


