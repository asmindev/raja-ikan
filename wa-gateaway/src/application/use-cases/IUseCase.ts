/**
 * Base Use Case Interface
 *
 * Following Clean Architecture principles, use cases contain application-specific
 * business logic and orchestrate the flow of data between entities and external systems.
 */

export interface IUseCase<TRequest, TResponse> {
    execute(request: TRequest): Promise<TResponse>;
}
