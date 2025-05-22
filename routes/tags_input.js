import express from 'express';
import { Tags } from '../models/tags.js';
import Joi from 'joi';
import moment from 'moment';

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