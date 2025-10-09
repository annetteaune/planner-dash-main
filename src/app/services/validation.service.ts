import { Injectable } from '@angular/core';
import { z, ZodError, ZodSchema } from 'zod';

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: string[];
}

@Injectable({
  providedIn: 'root',
})
export class ValidationService {
  /**
   * Validates data against a Zod schema
   * @param schema - Zod schema to validate against
   * @param data - Data to validate
   * @returns ValidationResult with success status and parsed data or errors
   */
  validate<T>(schema: ZodSchema<T>, data: unknown): ValidationResult<T> {
    try {
      const parsedData = schema.parse(data);
      return {
        success: true,
        data: parsedData,
      };
    } catch (error) {
      if (error instanceof ZodError) {
        return {
          success: false,
          errors: error.errors.map((err) => {
            const path = err.path.length > 0 ? `${err.path.join('.')}: ` : '';
            return `${path}${err.message}`;
          }),
        };
      }
      return {
        success: false,
        errors: ['Unknown validation error'],
      };
    }
  }

  /**
   * Safely parses data with a Zod schema, returning undefined if validation fails
   * @param schema - Zod schema to parse with
   * @param data - Data to parse
   * @returns Parsed data or undefined if validation fails
   */
  safeParse<T>(schema: ZodSchema<T>, data: unknown): T | undefined {
    const result = schema.safeParse(data);
    return result.success ? result.data : undefined;
  }

  /**
   * Validates and transforms data, useful for API responses
   * @param schema - Zod schema to validate against
   * @param data - Raw data from API
   * @returns Parsed and validated data
   * @throws Error if validation fails
   */
  parseApiResponse<T>(schema: ZodSchema<T>, data: unknown): T {
    const result = this.validate(schema, data);
    if (!result.success) {
      throw new Error(
        `API response validation failed: ${result.errors?.join(', ')}`
      );
    }
    return result.data!;
  }

  /**
   * Validates form data before sending to API
   * @param schema - Zod schema to validate against
   * @param formData - Form data to validate
   * @returns ValidationResult with success status and validated data or errors
   */
  validateFormData<T>(
    schema: ZodSchema<T>,
    formData: unknown
  ): ValidationResult<T> {
    return this.validate(schema, formData);
  }
}
