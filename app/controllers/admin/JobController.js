/**
 * Job Controller
 *
 * author: Mark Lewis
 */

var request = require('request');
var async = require('async');
var _ = require('underscore');
var util = require('util');
var later = require('later').later;
var cron = require('later').cronParser;
var JobRepository = require('./../../repositories/JobRepository.js');

/**
 * constructor
 */
function JobController(db, jobScheduler) {

    /**
     * Load the job repo for mongo connectivity
     */
    this.db = db;
    this.jobRepository = new JobRepository({'db': db});
    this.jobScheduler = jobScheduler;
    this.data = {"section": "job"};
}

JobController.prototype.indexAction = function(req, res) {
    var parent = this;
    var data = this.data;
    var jobId = req.params.id;
    var limit = req.query.limit;
    var skip = req.query.skip;
    var query = {};

    if (jobId) {
        query.job_id = jobId;
    }

    if (req.query.search) {
        search = new RegExp('.*' + req.query.search + '.*', 'i');
        query = {"job_name": search};
    }

    var options = {
        "limit": limit,
        "skip": skip,
        "_id": 0
    };

    this.jobRepository.count(query, function(err, count) {
        parent.jobRepository.find(query, {}, function(err, jobs) {
            var results = {
                "totalRecords": count,
                "data": jobs
            }
            if (jobId) {
                res.send(jobs[0]);
            } else {
                res.send(results);
            } 
            
        });
    });
}

JobController.prototype.runningAction = function(req, res) {
    var data = this.data;
    var runningJobs = this.jobScheduler.getRunningJobs();

    _.extend(data, { 
        'running_jobs': runningJobs,
        'running_jobs_json': JSON.stringify(runningJobs) 
    });
    res.send(data);
}

JobController.prototype.logAction = function(req, res) {
    var parent = this;
    var data = this.data;
    var query = {
        $query: {},
        $orderby: {
            "time": -1
        }
    }
    this.db.collection('job_log').find(query, {}).toArray(function(err, results) {
        if (err) res.send(err);
        _.extend(data, { 'job_logs': results });
        res.send(data);
    });
}

JobController.prototype.scheduledAction = function(req, res) {
    var data = this.data;
    var scheduledEvents = this.jobScheduler.getScheduledEvents();
    res.send(scheduledEvents);
} 

JobController.prototype.editAction = function(req, res) {
    var parent = this;
    var data = this.data;
    var query = {'job_id': req.params.id};
    var jobRepository = this.jobRepository;

    _.extend(data, {json: {}});

    jobRepository.getAvailableCommands(function(err, commands) {
        if (err) util.log(err);

        data.commands = commands; 
        if (req.params.id === "0") {
            // this is a new record
            data.job = {};
            data.json.job = JSON.stringify({});
            res.send(data);
        } else {
            // get the record from the db
            parent.jobRepository.findOne(query, function(err, job) {
                if ((err) || (!job)) {
                    res.send({status: "error", error: "job not found"});
                    return false;
                }
                delete job._id;
                data.job = job;
                data.json.job = JSON.stringify(job);
                res.send(data);
            });
        }
    });
}

JobController.prototype.startAction = function(req, res) {
    if ((req.route.method != "get")) {
        res.send({status: "error", error: "start must be get action and must include values"});
        return false;
    }
    var parent = this;
    var query = {'job_id': req.params.id};
    var jobRepository = this.jobRepository

    jobRepository.findOne(query, function(err, job) {
        if ((err) || (!job)) {
            res.send({status: "error", error: err});
            return false;
        }

        // update the job scheduler
        var scheduledJobs = parent.jobScheduler.getScheduledJobs();
        parent.jobScheduler.startJob(job);

        // send updated job back
        res.send({status: "success", job: job});        
    });
}

JobController.prototype.updateAction = function(req, res) {
    if ((req.route.method != "put") || (!req.body.values)) {
        res.send({status: "error", error: "update must be put action and must include values"});
        return false;
    }
    var parent = this;
    var query = {'job_id': req.params.id};
    var values = req.body.values;
    var jobRepository = this.jobRepository

    jobRepository.update(query, values, {}, function(err, updated) {
        if ((err) || (!updated)) {
            res.send({status: "error", error: err});
            return false;
        }

        // update the job scheduler
        var scheduledJobs = parent.jobScheduler.getScheduledJobs();
        for (var j in scheduledJobs) {
            var job = scheduledJobs[j];
            util.log('stopping job scheduled for ' + job.cronTime.source);
            job.stop();
        }
        parent.jobScheduler.initSchedule();

        // send updated job back
        res.send({status: "success", updated: updated});        
    });
}

JobController.prototype.removeAction = function(req, res) {
    var parent = this;
    if ((req.route.method != "delete") || (!req.params.id)) {
        var data = {
            status: "error",
            error: "remove must be delete action and must be called from a job resource",
            method: req.route.method,
            id: req.params.id
        };
        res.send(data);
        return false;
    }
    var query = {'job_id': req.params.id};
    
    this.jobRepository.remove(query, {safe: true}, function(err, removed) {
        if ((err) || (!removed)) {
            res.send({status: "error", error: err});
            return false;
        }

        // update the job scheduler
        var scheduledJobs = parent.jobScheduler.getScheduledJobs();
        for (var j in scheduledJobs) {
            var job = scheduledJobs[j];
            util.log('stopping job scheduled for ' + job.cronTime.source);
            job.stop();
        }
        parent.jobScheduler.initSchedule();

        res.send({status: "success", id: req.params.id, removed: removed});
    });
}

JobController.prototype.createAction = function(req, res) {
    var parent = this;
    if ((req.route.method != "post") || (!req.body.values)) {
        var data = {
            status: "error",
            error: "insert must be post action and must include values",
            method: req.route.method,
            values: req.body.values 
        };
        res.send(data);
    }    
    this.jobRepository.insert(req.body.values, {}, function(err, newJob) {
        // update the job scheduler
        var scheduledJobs = parent.jobScheduler.getScheduledJobs();
        for (var j in scheduledJobs) {
            var job = scheduledJobs[j];
            util.log('stopping job scheduled for ' + job.cronTime.source);
            job.stop();
        }
        parent.jobScheduler.initSchedule();

        res.send({status: "success", job: newJob});
    });
}

JobController.prototype.clearLogAction = function(req, res) {
    if (req.route.method != "delete") {
        var data = {
            status: "error",
            error: "clear-log must be delete action",
            method: req.route.method,
            values: req.body.values 
        };
        res.send(data);
        return false;
    }
    this.db.collection('job_log').remove({}, function(err, newJob) {
        if (err) {
            var data = {
                status: "error",
                error: err
            };
            res.send(data);
        }
        
    });
}

/* export the class */
exports.controller = JobController;
