const swaggerJsdoc = require('swagger-jsdoc');
const { TASK_STATUSES, TASK_PRIORITIES } = require('../constants/task');

const swaggerDefinition = {
  openapi: '3.0.3',
  info: {
    title: 'Personal Task & Habit Manager API',
    version: '1.0.0',
    description: 'RESTful API for managing tasks and categories with search, filtering, and status tracking.'
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Local development server'
    }
  ],
  components: {
    schemas: {
      Category: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '663d3f5e9b5e3d0012345678' },
          name: { type: 'string', example: 'Study' },
          description: { type: 'string', example: 'Tasks related to learning and revision' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      },
      Task: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '663d3f5e9b5e3d0012345679' },
          title: { type: 'string', example: 'Read chapter 3' },
          description: { type: 'string', example: 'Focus on concept summaries' },
          status: { type: 'string', enum: TASK_STATUSES },
          priority: { type: 'string', enum: TASK_PRIORITIES },
          categoryId: { oneOf: [{ $ref: '#/components/schemas/Category' }, { type: 'null' }] },
          dueDate: { type: ['string', 'null'], format: 'date-time' },
          completedAt: { type: ['string', 'null'], format: 'date-time' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      },
      TaskInput: {
        type: 'object',
        required: ['title'],
        properties: {
          title: { type: 'string', example: 'Prepare lesson outline' },
          description: { type: 'string', example: 'Summarize the main points' },
          status: { type: 'string', enum: TASK_STATUSES, example: 'todo' },
          priority: { type: 'string', enum: TASK_PRIORITIES, example: 'medium' },
          categoryId: { type: 'string', nullable: true, example: '663d3f5e9b5e3d0012345678' },
          dueDate: { type: 'string', format: 'date-time', nullable: true }
        }
      },
      CategoryInput: {
        type: 'object',
        required: ['name'],
        properties: {
          name: { type: 'string', example: 'Study' },
          description: { type: 'string', example: 'Learning-related work' }
        }
      },
      Pagination: {
        type: 'object',
        properties: {
          page: { type: 'integer', example: 1 },
          limit: { type: 'integer', example: 10 },
          total: { type: 'integer', example: 24 },
          pages: { type: 'integer', example: 3 }
        }
      },
      TaskListResponse: {
        type: 'object',
        properties: {
          tasks: {
            type: 'array',
            items: { $ref: '#/components/schemas/Task' }
          },
          pagination: { $ref: '#/components/schemas/Pagination' },
          filters: {
            type: 'object',
            properties: {
              search: { type: 'string' },
              status: { type: 'string' },
              priority: { type: 'string' },
              categoryId: { type: 'string' }
            }
          }
        }
      },
      StatsResponse: {
        type: 'object',
        properties: {
          total: { type: 'integer' },
          todo: { type: 'integer' },
          inProgress: { type: 'integer' },
          done: { type: 'integer' },
          overdue: { type: 'integer' },
          categories: { type: 'integer' }
        }
      },
      ApiResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          data: {},
          message: { type: 'string' },
          details: {
            type: 'array',
            items: { type: 'string' }
          }
        }
      }
    }
  },
  paths: {
    '/api/health': {
      get: {
        summary: 'Health check',
        responses: {
          200: {
            description: 'Service is healthy'
          }
        }
      }
    },
    '/api/tasks': {
      get: {
        summary: 'List tasks',
        parameters: [
          { in: 'query', name: 'search', schema: { type: 'string' } },
          { in: 'query', name: 'status', schema: { type: 'string', enum: TASK_STATUSES } },
          { in: 'query', name: 'priority', schema: { type: 'string', enum: TASK_PRIORITIES } },
          { in: 'query', name: 'categoryId', schema: { type: 'string' } },
          { in: 'query', name: 'page', schema: { type: 'integer', default: 1 } },
          { in: 'query', name: 'limit', schema: { type: 'integer', default: 10 } },
          { in: 'query', name: 'sortBy', schema: { type: 'string', default: 'createdAt' } },
          { in: 'query', name: 'sortOrder', schema: { type: 'string', enum: ['asc', 'desc'], default: 'desc' } }
        ],
        responses: {
          200: {
            description: 'Task list',
            content: {
              'application/json': {
                schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/TaskListResponse' } } }
              }
            }
          }
        }
      },
      post: {
        summary: 'Create task',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/TaskInput' }
            }
          }
        },
        responses: {
          201: {
            description: 'Task created'
          },
          422: {
            description: 'Validation failed'
          }
        }
      }
    },
    '/api/tasks/stats': {
      get: {
        summary: 'Dashboard statistics',
        responses: {
          200: {
            description: 'Task statistics',
            content: {
              'application/json': {
                schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/StatsResponse' } } }
              }
            }
          }
        }
      }
    },
    '/api/tasks/{id}': {
      get: {
        summary: 'Get task by id',
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Task found' }, 404: { description: 'Task not found' } }
      },
      patch: {
        summary: 'Update task',
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/TaskInput' } } }
        },
        responses: { 200: { description: 'Task updated' }, 422: { description: 'Validation failed' } }
      },
      delete: {
        summary: 'Delete task',
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        responses: { 204: { description: 'Task deleted' } }
      }
    },
    '/api/categories': {
      get: {
        summary: 'List categories',
        parameters: [{ in: 'query', name: 'search', schema: { type: 'string' } }],
        responses: { 200: { description: 'Category list' } }
      },
      post: {
        summary: 'Create category',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/CategoryInput' } } }
        },
        responses: { 201: { description: 'Category created' }, 422: { description: 'Validation failed' } }
      }
    },
    '/api/categories/{id}': {
      get: {
        summary: 'Get category by id',
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Category found' }, 404: { description: 'Category not found' } }
      },
      patch: {
        summary: 'Update category',
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/CategoryInput' } } }
        },
        responses: { 200: { description: 'Category updated' }, 422: { description: 'Validation failed' } }
      },
      delete: {
        summary: 'Delete category',
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        responses: { 204: { description: 'Category deleted' }, 409: { description: 'Category in use' } }
      }
    }
  }
};

const swaggerSpec = swaggerJsdoc({
  definition: swaggerDefinition,
  apis: []
});

module.exports = {
  swaggerSpec
};
