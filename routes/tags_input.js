// Module Imports
import express from 'express';
import { Tags } from '../models/tags.js';
import Joi from 'joi';
import moment from 'moment';
import { fileUpload } from '../config/multerConfiguration.js';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import fs from 'fs';
import libre from 'libreoffice-convert';
import { promisify } from 'util';

// Router initialization
export const tagsInputRouter = express.Router();

// promisify the libreoffice-convert
// const convertAsync = promisify(libre.convert);
const convertAsync = (document, format, filter) =>
    new Promise((resolve, reject) => {
      libre.convert(document, format, filter, (err, done) => {
        if (err) return reject(err);
        resolve(done);
      });
    });

/**
 * @swagger
 * tags:
 *   name: Tags Addition and Updation
 *   description: API endpoints for adding and updating tags
 * /addTags:
 *   post:
 *     tags: [Tags Addition and Updation]
 *     summary: Add a new tag or update an existing tag
 *     description: Adds a new tag to the database or updates an existing tag
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tag_name:
 *                 type: string
 *                 description: The name of the tag
 *               tag_code:
 *                 type: string
 *                 description: The code of the tag
 *     responses:
 *       200:
 *         description: Tags added/updated successfully
 *       400:
 *         description: Invalid Credentials
 *       500:
 *         description: Error while adding/updating tags
 */
// to add tags
tagsInputRouter.post('/addTags', async (request, response) => {
    const result = {
        success: false,
        error: true,
        message: 'Unable to add tags'
    }
    try {
        console.log('Entered addTags')
        // Extracting body from request
        const body = request.body;

        // Joi validation
        const joiValidation = Joi.object({
            tag_name: Joi.string().required(),
            tag_code: Joi.string().regex(/^[a-zA-Z0-9_]+$/).required(),
        })

        // validating body
        const { error } = joiValidation.validate(body);
        if (error) {
            console.log(error, 'Joi validation failed')
            result.message = 'Invalid Credentials'
            return response.send(result)
        }

        body.created_on = moment().format('YYYY-MM-DD')
        body.tag_value = null

        if (process.env.PREFERRED_DB === 'mysql') {
            await Tags.query().upsertGraph(body)
        } else if (process.env.PREFERRED_DB === 'mongodb'){
            await request.mongoDB.collection(Tags.tableName).insertOne(body)
        }
        result.success = true
        result.message = 'Tags added/updated successfully'
        result.error = false
    } catch (error) {
        console.error(error, 'Error while adding/updating tags')
    }
    return response.send(result)
});

/**
 * @swagger
 * tags:
 *   name: Fetching Tag Codes and Values
 *   description: API endpoints for fetching tag codes and values
 * /fetchTags:
 *   get:
 *     tags: [Fetching Tag Codes and Values]
 *     summary: Get all the tag codes and values
 *     description: Gets all the tag codes and values from the database
 *     responses:
 *       200:
 *         description: Tag codes and values fetched successfully
 *       400:
 *         description: Invalid Credentials
 *       500:
 *         description: Error while fetching tag codes and values
 * */
// to get all the tags
tagsInputRouter.get('/fetchTags', async (request, response) => {
    const result = {
        success: false,
        error: true,
        message: 'Unable to get tags',
        data: []
    }
    try {
        console.log('Entered fetchTags')

        let tags = []
        // fetching tags
        if (process.env.PREFERRED_DB === 'mysql') {
            await Tags.query()
                .select('id', 'tag_name', 'tag_code', 'created_on', 'tag_value')
                .then((resp) => {
                    tags = resp
                })
        } else if (process.env.PREFERRED_DB === 'mongodb'){
            tags = await request.mongoDB.collection(Tags.tableName).find({}).toArray()
        }
        result.success = true
        result.message = 'Tags fetched successfully'
        result.error = false
        result.data = tags
    } catch (error) {
        console.error(error, 'Error while getting tags')
    }
    return response.send(result)
})

/**
 * @swagger
 * tags:
 *   name: Adding Tag Values
 *   description: API endpoints for adding tag values
 * /addTagValues:
 *   post:
 *     tags: [Adding Tag Values]
 *     summary: Add a value to a tag
 *     description: Adds a value to a tag in the database
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: object
 *               properties:
 *                 tag_code:
 *                   type: string
 *                   description: The code of the tag
 *                 tag_value:
 *                   type: string
 *                   description: The value to be added to the tag
 *     responses:
 *       200:
 *         description: Value added to tag successfully
 *       400:
 *         description: Invalid Credentials
 *       500:
 *         description: Error while adding value to tag
 */
// to add value to the tags
tagsInputRouter.post('/addTagValues', async (request, response) => {
    const result = {
        success: false,
        error: true,
        message: 'Unable to add value to tags'
    }
    try {
        console.log('Entered addTagValues')
        // Extracting body from request
        let body = request.body;

        // Joi validation
        const joiValidation = Joi.array().items(Joi.object({  
            tag_code: Joi.string().required(),
            tag_value: Joi.string().required()
        }))

        // validating body
        const { error } = joiValidation.validate(body);
        if (error) {
            console.log(error, 'Joi validation failed')
            result.message = 'Invalid Credentials'
            return response.send(result)
        }

        // adding value to the tags
        if (process.env.PREFERRED_DB === 'mysql') {
            for (const tag of body) {
                await Tags.query().where('tag_code', tag.tag_code).update({
                    tag_value: tag.tag_value
                })
            }
        } else if (process.env.PREFERRED_DB === 'mongodb'){
            const operations = body.map((item) => ({
                updateOne: {
                    filter: { tag_code: item.tag_code },
                    update: { $set: { tag_value: item.tag_value } }
                }
            }));
            await request.mongoDB.collection(Tags.tableName).bulkWrite(operations);
        }
        result.success = true
        result.message = 'Values added to tags successfully'
        result.error = false
    } catch (error) {
        console.error(error, 'Error while adding value to tags')
    }
    return response.send(result)
})

