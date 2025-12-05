import config from '@/config/app.config';
import { authSwagger } from '@/router/auth.routes';
import { userSwagger } from '@/router/user.routes';

const buildSpec = () => {
  const modules = [authSwagger, userSwagger];

  return {
    openapi: '3.0.0',
    info: {
      title: 'CMS Portfolio API',
      version: '1.0.0',
      description: 'API documentation for development'
    },
    servers: [
      {
        url: config.SERVER_URL,
        description: 'Primary API Server'
      }
    ],
    tags: modules.flatMap((mod) => mod.tags ?? []),
    paths: modules.reduce((acc, mod) => ({ ...acc, ...(mod.paths ?? {}) }), {})
  };
};

export default buildSpec();
