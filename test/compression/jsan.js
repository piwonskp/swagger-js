import assert from 'assert';
import nock from 'nock';
import yaml from 'js-yaml';
import fs from 'fs';

import Swagger from '../../src';
import toJSAN from '../../src/execute/compression/serializer';


const spec = yaml.safeLoad(fs.readFileSync('test/compression/testAPI.yaml', 'utf-8'));

export const host = 'http://localhost';
var testApi = Swagger({spec}).then(client => {client.url = host; return client;});

const testObj = spec.components.schemas.Measure.example;
const testJSANObj = ["2011-10-05T14:48:00.000Z", 0];

describe('Deserialization', () => {
    it('Should deserialize to domain specific object', async () => {
        const expectedResult = [testObj];
        const url = '/api/v1/measure/list';

        nock(host).get(url).reply(200, JSON.stringify([testJSANObj]), {
            'Content-Type': 'application/jsan'
        });

        var run = (await testApi).apis.default.gurukosu_handlers_v1_measure_list;
        var result = await run();

        assert.deepEqual(result.body, expectedResult);
    });
});

describe('Serialization', () => {
    it('Should serialize to JSAN', async () => {
        const expectedRequestBody = testJSANObj;
        const url = '/api/v1/measure/add';

        nock(host).post(url, expectedRequestBody)
            .reply(200, testJSANObj, {'Content-Type': 'application/jsan'});

        var run = (await testApi).apis.default.gurukosu_handlers_v1_measure_add;
        var result = await run(null, {requestBody: testObj});
    });
});

describe('ToJSAN', () => {
    it('Should serialize to list of values from object', () =>
       assert.deepEqual(toJSAN({b: 2, a: [{d: 1, c: 5}]}), [[[5, 1]], 2])
      ),
    it('Should serialize to list of values from list of objects', () =>
       assert.deepEqual(toJSAN([{b: 2, a: 4}, {a: 0, b:8}]), [[4, 2], [0, 8]])
      ),
    it('Should serialize to primitive type', () =>
       assert.deepEqual(toJSAN("sss"), "sss")
      );
});
