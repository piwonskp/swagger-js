import _ from 'lodash';

function toJSAN(val){
    if(_.isArray(val)){
        return val.map(toJSAN);
    }
    if (_.isObject(val)) {
        return objectToJSAN(val);
    }
    return val;
};

function objectToJSAN(jsonObject){
    var attrs = Object.keys(jsonObject).sort();

    return attrs.map(name => toJSAN(jsonObject[name]));
}

export default toJSAN;
