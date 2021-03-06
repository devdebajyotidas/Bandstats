/**
 * Setting Controller
 *
 * author: Mark Lewis
 */

var request = require('request');
var async = require('async');
var _ = require('underscore');
var xml2js = require('xml2js');
var nconf = require('nconf');
var fs = require('fs');
var path = require('path');
var util = require('util');

/**
 * constructor
 */
var SettingController = function(db) {

    /**
     * Load the setting repo for mongo connectivity
     */
    this.data = {"section": "setting"};
    nconf.file(path.join(__dirname, 'app/config/app.json'));

    this.indexAction = function(req, res) {
        var data = this.data;
        fs.readFile(path.join(__dirname, '/../../config/app.json'), 'utf8', function (err, results) {
            if (err) {
                _.extend(data, {"error": err});
            }
            _.extend(data, { 'config': JSON.stringify(results) });
            var template = require('./../../views/setting_index');
            res.send(template.render(data));
        });
    }

    this.updateAction = function(req, res) {
        if ((req.route.method != "put") || (!req.body.values)) {
            res.send({status: "error", error: "update must be put action and must include values"});
            return false;
        }

        res.send('not implemented yet');
    }
}

exports.controller = SettingController;
