import 'source-map-support/register'
import { createLogger } from '../../utils/logger'
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { getUserId } from '../utils'
import { BooksRepository } from '../../dataLayer/books'

const logger = createLogger('auth')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  // Get all Books for a current user
  logger.info('GetBook event fired', {
    event: event,
  })

  const userId = getUserId(event)
  let booksRepository = new BooksRepository()

  const result = await booksRepository.getBooksForUser(userId)

  let items = result.Items
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({ items })
  }

}
