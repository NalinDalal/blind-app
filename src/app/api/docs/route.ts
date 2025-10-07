/**
 * @fileoverview API route for serving the OpenAPI specification documentation.
 * Provides the complete API schema in JSON format for API consumers and documentation tools.
 * @module api/docs
 */
import { openApiSpec } from "../../../../lib/openapiSpec";

/**
 * GET endpoint to retrieve the OpenAPI specification.
 * Returns the complete API documentation in OpenAPI 3.0 format.
 *
 * @async
 * @function GET
 * @returns {Promise<Response>} JSON response containing the OpenAPI specification
 *
 * @example
 * // GET /api/docs
 * // Response (200)
 * // {
 * //   "openapi": "3.0.0",
 * //   "info": { ... },
 * //   "paths": { ... }
 * // }
 *
 * @see {@link ../../../../lib/openapiSpec.ts} for the specification definition
 */
export async function GET() {
  return new Response(JSON.stringify(openApiSpec, null, 2), {
    headers: { "Content-Type": "application/json" },
  });
}
