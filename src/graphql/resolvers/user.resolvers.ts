import userDatabase from '../../service/database/user.database';
import { GraphQLError } from 'graphql';

export default {
  Query: {
    getUser: async (_: unknown, { id }: { id: string }) => {
      try {
        const user = await userDatabase.findUserById(id);
        
        if (!user) {
          throw new GraphQLError('User not found', {
            extensions: {
              code: 'NOT_FOUND',
              http: { status: 404 },
              userId: id
            }
          });
        }

        return user;
      } catch (error: any) {
        throw new GraphQLError('Failed to fetch user', {
          extensions: {
            code: error.extensions?.code || 'DATABASE_ERROR',
            http: { 
              status: error.extensions?.http?.status || 500 
            },
            originalError: error.message,
            userId: id
          }
        });
      }
    },

    getUsers: async () => {
      try {
        const users = await userDatabase.getAllUsers({});
        
        if (!users || users.length === 0) {
          throw new GraphQLError('No users found', {
            extensions: {
              code: 'NO_CONTENT',
              http: { status: 204 }
            }
          });
        }

        return users;
      } catch (error: any) {
        throw new GraphQLError('Failed to fetch users', {
          extensions: {
            code: error.extensions?.code || 'DATABASE_ERROR',
            http: { 
              status: error.extensions?.http?.status || 500 
            },
            originalError: error.message
          }
        });
      }
    }
  }
}