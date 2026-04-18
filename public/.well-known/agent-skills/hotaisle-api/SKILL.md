---
name: hotaisle-api
description: Use this skill when interacting with the Hot Aisle API, authenticating requests, or locating the OpenAPI spec and human-readable API documentation.
---

# Hot Aisle API

Use this skill when you need to work with the Hot Aisle API.

## When to use this skill

- The user wants to inspect or call the Hot Aisle API.
- The user asks how to authenticate API requests.
- The user needs the OpenAPI document or human-readable API docs.
- The user wants examples for common API request setup.

## API discovery

- API anchor: `https://admin.hotaisle.app/api/`
- OpenAPI spec: `https://admin.hotaisle.app/api/docs/swagger.json`
- API docs: `https://admin.hotaisle.app/api/docs/`
- API catalog: `https://hotaisle.xyz/.well-known/api-catalog`

## Authentication

The published API documentation declares header-based API token authentication, not OAuth or OpenID Connect.

Send the token in the `Authorization` header using this format:

```http
Authorization: Token <your-api-token>
```

## Working rules

- Prefer the published OpenAPI spec when answering endpoint or schema questions.
- Do not assume OAuth, OIDC, or unauthenticated access.
- If a request needs credentials and the user has not provided them, explain the required `Authorization: Token <token>` header.
- Prefer documented endpoints from the OpenAPI spec over guessed URLs.

## Example request

```bash
curl https://admin.hotaisle.app/api/user/ \
  -H 'Authorization: Token <your-api-token>'
```
