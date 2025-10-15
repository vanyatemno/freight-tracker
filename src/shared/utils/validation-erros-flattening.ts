import { ValidationError } from '@nestjs/common';

export function flattenValidationErrors(
  errors: ValidationError[],
  parentPath = '',
) {
  const errorsMap: Record<string, string[]> = {};
  for (const error of errors) {
    const key = parentPath ? `${parentPath}.${error.property}` : error.property;
    if (error.constraints) {
      errorsMap[key] = Object.values(error.constraints);
    }

    if (error.children && error.children.length) {
      this.flattenValidationErrors(error.children, key, error);
    }
  }

  return errorsMap;
}
