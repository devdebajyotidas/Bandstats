define([
  'jquery',
  'underscore',
  'backbone',
  'collections/bands',
  'views/paginator',
  'views/bands/band_list_item',
  'text!templates/bands/band_list.html'
], function($, _, Backbone, BandsCollection, PaginatorView, BandListItemView, bandListTemplate){
  var BandListView = Backbone.View.extend({
    el: '#band-list-container',

    initialize: function() {
      this.collection.on('reset', this.render, this);
      this.collection.on('sync', this.render, this);
    },

    page: 1,

    render: function () {

      this.$el.html(bandListTemplate);

      var parent = this;
      _.each(this.collection.models, function (model) {
        parent.renderBand(model);
      }, this);

      $('#pagination', this.el).append(new PaginatorView({collection: this.collection, page: this.page}).render().el);
    },

    renderBand: function (model) {
      $('#band-list', this.el).append(new BandListItemView({model: model}).render().el); 
    }

  });
  return BandListView;
});
