import { Fields, Files, IncomingForm } from 'formidable';
import { IncomingMessage, ServerResponse } from 'http';

export interface IRequest extends IncomingMessage {
  fields?: Fields;
  files?: Files;
}

export interface IFormidableOptions {
  encoding?: string;
  uploadDir?: string;
  keepExtensions?: boolean;
  maxFieldsSize?: number;
  maxFileSize?: number;
  maxFields?: number;
  hash?: boolean;
  multiples?: boolean;
}

export const getMiddleware = (options?: any) => new SuGoFormDataMultipartBodyParser(options).asMiddleware();

export class SuGoFormDataMultipartBodyParser {
  public form: IncomingForm = new IncomingForm();

  constructor(options: IFormidableOptions = {}) {
    this.form.encoding = options.encoding || this.form.encoding;
    this.form.uploadDir = options.uploadDir || this.form.uploadDir;
    this.form.keepExtensions = options.keepExtensions || this.form.keepExtensions;
    this.form.maxFieldsSize = options.maxFieldsSize || this.form.maxFieldsSize;
    this.form.maxFileSize = options.maxFileSize || this.form.maxFileSize;
    this.form.maxFields = options.maxFields || this.form.maxFields;
    this.form.hash = options.hash || this.form.hash;
    this.form.multiples = options.multiples || this.form.multiples;
  }

  public asMiddleware() {
    const form = this.form;
    return async (req: IRequest, res: ServerResponse, next?: () => any) => {
      const contentType = req.headers['content-type'] as string;
      const isFormData: boolean =
        contentType.toLowerCase().includes('www-form-urlencoded') || contentType.includes('form-data');
      if (!isFormData) {
        return next ? await next() : null;
      }
      await new Promise((resolve, reject) => {
        form.parse(req, (error: any, fields: Fields, files: Files) => {
          if (error) {
            reject(error);
          }
          req.fields = fields;
          req.files = files;
          resolve({ fields, files });
        });
      });
      return next ? await next() : null;
    };
  }
}

export default getMiddleware;
