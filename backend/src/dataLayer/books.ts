
import { BookItem } from '../models/BookItem'
import { BookUpdate } from '../models/BookUpdate'
import { createLogger } from '../utils/logger'



const logger = createLogger('auth')
const AWSXRay = require('aws-xray-sdk-core');
const AWS = AWSXRay.captureAWS(require('aws-sdk'));
const docClient = new AWS.DynamoDB.DocumentClient()

const bookUserIndex = process.env.BOOKS_USER_INDEX
const booksTable = process.env.BOOKS_TABLE


export class BooksRepository {

    async getBookItem(bookId: String) {

        logger.info('getBookItem method fired to get a book item', {
            bookId: bookId,
        })

        return await docClient.get({
            TableName: booksTable,
            Key: {
                bookId
            }
        }).promise()
    }

    async getBooksForUser(userId: String) {

        logger.info('getBooksForUser method fired to get all the user books', {
            userId: userId,
        })

        return docClient.query({
            TableName: booksTable,
            IndexName: bookUserIndex,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            }
        }).promise()
    }

    async addBookItem(bookItem: BookItem) {
        logger.info('addBookItem method fired to add a new book item', {
            bookItem: bookItem,
        })
        await docClient.put({
            TableName: booksTable,
            Item: bookItem
        }).promise()
    }

    async deleteBookItem(bookId: String) {
        logger.info('deleteBookItem method fired to delete a book item', {
            bookItem: bookId,
        })
        await docClient.delete({
            TableName: booksTable,
            Key: {
                bookId
            }
        }).promise()
    }

    async updateBookItem(BookUpdated: BookUpdate, bookId: String) {
        await docClient.update({
            TableName: booksTable,
            Key: {
                bookId
            },
            UpdateExpression: 'set #name = :name, dueDate = :dueDate, done = :done',
            ExpressionAttributeNames: {
                "#name": "name"
            },
            ExpressionAttributeValues: {
                ":name": BookUpdated.name,
                ":dueDate": BookUpdated.dueDate,
                ":done": BookUpdated.done
            }

        }).promise()
    }
    async updateBookAttachmentUrl(bookId: string, attachmentUrl: string) {
        // update the book item with the attachment url 
        await docClient.update({
            TableName: booksTable,
            Key: {
                bookId
            },
            UpdateExpression: 'set attachmentUrl = :attachmentUrl',
            ExpressionAttributeValues: {
                ':attachmentUrl': attachmentUrl
            }
        }).promise()
    }

}

