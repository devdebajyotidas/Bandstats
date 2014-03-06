define([
  'jquery',
  'underscore',
  'backbone',
  'collections/bands',
  'views/paginator',
  'views/bands/band_gallery_item',
  'text!templates/bands/band_list.html'
], function($, _, Backbone, BandsCollection, PaginatorView, BandGalleryItemView, bandListTemplate){
  var BandGalleryView = Backbone.View.extend({
    el: '#band-list-container',

    initialize: function() {
      this.collection = new BandsCollection();
      this.collection.fetch();
      this.collection.on('reset', this.render, this);
      this.collection.on('sync', this.render, this);
    },

    render: function () {

      this.$el.html(bandListTemplate);

      var parent = this;
      _.each(this.collection.models, function (model) {
        parent.renderBand(model);
      }, this);

      $('#pagination', this.el).html(new PaginatorView({model: this.collection, page: this.options.page}).render().el);
    },

    renderBand: function (model) {
      $('#band-list', this.el).append(new BandGalleryItemView({model: model}).render().el); 
    }

  });
  return BandGalleryView;
});
