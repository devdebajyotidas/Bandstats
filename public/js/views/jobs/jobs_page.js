define([
  'jquery',
  'underscore',
  'backbone',
  'vm',
  'views/jobs/job_list',
  'text!templates/jobs/jobs_page.html'
], function($, _, Backbone, Vm, JobListView, jobsPageTemplate){
  var JobsPage = Backbone.View.extend({
    el: '#content',

    render: function () {
      this.$el.html(jobsPageTemplate);
      this.renderJobList();
    },

    renderJobList: function() {
      var jobsCollection = this.collection;

      var jobsListView = Vm.create(this, 'JobListView', JobListView, {collection: jobsCollection});
      jobsListView.render();

    }

  });
  return JobsPage;
});
