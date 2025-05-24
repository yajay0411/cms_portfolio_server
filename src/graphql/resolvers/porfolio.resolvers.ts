import portfolioDatabase from "../../service/database/portfolio.database";
import { GraphQLError } from 'graphql';
import { formatSuccessResponse } from "../../util/ResponseGQL";
import { formatErrorResponse } from "../../util/ErrorGQL";

export default {
  Query: {
    getPortfolio: async (_: unknown, { id }: { id: string }) => {
      try {
        const portfolio = await portfolioDatabase.getPortfolioDetail(id);
        if (!portfolio) {
          throw new GraphQLError('Portfolio not found', {
            extensions: {
              code: 'NOT_FOUND',
              http: { status: 404 },
              portfolioId: id
            }
          });
        }
        return formatSuccessResponse(portfolio, 'PORTFOLIO_FOUND', 200, {
          count: 1
        });
      } catch (error: any) {
        throw formatErrorResponse(
          new GraphQLError('Failed to fetch portfolio', {
            extensions: {
              code: 'DATABASE_ERROR',
              http: { status: 500 },
              originalError: error.message,
              portfolioId: id
            }
          }),
          process.env.NODE_ENV === 'development'
        );
      }
    },

    getPortfolioByEntityId: async (_: unknown, { entity_id }: { entity_id: string }) => {
      try {
        const portfolio = await portfolioDatabase.findByEntityId(entity_id);
        if (!portfolio) {
          throw new GraphQLError('Portfolio not found for this entity', {
            extensions: {
              code: 'NOT_FOUND',
              http: { status: 404 },
              entityId: entity_id
            }
          });
        }
        return formatSuccessResponse(portfolio, 'PORTFOLIO_FOUND_BY_ENTITY', 200, {
          entityId: entity_id
        });
      } catch (error: any) {
        throw formatErrorResponse(
          new GraphQLError('Failed to fetch portfolio by entity ID', {
            extensions: {
              code: 'DATABASE_ERROR',
              http: { status: 500 },
              originalError: error.message,
              entityId: entity_id
            }
          }),
          process.env.NODE_ENV === 'development'
        );
      }
    },

    getPortfolios: async () => {
      try {
        const portfolios = await portfolioDatabase.getAllPortfolios({});
        if (!portfolios || portfolios.length === 0) {
          return formatSuccessResponse([], 'NO_PORTFOLIOS_FOUND', 200, {
            count: 0
          });
        }
        return formatSuccessResponse(portfolios, 'PORTFOLIOS_FOUND', 200, {
          count: portfolios.length
        });
      } catch (error: any) {
        throw formatErrorResponse(
          new GraphQLError('Failed to fetch portfolios', {
            extensions: {
              code: 'DATABASE_ERROR',
              http: { status: 500 },
              originalError: error.message
            }
          }),
          process.env.NODE_ENV === 'development'
        );
      }
    }
  }
}