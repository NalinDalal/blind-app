// scripts/generate-openapi.ts

import * as fs from "node:fs";
import * as path from "node:path";
import yaml from "js-yaml";
import { createDocument, type SchemaResult } from "zod-openapi";
import * as schemas from "../lib/schema";

// Build OpenAPI components from exported schemas.
// Supports both Zod types and results of createSchema (which include a 'schema' property).
const components: Record<string, SchemaResult["schema"]> = {};
for (const [name, value] of Object.entries(schemas)) {
  if (!name.endsWith("Schema")) continue;

  const compName = name.replace("Schema", "");
  const maybeCreated = value as { schema?: SchemaResult["schema"] };

  if (
    maybeCreated &&
    typeof maybeCreated === "object" &&
    "schema" in maybeCreated &&
    maybeCreated.schema
  ) {
    // Already the result of createSchema
    components[compName] = maybeCreated.schema;
  }
}

const openApiDoc = createDocument({
  openapi: "3.0.0",
  info: {
    title: "Blind App API",
    version: "1.0.0",
    description: "Auto-generated OpenAPI spec from Zod schemas.",
  },
  servers: [{ url: "https://your-domain.com/api" }],
  paths: {}, // TODO: Add endpoint definitions here if desired
  components: {
    schemas: components,
  },
});

// Write JSON and YAML outputs
const outJsonPath = path.join(__dirname, "../docs/OPENAPI.json");
fs.writeFileSync(outJsonPath, JSON.stringify(openApiDoc, null, 2));

const outYamlPath = path.join(__dirname, "../docs/OPENAPI.yaml");
fs.writeFileSync(outYamlPath, yaml.dump(openApiDoc));

console.log("OpenAPI spec generated at", outJsonPath, "and", outYamlPath);
