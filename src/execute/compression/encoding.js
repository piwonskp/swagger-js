import _ from 'lodash';

const getEncoding = headers =>
      _.castArray(new Headers(headers).get('content-encoding') || []);

export const encode = (encodings, headers) =>
    _.flow(getEncoding(headers).map(name => encodings[name].compress));

export const decode = (encoding, headers) =>
    _.flowRight(getEncoding(headers).map(name => encoding[name].decompress));
