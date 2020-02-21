import assert from 'assert';
import nock from 'nock';
import yaml from 'js-yaml';
import fs from 'fs';

import Swagger from '../../src';
import {host} from './jsan.js';

const spec = yaml.safeLoad(fs.readFileSync('test/compression/compressionTest.yaml', 'utf-8'));


describe('Compression', () => {
    it('Should compress and decompress irrespective of content type', async () => {
        var compressableAPI = Swagger({spec, encodings: {
            testEncoding: {compress: body => "3a", decompress: body => "aaa"}}})
            .then(client => {client.url = host; return client;});

        const url = '/api/v1/compress/anything';

        nock(host).post(url, '3a').reply(200, '3a',
                                         {'Content-encoding': 'testEncoding'});

        var run = (await compressableAPI).apis.default.compress_anything;
        var result = await run({'Content-Encoding': 'testEncoding'},
                               {requestBody: 'aaa'});
        assert(result.body == 'aaa');
    });
});
