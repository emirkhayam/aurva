import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'AURVA API',
      version: '2.0.0',
      description: 'API для платформы AURVA - Ассоциация Участников Рынка Виртуальных Активов',
      contact: { name: 'AURVA', url: 'https://aurva.kg' }
    },
    servers: [
      { url: '/api', description: 'API Server' }
    ],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }
      },
      schemas: {
        News: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            title: { type: 'string' },
            slug: { type: 'string' },
            excerpt: { type: 'string' },
            content: { type: 'string' },
            category: { type: 'string', enum: ['regulation', 'events', 'analytics', 'other'] },
            imageUrl: { type: 'string', nullable: true },
            published: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Member: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            slug: { type: 'string' },
            description: { type: 'string' },
            website: { type: 'string', nullable: true },
            logoUrl: { type: 'string', nullable: true },
            isActive: { type: 'boolean' },
            displayOrder: { type: 'integer' },
            joinedDate: { type: 'string', format: 'date' }
          }
        },
        Partner: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            slug: { type: 'string' },
            website: { type: 'string', nullable: true },
            logoUrl: { type: 'string', nullable: true },
            isActive: { type: 'boolean' },
            displayOrder: { type: 'integer' }
          }
        },
        Contact: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            phone: { type: 'string' },
            status: { type: 'string', enum: ['new', 'contacted', 'processed', 'rejected'] },
            notes: { type: 'string', nullable: true }
          }
        },
        Course: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            title: { type: 'string' },
            slug: { type: 'string' },
            description: { type: 'string', nullable: true },
            image_url: { type: 'string', nullable: true },
            is_published: { type: 'boolean' },
            display_order: { type: 'integer' }
          }
        },
        CourseLesson: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            course_id: { type: 'integer' },
            title: { type: 'string' },
            content: { type: 'string', nullable: true },
            video_url: { type: 'string', nullable: true },
            is_published: { type: 'boolean' },
            display_order: { type: 'integer' }
          }
        },
        ClientProfile: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            email: { type: 'string' },
            full_name: { type: 'string' },
            phone: { type: 'string', nullable: true },
            company_name: { type: 'string', nullable: true },
            is_active: { type: 'boolean' }
          }
        },
        TeamMember: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            position: { type: 'string' },
            category: { type: 'string', enum: ['leadership', 'council', 'other'] },
            photo_url: { type: 'string', nullable: true },
            is_active: { type: 'boolean' }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: { type: 'string' }
          }
        },
        Success: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string' }
          }
        }
      }
    }
  },
  apis: ['./src/routes/*.ts']
};

export const swaggerSpec = swaggerJsdoc(options);
