import { BookItem } from '../models/BookItem'
import * as uuid from 'uuid'
import { CreateBookRequest } from '../requests/CreateBookRequest'
import { createLogger } from '../utils/logger'

const AWSXRay = require('aws-xray-sdk-core');
const AWS = AWSXRay.captureAWS(require('aws-sdk'));

const bucketName = process.env.BOOKS_S3_BUCKET
const logger = createLogger('auth')



export function validateBookItem(bookItem: BookItem, userId: string) {
    logger.info('validateBookItem method fired', {
        bookItem: bookItem,
        userId: userId
    })

    // Book item is not found
    if (!bookItem) {
        return {
            statusCode: 404,
            headers: {
                'Access-Control-Allow-Origin': '*'
            },
            body: ''
        }
    }

    // User is not allowed to update the book item
    if (bookItem.userId !== userId) {
        return {
            statusCode: 403,
            headers: {
                'Access-Control-Allow-Origin': '*'
            },
            body: ''
        }
    }
}


export async function createSingleBook(userId: string, createBookRequest: CreateBookRequest): Promise<BookItem> {

    logger.info('createSingleBook method fired', {
        createBookRequest: createBookRequest,
        userId: userId
    })

    // Generate a UUID for the book item
    const bookId = uuid.v4()
    const newItem: BookItem = {
        userId,
        bookId,
        // in ISO format (ISO 8601) i.e, in the form of (YYYY-MM-DDTHH:mm:ss.sssZ or ±YYYYYY-MM-DDTHH:mm:ss.sssZ)
        createdAt: new Date().toISOString(),
        //by default it will be false
        done: false,
        attachmentUrl: null,
        // Copy the rest of properties from createBookRequest to BookItem 
        ...createBookRequest
    }
    return newItem
}

export async function getBookAttachmentUrl(bookAttachmentId: string): Promise<string> {
    // Get the url that we use to update the book item
    return `https://${bucketName}.s3.amazonaws.com/${bookAttachmentId}`
}

export function getUploadUrl(bookId: string) {
    logger.info('getUploadUrl method fired to get the upload url', {
        bookId: bookId
    })

    // Get a signed url 
    const s3 = new AWS.S3({ signatureVersion: 'v4' })
    const urlExpiration = process.env.SIGNED_URL_EXPIRATION

    return s3.getSignedUrl('putObject', {
        Bucket: bucketName,
        Key: bookId,
        Expires: urlExpiration
    })
}
