/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * *
 */
;// QUOKKA 2017
// By zibx on 16 june 2017.
// You can contact me by email. mailto:zibx@quokka.pub

module.exports = (function() {
    'use strict';

    var EventEmitter = require('events').EventEmitter;

    var util = require('util'),
        fs = require('fs'),
        cwd = process.cwd(),
        slice = Array.prototype.slice,
        child = require('child_process'),
        emptyFn = function () {
        };

    var Bear = function(cfg){
        EventEmitter.call(this);
        if(typeof cfg === 'function')
            cfg = {listeners: {connected: cfg}};
        Object.assign(this, cfg);
        var listeners = this.listeners, i;
        for( i in listeners )
            listeners.hasOwnProperty(i) &&
                this.on(i, listeners[i]);

        this.autoinit && setTimeout(this.init.bind(this),0);
    };
    Bear.prototype = {
        autoinit: true,
        status: null,
        command: 'baresip',
        avoidTimeout: true,
        set: function(key, val){
            this.emit(key, val, this[key]);
            this[key] = val;
        },
        close: function(){
            if(this.spawned)
                this.baresip.kill('SIGTERM');

        },
        matchers: {
            'baresip is ready.': {ready: true}
        },
        errRegexps: {
            auth: /401 Unauthorized/,
            timeout: /408 Request Timeout/
        },
        regexps: {
            connected: /200 OK/,
            call: /^call:/,
            ringing: /180 Ringing/,
            progress: /Call in-progress/,
            established: /Call established/,
            hangUp: /session closed/,
            reject: /486 Busy here/
        },
        _parser: function(data, stderr){
            data = data.trim();
            var match = this.matchers[data], i, regexps;
            if(match){
                for( i in match )
                    this.set(i, match[i]);
            }

            regexps = this.errRegexps;
            for( i in regexps ){
                match = data.match(regexps[i]);
                if(match !== null){
                    this.emit(i+'Error', data);
                }
            }

            regexps = this.regexps;
            for( i in regexps ){
                match = data.match(regexps[i]);
                if(match !== null){
                    this.emit(i, data);
                    this.emit('callStatus', i, data);
                }
            }
            this.emit('raw', data, stderr);
        },
        init: function(){
            var _self = this,
                bs;
            this.set('status', 'beforeSpawn');

            bs = this.baresip = child.spawn(this.command, [], {cwd: process.cwd()});
            bs.stdin.setEncoding('utf-8');
            this.spawned = true;
            bs.on('error', function( err ){
                _self.set('spawned', false);
                _self.set('status', 'spawnError')
            });

            this.set('status', 'spawned');

            bs.stdout.on('data', function (data) {
                _self._parser(data.toString('utf-8'));
            });
            bs.stderr.on('data', function (data) {
                _self._parser(data.toString('utf-8'), true);
            });
            bs.on('exit', function (code) {
                _self.emit('exit', code+'');
                _self.set('spawned', false);
                //console.log('exit')
            });
        },
        call: function(number){
            var _self = this;
            this.baresip.stdin.write('d '+number+'\n');
            var recall = function(){
                _self.call(number);
            };
            if(this.avoidTimeout) {
                this.on('timeoutError', recall);
                this.once('ringing', function(){
                    this.removeListener('timeoutError', recall);
                })
            }
        }
    };

    util.inherits(Bear, EventEmitter);

    return Bear;
})();