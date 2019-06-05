# **@sugo/body-parser-form-data-multipart**

Middleware for parsing form-data, www-form-urlencoded or multipart type requests

## **How to install**

```shell
npm install --save @sugo/body-parser-form-data-multipart
```

## **SuGoFormDataMultipartBodyParser**

- **getMiddleware(options):** Builds the middleware. Receives [formidable form options](https://github.com/felixge/node-formidable)

## **Example - Node Http Server**

```typescript
import { getMiddleware, IRequest } from '@sugo/body-parser-form-data-multipart';
const parseBody = getMiddleware();
const server = http.createServer(async (req: IRequest, res: http.ServerResponse) => {
  await parseBody(req, res);
  res.writeHead(200, headers);
  res.end(JSON.stringify(req.body));
});
```

## **Example - SuGo Server**

```typescript
import { createServer, SuGoRequest, SuGoResponse } from '@sugo/server';
import { getMiddleware, IRequest } from '@sugo/body-parser-form-data-multipart';
const server = createServer((req: SuGoRequest, res: SuGoResponse) => {
  res.writeHead(200, headers);
  res.end(JSON.stringify(req.body ? req.body : {}));
}).useMiddleware(getMiddleware());
```

## Obtaining files

The uploaded files will be in the **req.files** property and the form data in the **req.fields** property.
