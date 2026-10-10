const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const YAML = require('yaml');
const model = require('@backstage/catalog-model');
const SwaggerParser = require('@apidevtools/swagger-parser');
const { Parser } = require('@asyncapi/parser');
const root = path.resolve(__dirname, '..');
const entities = new Map();
const visited = new Set();
const validators = Object.fromEntries(['API', 'Component', 'Domain', 'Group', 'Location', 'Resource', 'System', 'User'].map(kind => [kind, model[`${kind === 'API' ? 'api' : kind.toLowerCase()}EntityV1alpha1Validator`]]));
const key = e => model.stringifyEntityRef(e);
function read(file) {
  file = path.resolve(file);
  assert(file.startsWith(root + path.sep), `Arquivo fora do repositório: ${file}`);
  if (visited.has(file)) return;
  visited.add(file);
  for (const doc of YAML.parseAllDocuments(fs.readFileSync(file, 'utf8'), { uniqueKeys: true })) {
    assert.equal(doc.errors.length, 0, `${file}: ${doc.errors}`);
    const e = doc.toJSON();
    assert(e && validators[e.kind], `Kind desconhecido em ${file}`);
    const id = key(e);
    assert(!entities.has(id), `Entidade duplicada: ${id}`);
    assert(!('relations' in e), `Relações devem ser geradas pelo catálogo: ${id}`);
    entities.set(id, e);
    if (e.kind === 'Location') {
      assert.equal(e.spec.type, 'url');
      for (const target of e.spec.targets || [e.spec.target]) {
        assert(typeof target === 'string' && target.startsWith('./'), 'Use targets locais relativos');
        read(path.resolve(path.dirname(file), target));
      }
    }
  }
}
function target(value, kinds, from) {
  const parsed = model.parseEntityRef(value, { defaultKind: kinds[0], defaultNamespace: from.metadata.namespace || 'default' });
  assert(kinds.includes(parsed.kind), `${key(from)}: kind inválido em ${value}`);
  const id = model.stringifyEntityRef(parsed);
  assert(entities.has(id), `${key(from)}: referência inexistente ${id}`);
  return entities.get(id);
}
function references(e) {
  const spec = e.spec;
  for (const [field, kinds] of Object.entries({owner:['group','user'],system:['system'],domain:['domain'],parent:['group'],children:['group'],members:['user'],memberOf:['group'],dependsOn:['component','resource'],providesApis:['api'],consumesApis:['api']})) {
    if (spec[field] !== undefined) for (const value of [].concat(spec[field])) target(value, kinds, e);
  }
  if (e.kind === 'Group') {
    for (const child of spec.children) assert.equal(target(child,['group'],e).spec.parent, key(e), `Parent inconsistente: ${child}`);
    if (spec.parent) assert(target(spec.parent,['group'],e).spec.children.includes(key(e)), `Children inconsistente: ${key(e)}`);
    for (const member of spec.members || []) assert(target(member,['user'],e).spec.memberOf.includes(key(e)), `memberOf inconsistente: ${member}`);
  }
  if (e.kind === 'User') for (const group of spec.memberOf) assert(target(group,['group'],e).spec.members.includes(key(e)), `Members inconsistente: ${group}`);
}
function acyclic(field) {
  const active = new Set(), done = new Set();
  function walk(e) {
    const id = key(e);
    assert(!active.has(id), `Ciclo em ${field}: ${id}`);
    if (done.has(id)) return;
    active.add(id);
    for (const ref of [].concat(e.spec[field] || [])) walk(entities.get(ref));
    active.delete(id); done.add(id);
  }
  for (const e of entities.values()) walk(e);
}
async function main() {
  read(path.join(root, 'catalog-info.yaml'));
  for (const e of entities.values()) {
    assert(await validators[e.kind].check(e), `Schema inválido: ${key(e)}`);
    references(e);
    if (e.kind === 'API') {
      const contract = YAML.parse(e.spec.definition);
      if (e.spec.type === 'openapi') await SwaggerParser.validate(contract);
      else if (e.spec.type === 'asyncapi') {
        const result = await new Parser().parse(e.spec.definition);
        const errors = result.diagnostics.filter(d => d.severity === 0);
        assert(result.document && !errors.length, JSON.stringify(errors));
      } else throw new Error(`Tipo de API sem validador: ${e.spec.type}`);
      assert([...entities.values()].some(c => (c.spec.providesApis || []).includes(key(e))), `API sem provedor: ${key(e)}`);
    }
  }
  acyclic('dependsOn'); acyclic('parent');
  const files = fs.readdirSync(path.join(root,'catalog'), {recursive:true}).filter(f => f.endsWith('catalog-info.yaml'));
  for (const file of files) assert(visited.has(path.join(root,'catalog',file)), `Arquivo não registrado: ${file}`);
  console.log(`OK: ${entities.size} entidades em ${visited.size} arquivos; schemas, referências, grupos, ciclos e contratos OpenAPI/AsyncAPI válidos.`);
}
main().catch(error => { console.error(error); process.exitCode = 1; });
