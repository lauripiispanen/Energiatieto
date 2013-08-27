define(["backbone"], function(Backbone) {
    // this is a singleton, so that it can be accessed in test cases
    return Backbone.Collection.extend({
        initialize: function(options) {
            var self = this;
          
            this.on("add", function(model, info){
                model.save();
            });
          
            this.on("change", function(model, info){
                if (!info.changes.id) {
                  model.save();
                }
            });

            this.on("select", function(model) {
                self.each(function(it) {
                    if (it !== model) {
                        it.unset("___selected");
                        it.trigger("deselect");
                    } else {
                        it.set({ ___selected: true });
                        it.trigger("selected");
                    }
                });
            });
            this.on("remove", function() {
                if (self.length > 0) {
                    self.trigger("select", self.at(0));
                }
            });

            this.on("reset", function() {
                var it = self.getSelected();
                if (it) {
                    self.trigger("select", it);
                }
            });
        },
        getSelected: function() {
            return this.find(function(it) {
                return it.get("___selected");
            });
        },
        attachTo: function(parent, prop) {
            var self = this;
            var sync = function() {
              var changes = {};
              changes[prop] = self.toJSON();
              parent.set(changes);
            };

            this.on("change", sync);
            this.on("reset", sync);
            this.on("remove", sync);
            sync();
        }
    });
});
