// Module Imports
import swaggerJSDoc from 'swagger-jsdoc'

// swagger configuration export
export const swaggerConfiguration = swaggerJSDoc({
    // crash server if there are errors in writing swagger comments
    failOnErrors: true,
    // metadata about the API
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Dynamic Document Generation System API',
            summary: 'List of all the APIs for the Dynamic Document Generation System application',
            version: '1.0.0',
            description: 'Inject the dynamic data into the document template and generate the final document',
        },
        servers: [
            {
                url: `http://localhost:${process.env.PORT}`,
                description: 'Local Server'
            }
        ]
    },
    // files to be included in the swagger documentation
    apis: ['./routes/*.js']
})