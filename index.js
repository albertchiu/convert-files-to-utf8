var fs = require('fs');
var path = require('path');
var jschardet = require('jschardet')
var iconv = require('iconv-lite');

var convertPath = '.';
var utf8 = 'UTF-8';
var filterRegExp = /(\.java|\.jsp)$/;//new RegExp('(\.java|\.jsp)$');

function iterateFiles(startPath, filter, callback) {
    if (!fs.existsSync(startPath)){
        console.log('no dir ', startPath);
        return;
    }

    var files = fs.readdirSync(startPath);
    for(var i = 0; i < files.length; i++){
        var filename = path.join(startPath,files[i]);
        var stat = fs.lstatSync(filename);
        if (stat.isDirectory()){
            iterateFiles(filename, filter, callback); //recurse
        }
        else if (filter.test(filename)) {
            callback(filename);
        }
    };
}

function convertEncoding(filename, dataBuffer, dstEncoding) {
    var srcEncodingResult = jschardet.detect(dataBuffer);
    var srcEncoding = srcEncodingResult.encoding;
    if (srcEncoding !== dstEncoding && srcEncoding !== 'ascii') {
        //console.log(filename + ', srcEncodingResult='' + JSON.stringify(srcEncodingResult));

        if (srcEncodingResult.confidence < 0.95) {
            console.warn('confidence less than 0.95, ' + filename + ', srcEncodingResult=' + JSON.stringify(srcEncodingResult));
        }

        var str = iconv.decode(dataBuffer, srcEncoding);
        var buf = iconv.encode(str, dstEncoding);
        fs.writeFile(filename, buf);
    }
}

iterateFiles(convertPath, filterRegExp, function(filename) {
        fs.readFile(filename, function(err, dataBuffer) {
            if (err) throw err;
            convertEncoding(filename, dataBuffer, utf8);
        });
    }
);