/**
 * @swagger
 * tags:
 *   name: Document Generation
 *   description: API endpoints for generating documents
 * /replaceTagsInFile:
 *   post:
 *     tags: [Document Generation]
 *     summary: Generate a document with tags and values
 *     description: Generates a document with tags and values by reading the file and replacing the tags with values
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: The file in which tags are to be replaced
 *     responses:
 *       200:
 *         description: Tags replaced with values successfully
 *       400:
 *         description: Invalid Credentials
 *       500:
 *         description: Error while replacing tags with values
 */
// to read the file and replace tags with values
tagsInputRouter.post('/replaceTagsInFile', fileUpload.single('file'), async (request, response) => {
    const result = {
        success: false,
        error: true,
        message: 'Unable to replace tags with values'
    }
    try {
        if (!request.file) {
            result.message = 'No file uploaded'
            return response.send(result)
        }
        console.log('Entered replaceTagsInFile', request.file)

        /**
         * Step 1: .docx files are generally stored in zipped XML archives. So to manipulate the content, first we have to read the content in the file in a binary format to parse it.
         * Step 2: This binary format is then unzipped using PizZip, as it extracts zipped XML archives
         * Step 3: Creating a docxtemplater instance, which is a library that helps us to manipulate the content of the file
         * Step 4: Setting the tags, which are the placeholders for the values that we want to replace
         * Step 5: Replacing the tags with values, which are the values that we want to replace the tags with. This is done by rendering the docxtemplater instance with the tags to be replaced
         * Step 6: After rendering, the content is generated in a buffer
         * Step 7: Converting the buffer to pdfBuffer
         * Step 8: Converting the pdfBuffer to base64
         * Step 9: Creating the dataUrl for the pdf
         * Step 10: Deleting the temp file in uploads folder
         * Step 11: Setting the headers for the response
         * Step 12: Sending the file to the client
         */
        // reading the content in the file in a binary format (STEP 1)
        const fileContent = await fs.promises.readFile(request.file.path, 'binary')
        console.log('After Read File')

        // zipping the content using PizZip (STEP 2)
        const zip = new PizZip(fileContent)
        console.log('After Zip')

        // creating a docxtemplater instance (STEP 3)
        const doc = new Docxtemplater(zip, {
            paragraphLoop: true,
            linebreaks: true,
            delimiters: {
                start: '<',
                end: '>'
            }
        })
        console.log('After Docxtemplater')

        // tags to be replaced (STEP 4)
        const tagsToReplace = {}
        let tags = []
        if (process.env.PREFERRED_DB === 'mysql') {
            tags = await Tags.query().select('tag_code', 'tag_value')
        } else if (process.env.PREFERRED_DB === 'mongodb'){
            tags = await request.mongoDB
                .collection(Tags.tableName)
                .find({}, { projection: { tag_code: 1, tag_value: 1 } })
                .toArray();
        }

        tags.forEach((tag) => {
            tagsToReplace[tag.tag_code] = tag.tag_value || ''
        })
        console.log('After Tags to be replaced')

        console.log('Before Render')

        // rendering the docxtemplater instance (STEP 5)
        doc.render(tagsToReplace);
        console.log('After Render')

        // generating the buffer (STEP 6)
        const buf = doc.getZip().generate({ type: 'nodebuffer' });
        console.log('After Generating Buffer')

        // converting the buffer to pdfBuffer (STEP 7)
        const pdfBuffer = await convertAsync(buf, 'pdf', undefined);
        console.log('After Converting to PDF')

        // converting the pdfBuffer to base64 (STEP 8)
        const base64Pdf = pdfBuffer.toString('base64');
        console.log('After Converting to Base64')

        // creating the dataUrl for the pdf (STEP 9)
        const dataUrl = `data:application/pdf;base64,${base64Pdf}`;
        console.log('After Creating DataUrl')

        // deleting the temp file in uploads folder (STEP 10)
        fs.unlinkSync(request.file.path);

        // // writing the buffer to the file
        // fs.writeFileSync(path.join(process.cwd(), 'uploads', request.file.originalname), buf);

        // setting the headers for the response (STEP 11)
        response.set({
            'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'Content-Disposition': `attachment; filename=${request.file.originalname}`,
            'Content-Length': buf.length,
        });

        // sending the file to the client
        result.success = true
        result.message = 'Tags replaced with values successfully'
        result.error = false
        result.dataUrl = base64Pdf
    } catch (error) {
        if (request.file) {
            fs.unlinkSync(request.file.path);
        }
        console.error(error, 'Error while replacing tags with values')
    }
    return response.send(result)
})