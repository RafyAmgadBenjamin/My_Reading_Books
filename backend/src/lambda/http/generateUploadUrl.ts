import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { BooksRepository } from '../../dataLayer/books'
import { BookItem } from '../../models/BookItem'
import { createLogger } from '../../utils/logger'
import { getUserId } from '../utils'
import { validateBookItem, getBookAttachmentUrl, getUploadUrl } from '../../BusinessLayer/books'

const logger = createLogger('auth')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const bookId = event.pathParameters.bookId
    const userId = getUserId(event)

    logger.info('GenerateUploadUrl event fired', {
        event: event,
        bookId: bookId
    })

    //  Return a presigned URL to upload a file for a Book item with the provided id
    const uploadUrl = getUploadUrl(bookId)

    //  make it work from repository
    let booksRepository = new BooksRepository()


    // Get the book to update it
    const result = await booksRepository.getBookItem(bookId)
    const book = result.Item as BookItem

    // Validate bookItem 
    validateBookItem(book, userId)

    // Create the attachment url
    const attachmentUrl = await getBookAttachmentUrl(bookId)

    // Update the book with url 
    await booksRepository.updateBookAttachmentUrl(bookId, attachmentUrl)

    return {
        statusCode: 201,
        headers: {
            'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
            uploadUrl
        })
    }

}


