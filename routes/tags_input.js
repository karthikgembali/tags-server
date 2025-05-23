// Module Imports
import express from 'express';
import { Tags } from '../models/tags.js';
import Joi from 'joi';
import moment from 'moment';
import { fileUpload } from '../multerConfiguration.js';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import fs from 'fs';
import path from 'path';

// Router initialization
export const tagsInputRouter = express.Router();

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
        await Tags.query().upsertGraph(body).then(() => {
            result.success = true
            result.message = 'Tags added/updated successfully'
            result.error = false
        })
    } catch (error) {
        console.error(error, 'Error while adding/updating tags')
    }
    return response.send(result)
});

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
        await Tags.query()
        .select('id', 'tag_name', 'tag_code', 'created_on', 'tag_value')
        .then((tags) => {
            result.success = true
            result.message = 'Tags fetched successfully'
            result.error = false
            result.data = tags
        })
    } catch (error) {
        console.error(error, 'Error while getting tags')
    }
    return response.send(result)
})

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
        const body = request.body;

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
        for (const tag of body) {
            await Tags.query().where('tag_code', tag.tag_code).update({
                tag_value: tag.tag_value
            })
        }
        result.success = true
        result.message = 'Values added to tags successfully'
        result.error = false
    } catch (error) {
        console.error(error, 'Error while adding value to tags')
    }
    return response.send(result)
})

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
         * Step 5: Replacing the tags with values, which are the values that we want to replace the tags with. This is done by setting the data in the docxtemplater instance
         * Step 6: Rendering the docxtemplater instance
         * Step 7: After rendering, the content is generated in a buffer
         */
        // reading the content in the file in a binary format (STEP 1)
        const fileContent = fs.readFileSync(request.file.path, 'binary')

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
        await Tags.query().select('tag_code', 'tag_value').then((tags) => {
            tags.forEach((tag) => {
                tagsToReplace[tag.tag_code] = tag.tag_value || ''
            })
        })

        console.log('After Tags to be replaced', tagsToReplace)
        // replacing the tags with values (STEP 5)
        doc.setData(tagsToReplace)

        console.log('Before Render')
        // rendering the docxtemplater instance (STEP 6)
        doc.render();
        console.log('After Render')
        // generating the buffer (STEP 7)
        const buf = doc.getZip().generate({ type: 'nodebuffer' });

        // deleting the temp file in uploads folder
        fs.unlinkSync(request.file.path);

        // writing the buffer to the file
        fs.writeFileSync(path.join(process.cwd(), 'uploads', request.file.originalname), buf);

        // setting the headers for the response
        response.set({
            'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'Content-Disposition': `attachment; filename=${request.file.originalname}`,
            'Content-Length': buf.length,
        });

        // sending the file to the client
        result.success = true
        result.message = 'Tags replaced with values successfully'
        result.error = false
        result.buffer = buf
    } catch (error) {
        console.error(error, 'Error while replacing tags with values')
    }
    return response.send(result)
})