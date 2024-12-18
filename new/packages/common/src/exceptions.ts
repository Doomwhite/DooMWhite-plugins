import * as NE from 'node-exceptions';

export class NullException extends NE.LogicalException {}
export class ArgumentNullException extends NE.LogicalException {}
export class InvalidOperationException extends NE.LogicalException {}
export class InvalidTypeException extends NE.LogicalException {}

// HTTP Exceptions
export class BadRequestError extends NE.LogicalException {}
export class UnauthorizedError extends NE.LogicalException {}
export class ForbiddenError extends NE.LogicalException {}
export class NotFoundError extends NE.LogicalException {}
export class MethodNotAllowedError extends NE.LogicalException {}
export class ConflictError extends NE.LogicalException {}
export class InternalServerError extends NE.LogicalException {}
export class GatewayTimeoutError extends NE.LogicalException {}
export class NotImplementedError extends NE.LogicalException {}
export class TooManyRequestsError extends NE.LogicalException {}

// File and I/O Exceptions
export class FileNotFoundError extends NE.LogicalException {}
export class FileReadError extends NE.LogicalException {}
export class FileWriteError extends NE.LogicalException {}
export class DirectoryNotFoundError extends NE.LogicalException {}
export class PermissionDeniedError extends NE.LogicalException {}

export function createError(name: string, defaultMessage: string, statusCode = 500) {
  return class extends NE.LogicalException {
    constructor(message = defaultMessage) {
      super(message);
      this.name = name;
      this.status = statusCode;
    }
  };
}