# Workshop no GitHub

Esta pasta substitui os grupos GitLab do [Platform Engineering Workshop](https://redhat-pe-workshop.github.io/showroom/modules/m2/module-02.0.html) (`rhdh/`, `global/` e `parasol/`). O Developer Hub lê estes arquivos em `github.com/raphaelmorsch/developer-hub-roadshow` e os templates publicam código aqui, com pull request no lugar do merge request do GitLab.

O catálogo de demonstração na raiz do repositório (`catalog/`) continua separado. Os usuários `pe1`, `pe2`, `dev1` e `dev2` vêm do Keycloak; não estão nestes YAMLs.

## O que registrar

Uma única Location carrega templates, domínio, sistema, TechDocs e o Parasol:

`https://github.com/raphaelmorsch/developer-hub-roadshow/blob/main/workshop/all.yaml`

| No GitLab do workshop | Aqui |
| --- | --- |
| `rhdh/developer-hub-config` | `workshop/rhdh/developer-hub-config/` |
| `rhdh/template-quarkus-simple` | `workshop/rhdh/template-quarkus-simple/template.yaml` |
| `global/global-techdocs` | `workshop/global/global-techdocs/` |
| `rhdh/rhdh-entities` | `workshop/rhdh/rhdh-entities/` |
| `rhdh/import-existing-api-template` | `workshop/rhdh/import-existing-api-template/template.yaml` |
| `rhdh/import-existing-app-template` | `workshop/rhdh/import-existing-app-template/template.yaml` |
| `rhdh/parasol-store-dev-template` | `workshop/rhdh/parasol-store-dev-template/template.yaml` |
| `rhdh/template-developer-self-service` | `workshop/rhdh/template-developer-self-service/` |
| `parasol/parasol-store` | `workshop/parasol/parasol-store/` |
| `parasol/parasol-store-api` | `workshop/parasol/parasol-store-api/` |
| `parasol/all-location-parasol` | `workshop/parasol/all-location-parasol/` |

## Templates

O Quarkus Service publica um repositório novo na conta `raphaelmorsch`. Os templates de importação e de self-service abrem um pull request neste repositório. O host padrão é `github.com`, não o GitLab do laboratório.

`parasol-store` e `parasol-store-api` já estão no catálogo. Para exercitar a importação, use outro nome de componente. O método `getProductCount()` em `CatalogResource.java` está comentado de propósito, como no laboratório.
