import { createServer, SuGoRequest, SuGoResponse } from '@sugo/server';
import * as chai from 'chai';
import { Fields, Files } from 'formidable';
import * as http from 'http';
import * as path from 'path';
import * as supertest from 'supertest';
import { getMiddleware, IRequest } from '../BodyParserFormDataMultipart';
const parseFormDataMultipart = getMiddleware();

const PATH = '/foo';
const headers = { 'Content-Type': 'application/json' };
const HANDLER = (req: SuGoRequest, res: SuGoResponse) => {
  chai.expect(req.files).to.be.eql(undefined);
  chai.expect(req.fields).to.be.eql(undefined);
  res.writeHead(200, headers);
  res.end(JSON.stringify({ files: req.files, fields: req.fields }));
};
chai.should();

describe('SuGo Json Body Parser', () => {
  it('should not parse anything if content-type is not www-form-urlencoded or form-data', async () => {
    const server = http.createServer(async (req: IRequest, res: http.ServerResponse) => {
      await parseFormDataMultipart(req, res);
      res.writeHead(200, headers);
      chai.expect(req.files).to.be.eql(undefined);
      chai.expect(req.fields).to.be.eql(undefined);
      res.end(JSON.stringify({ files: req.files, fields: req.fields }));
    });
    const response = await supertest(server)
      .post(PATH)
      .set('Content-type', 'text/html')
      .send('foo');
    response.status.should.be.eql(200);
  });

  describe('Node Http Server', () => {
    it('should accept a file attachtment', async () => {
      const server = http.createServer(async (req: IRequest, res: http.ServerResponse) => {
        await parseFormDataMultipart(req, res);
        (req.files as Files).should.have.property('attachment');
        res.writeHead(200, headers);
        res.end(JSON.stringify({ files: req.files, fields: req.fields }));
      });
      const response = await supertest(server)
        .get(PATH)
        .attach('attachment', path.resolve(__dirname, 'server.key'));
      response.status.should.be.eql(200);
    });

    it('should accept form-data fields', async () => {
      const server = http.createServer(async (req: IRequest, res: http.ServerResponse) => {
        await parseFormDataMultipart(req, res);
        res.writeHead(200, headers);
        req.should.have.property('fields');
        (req.fields as Fields).api_key.should.be.eql('hello world');
        res.end(JSON.stringify({ files: req.files, fields: req.fields }));
      });
      const response = await supertest(server)
        .post(PATH)
        .field('api_key', 'hello world');
      response.status.should.be.eql(200);
    });

    it('should accept form-data fields and file', async () => {
      const server = http.createServer(async (req: IRequest, res: http.ServerResponse) => {
        await parseFormDataMultipart(req, res);
        res.writeHead(200, headers);
        req.should.have.property('fields');
        (req.fields as Fields).api_key.should.be.eql('hello world');
        (req.files as Files).should.have.property('attachment');
        res.writeHead(200, headers);
        res.end(JSON.stringify({ files: req.files, fields: req.fields }));
      });
      const response = await supertest(server)
        .post(PATH)
        .field('api_key', 'hello world')
        .attach('attachment', path.resolve(__dirname, 'server.cert'));
      response.status.should.be.eql(200);
    });
  });

  it('should be compatible with NodeJS http server', async () => {
    const server = http.createServer(async (req: IRequest, res: http.ServerResponse) => {
      await parseFormDataMultipart(req, res);
      req.should.have.property('fields');
      req.should.have.property('fields');
      res.writeHead(200, headers);
      res.end();
    });
    const response = await supertest(server)
      .post(PATH)
      .set('Content-type', 'application/json')
      .send({ foo: 'fighters' });
    response.status.should.be.eql(200);
  });

  it('should be compatible with SuGO Server', async () => {
    const server = createServer(HANDLER).useMiddleware(parseFormDataMultipart);
    const response = await supertest(server)
      .post(PATH)
      .set('Content-type', 'application/json')
      .send({ foo: 'fighters' });
    response.status.should.be.eql(200);
  });

  after(() => {
    process.exit(0);
  });
});
