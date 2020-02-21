import _ from 'lodash';


function reconstructObject(schema, values){
    var prop = schema.properties;
    var keys = Object.keys(prop).sort();

    var kv = _.zip(keys, values);
    var attributes = kv.map(([key, val]) => fromJSAN(prop[key], val));

    return _.zipObject(keys, attributes);
}

const reconstructArray = (schema, vals) => vals.map(lazyFromJSAN(schema.items));

export default function fromJSAN(schema, values){
    if (schema.type === 'object'){
        return reconstructObject(schema, values);
    }
    if (schema.type === 'array'){
        return reconstructArray(schema, values);
    }
    return values;
}
const lazyFromJSAN = schema => _.partial(fromJSAN, schema);
