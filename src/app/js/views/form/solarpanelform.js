define([
    "backbone.marionette",
    "hbs!./solarpanelform.tmpl",
    "backbone.modelbinder",
    "jquery-ui",
    "../../models/solarpanelproducers"
    ], function(Marionette, tmpl, ModelBinder, jqueryUi, SolarPanelProducers) {

        return Marionette.ItemView.extend({
            template: {
                template: tmpl,
                type: "handlebars"
            },
            templateHelpers: {
                typeName: function(){
                  return ("Aurinkokeräin : " + this.solarInstallationName);
                },
                showSolarInstallationDataIsTrue: function() {
                    return ( this.showSolarInstallationData === true );
                },
                roofArea: function() {
                    return Number(this.roofArea);
                },
                isSelected: function() {
                    var selectedObj = SolarPanelProducers.getSelected();
                    return selectedObj && (this.id === selectedObj.id);
                }
            },
            events: {
                "click .delete": "destroyModel",
                "click .toggle-show-details-btn": "toggleBackgroundData",
                "click .accordion-toggle": "toggleAccordionItem"
            },
            modelEvents: {
                "change": "modelChanged",
                "selected": "render",
                "deselect": "render"
            },
            destroyModel: function() {
                this.model.destroy();
                this.close();
            },
            toggleAccordionItem: function() {
                this.$('.accordion-toggle > i').toggleClass('icon-chevron-down').toggleClass('icon-chevron-up');
            },
            toggleBackgroundData: function() {
                this.$('.toggle-show-details-icon').toggleClass('icon-chevron-down').toggleClass('icon-chevron-up');
                this.$('.background-details').slideToggle();
            },
            // re-renders the form if element bound to changed property has class ".re-render"
            modelChanged: function(model, event) {
                var self = this;
                _.each(_.keys(event.changes), function(it) {
                    var selector = ".re-render[name="+it+"]";
                    if (self.$(selector).length) {
                        self.render();
                        // re-select the element from the now changed form and focus on it
                        self.$(selector).each(function() { this.focus(); });
                    }
                });
            },
            initialize: function(options) {
                _.bindAll(this);
                this.modelBinder = new ModelBinder();
            },
            onRender: function() {
                var self = this;
              
                var bindings = ModelBinder.createDefaultBindings(self.el, 'name');

                initializeAreaSliders();
                addSliderBindings(bindings);

                this.modelBinder.bind(this.model, this.el, bindings);

                this.$('.background-details').hide();

                return bindings;

                function initializeAreaSliders(){
                  self.$( "#photovoltaicAreaSlider" ).slider({
                    min: 0,
                    max: self.model.attributes.roofArea,
                    slide: function (event, ui){
                      var value = ui.value;
                      self.model.set('photovoltaicArea', value);
                      self.setSliderMaxValues(self.$(this));
                    }
                  });

                  self.$( "#thermalAreaSlider" ).slider({
                    min: 0,
                    max: self.model.attributes.roofArea,
                    slide: function (event, ui){
                      var value = ui.value;
                      self.model.set('thermalArea', value);
                      self.setSliderMaxValues(self.$(this));
                    }
                  });
                }

                function addSliderBindings(bindings){
                    bindings.photovoltaicArea = { selector: '[name="photovoltaicArea"]',
                                                  converter: function(direction, value, attr, model, els){
                                                    var slider = self.$( "#photovoltaicAreaSlider" );
                                                    slider.slider( "value", value );
                                                    self.setSliderMaxValues(slider);
                                                    return value;
                                                  }};
                    bindings.thermalArea = { selector: '[name="thermalArea"]',
                                             converter: function(direction, value, attr, model, els){
                                               var slider = self.$( "#thermalAreaSlider" );
                                               slider.slider( "value", value );
                                               self.setSliderMaxValues(slider);
                                               return value;
                                             }};
                    return bindings;
                }
            },
            onClose: function() {
                this.modelBinder.unbind();
            },
            setSliderMaxValues: function(activeSlider) {
                var self = this,
                    sliders = this.$('#photovoltaicAreaSlider, #thermalAreaSlider'),
                    otherSliders = sliders.not(activeSlider),

                    roofArea = this.model.get('roofArea'),

                    usedRoofArea = _.reduce(sliders, function(memo, slider) { return memo + self.$(slider).slider('value'); }, 0),
                    remainingRoofArea = roofArea - usedRoofArea;

                _.each(otherSliders, function(otherSlider) {
                    otherSlider = self.$(otherSlider);
                    var otherSliderMaxValue = otherSlider.slider('value') + remainingRoofArea;
                    otherSlider.slider('option', 'max', otherSliderMaxValue);
                    otherSlider.siblings('.max-value').text(Number(otherSliderMaxValue).toFixed(2));
                });
            }
        });
});
