#!/usr/bin/env node

cli = require('commander')
path = require('path')

const date2str = (x, y) => {
    var z = {
        M: x.getMonth() + 1,
        d: x.getDate(),
        h: x.getHours(),
        m: x.getMinutes(),
        s: x.getSeconds()
    };
    y = y.replace(/(M+|d+|h+|m+|s+)/g, function(v) {
        return ((v.length > 1 ? "0" : "") + eval('z.' + v.slice(-1))).slice(-2)
    });

    return y.replace(/(y+)/g, function(v) {
        return x.getFullYear().toString().slice(-v.length)
    });
}

const {
    aepGet,
} = require('./index.js')

cli
    .version('0.0.1')
    .description('A CLI utility for processing and filtering appcenter error groups and instances')
cli
    .command('get <ErrorGroupID>')
    .alias('g')
    .description('gets error group json response from appcenter & appends error intance response for each error in the group to the original response')
    .requiredOption('-k, --key <key>', 'AppcenterAPI key')
    .requiredOption('-o, --owner <owner>', 'sets owner')
    .requiredOption('-a, --app <app>', 'sets app name')
    .requiredOption('-of, --output <output>', 'sets output file location')
    .option('-if, --input <input>', 'use this with error group backups incase of failure while downloading individual error responses')
    .option('-cf, --chunkfile <chunkfile>', 'specify chunkfile to resume chunk processing')
    .option('-f, --from <from>', 'sets from date "yyyy/mm/dd" - defaults to 90 days ago')
    .option('-t, --to <to>', 'sets to date "yyyy/mm/dd" - defaults to today')
    .action(function (ErrorGroupID, args) {
        if(args.to == undefined){
            args.to = new Date();
        }else{
            args.to = new Date(args.to);
        }
        if(args.from == undefined){
            var dateOffset = (24*60*60*1000) * 90; //30 days
            var fromDate = new Date();
            fromDate.setTime(fromDate.getTime() - dateOffset);
            args.from = fromDate;
        }else{
            args.from = new Date(args.from)
        }

        args.to = date2str(args.to, 'yyyy%2FMM%2Fdd')
        args.from = date2str(args.from, 'yyyy%2FMM%2Fdd')
        
        aepGet(ErrorGroupID, args)
    })
cli.parse(process.argv)