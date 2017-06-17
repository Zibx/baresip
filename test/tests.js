/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * *
 */
;// QUOKKA 2017
// By zibx on 16 june 2017.

module.exports = (function () {
    'use strict';
    var assert = require('chai').assert;
    var Bear = require('../bear');

    describe('baresip', function() {
        /*it('should init', function (done) {

            var seq = {
                null: 'beforeSpawn',
                beforeSpawn: 'spawned',
                spawned: true
            };
            var sip = new Bear({
                listeners: {
                    status: function(val, oldVal){
                        assert.equal(seq[oldVal], val);
                        if(seq[val] === true) {
                            sip.close();
                            done();
                        }
                    }
                }
            });

        });

        it('should connect', function (done) {

            new Bear({
                listeners: {
                    connected: function(){
                        done();
                    }
                }
            });

        });

        it('should be simple', function (done) {
            new Bear( function() {
                done();
            });
        });*/

        it('should call', function (done) {
            this.timeout(15000);
            new Bear( function() {
                this.call('79164819441');
            });
        });

    });

})();