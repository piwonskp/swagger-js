import Swagger from '../../index.js';
import {getOperationRaw} from '../../helpers.js';
import fromJSAN from './deserializer.js';
import toJSAN from './serializer.js';
import {encode, decode} from './encoding.js';


const JSAN_TYPE = 'application/jsan';

const notNullAndJSAN = ctype => ctype != null && ctype.indexOf(JSAN_TYPE) !== -1;
const isJSAN = headers => notNullAndJSAN(new Headers(headers).get("content-type"));

export const compress = (encodings, request) => {
    var [headers, body] = [request.headers, request.body];
    if (isJSAN(headers)){
        body = toJSAN(body);
    }

    body = encode(encodings, headers)(body);
    return body;
};

const getOperation = (spec, operId) => getOperationRaw(spec, operId).operation;
const getSchema = (spec, operId, status) =>
      getOperation(spec, operId).responses[status].content[JSAN_TYPE].schema;

const fromJSANResp = (spec, operationId, resp) =>
      fromJSAN(getSchema(spec, operationId, resp.status), JSON.parse(resp.body));

export const decompress = async (encoding, spec, operationId, resp) => {
    resp = await resp;

    // Either blob(browser) or buffer(nodejs)
    var getText = resp.text.text || resp.text.toString;
    resp.body = await getText.call(resp.text);
    resp.body = decode(encoding, resp.headers)(resp.body);

    if (isJSAN(resp.headers)){
        resp.body = fromJSANResp(spec, operationId, resp);
    }
    return resp;
};
