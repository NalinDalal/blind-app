/**
 * @fileoverview OpenAPI specification export.
 * Re-exports the OpenAPI 3.0 specification from the docs directory.
 * @module lib/openapiSpec
 */
import openApiSpec from "../docs/OPENAPI.json";

/**
 * OpenAPI 3.0 specification for the Blind App API.
 * Contains complete API documentation including endpoints, schemas, and authentication.
 *
 * @constant {Object} openApiSpec
 * @property {string} openapi - OpenAPI specification version
 * @property {Object} info - API metadata (title, version, description)
 * @property {Object} paths - API endpoint definitions
 * @property {Object} components - Reusable schemas, parameters, and responses
 *
 * @example
 * import { openApiSpec } from "@/lib/openapiSpec";
 *
 * console.log(openApiSpec.info.title); // "Blind App API"
 * console.log(Object.keys(openApiSpec.paths)); // ["/api/login", "/api/register", ...]
 */
export { openApiSpec };
