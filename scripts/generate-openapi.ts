// scripts/generate-openapi.ts
import { createDocument, createSchema } from 'zod-openapi';
import * as schemas from '../lib/schema';
import * as fs from 'fs';
import * as path from 'path';
import yaml from 'js-yaml';

// Build OpenAPI components from exported schemas.
// Supports both Zod types and results of createSchema (which include a 'schema' property).
const components: Record<string, any> = {};
for (const [name, value] of Object.entries(schemas)) {
  if (!name.endsWith('Schema')) continue;

  const compName = name.replace('Schema', '');
  const maybeCreated = value as any;

  if (maybeCreated && typeof maybeCreated === 'object' && 'schema' in maybeCreated) {
    // Already the result of createSchema
    components[compName] = maybeCreated.schema;
  } else {
    // Zod schema: wrap with createSchema
    const { schema: openapiSchema } = createSchema(maybeCreated);
    components[compName] = openapiSchema;
  }
}

const openApiDoc = createDocument({
  openapi: '3.0.0',
  info: {
    title: 'Blind App API',
    version: '1.0.0',
    description: 'Auto-generated OpenAPI spec from Zod schemas.'
  },
  servers: [
    { url: 'https://your-domain.com/api' }
  ],
  paths: {}, // TODO: Add endpoint definitions here if desired
  components: {
    schemas: components
  }
});

// Write JSON and YAML outputs
const outJsonPath = path.join(__dirname, '../docs/OPENAPI.json');
fs.writeFileSync(outJsonPath, JSON.stringify(openApiDoc, null, 2));

const outYamlPath = path.join(__dirname, '../docs/OPENAPI.yaml');
fs.writeFileSync(outYamlPath, yaml.dump(openApiDoc));

console.log('OpenAPI spec generated at', outJsonPath, 'and', outYamlPath);
