define([
  'jquery',
  'underscore',
  'backbone',
  'vm',
  'text!templates/bands/mentions_stats_panel.html',
  'moment'
], function($, _, Backbone, Vm, template) {

  var MentionsStatsPanelView = Backbone.View.extend({

    tagName: "div",
    className: "panel panel-default",
    template: _.template(template),

    initialize: function () {
      this.model.bind("change", this.render, this);
      this.model.bind("destroy", this.close, this);
    },

    render: function () {
      var now = moment().format('YYYY-MM-DD'); 
      var lastWeek = moment().subtract('days', 7).format('YYYY-MM-DD'); 
      var lastMonth = moment().subtract('months', 1).format('YYYY-MM-DD'); 

      var total = 0;
      var total_this_week = 0;
      var total_this_month = 0;

      _.forEach(this.model.attributes.mentions, function (mention) {
        total++;
	if (mention.date >= lastWeek) {
	  total_this_week++;
	}
	if (mention.date >= lastMonth) {
	  total_this_month++;
	}	
      });

      var data = {
	total: total,
	total_this_week: total_this_week,
	total_this_month: total_this_month,
	last_updated: now
      }
      $(this.el).html(this.template(data));

      return this;
    },

  });

  return MentionsStatsPanelView;

}); 
