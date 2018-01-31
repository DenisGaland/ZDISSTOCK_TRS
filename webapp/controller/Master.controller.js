sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast",
	"sap/m/MessageBox",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/odata/ODataModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/core/BusyIndicator"
], function(Controller, MessageToast, MessageBox, JSONModel, ODataModel, Filter, FilterOperator, BusyIndicator) {
	"use strict";
	return Controller.extend("Press_Shop_Fiori.controller.Master", {

		onInit: function() {
			//var oView = this.getView();
			this.GetData();
			//var oController = this;
			/*var osite = oView.byId("__PLANT");
			var URL = "/sap/opu/odata/sap/ZGET_PLANT_SRV/";
			var OData = new ODataModel(URL, true);
			var query = "/S_T001WSet(Type='01')";
			BusyIndicator.show();
			OData.read(query, null, null, true, function(response) {
				BusyIndicator.hide();
				debugger;
				var Open = response.Open;
				var plant = response.EPlant;
				var name1 = response.ET001w.Name1;
				var site = plant + " " + name1;
				osite.setValue(site);
				var oModel = new ODataModel("/sap/opu/odata/sap/ZALL_PLANTS_SRV/", true);
				oView.byId("DC_Drop_In").setModel(oModel);
				var filters = [];
				filters.push(new Filter("Werks", FilterOperator.EQ, response.EPlant));
				var oFilter = new Filter(filters, true);
				var oBinding = oView.byId("DC_Drop_In").getBinding("items");
				oBinding.filter(oFilter);
				oView.byId("DC_Drop_In").getModel().setSizeLimit(300);
				if (Open === "X") {
					oController.GetData();
				}
			}, function(error) {
				BusyIndicator.hide();
				jQuery.sap.delayedCall(500, this, function() {
					oView.byId("SearchArt").focus();
				});
				console.log("Error: " + error.response.body.toString());
			});*/
		},

		getContextByIndexn: function(oEvent) {
			var self = this;
			var promise = $.Deferred();
			var selectedGroup = oEvent.getSource().getBindingContext("itemModel").getObject();
			var material = selectedGroup.Gtin;
			this.GetData(material, "-");
		},

		getContextByIndexp: function(oEvent) {
			var self = this;
			var promise = $.Deferred();
			var selectedGroup = oEvent.getSource().getBindingContext("itemModel").getObject();
			var material = selectedGroup.Gtin;
			this.GetData(material, "p");
		},

		ClearBox: function() {
			var oView = this.getView();
			var URL = "/sap/opu/odata/sap/ZPREPARE_FLUX_SRV/ItemsSet(Zfilter='T" + "01" + "')";
			debugger;
			BusyIndicator.show();
			OData.read(URL, function(response) {
				BusyIndicator.hide();
				if (response.Message !== "" && response.EZtype === "O") {
					var oController = oView.getController();
					oController.getView().byId("TOOL_BAR").setVisible(false);
					oController.getView().byId("table1").setVisible(false);
					var model = new JSONModel();
					oController.getView().setModel(model, "itemModel");
					MessageBox.show(response.Message, {
						icon: MessageBox.Icon.INFORMATION,
						actions: [MessageBox.Action.OK],
						onClose: function(oAction) {
							if (oAction === "OK") {
								jQuery.sap.delayedCall(500, this, function() {
									oView.byId("SearchArt").focus();
								});
							}
						}
					});
				}
			}, function(error) {
				BusyIndicator.hide();
				console.log("Error: " + error.response.body.toString());
				promise.reject();
			});
		},
		searchArt: function() {
			var oView = this.getView();
			var oController = oView.getController();
			var material = oView.byId("SearchArt").getValue();
			var URL2 = "/sap/opu/odata/sap/ZCHECK_VALUE_SCAN_SRV/MessageSet(PValue='06" + material + "')";
			debugger;
			BusyIndicator.show();
			OData.read(URL2, function(response2) {
				BusyIndicator.hide();
				if (response2.EMessage !== "" && response2.EZtype === "E") {
					var path = $.sap.getModulePath("Press_Shop_Fiori", "/audio");
					var aud = new Audio(path + "/MOREINFO.png");
					aud.play();
					oView.byId("SearchArt").setValue("");
					MessageBox.show(response2.EMessage, {
						icon: MessageBox.Icon.ERROR,
						onClose: function() {
							jQuery.sap.delayedCall(500, this, function() {
								oView.byId("SearchArt").focus();
							});
						}
					});
				} else {
					var oTable = oView.byId("table1");
					oTable.setVisible(true);
					oController.GetData(material);
				}
			}, function(error) {
				BusyIndicator.hide();
				console.log("Error: " + error.response.body.toString());
				promise.reject();
			});
		},
		GetData: function(material, from) {
			var oView = this.getView();
			var searchString = "A" + material + "/" + "01" + from;
			material = oView.byId("SearchArt").setValue("");
			var URL = "/sap/opu/odata/sap/ZPREPARE_FLUX_SRV/ItemsSet?$filter=Zfilter " + "%20eq%20" + "%27" + searchString + "%27&$format=json";
			debugger;
			BusyIndicator.show();
			OData.read(URL, function(response) {
				BusyIndicator.hide();
				var newArray = response.results;
				var lines = newArray.length;
				if (response.results[0] != null) {
					var oTable = oView.byId("table1");
					oTable.setVisible(true);
					oView.byId("TOOL_BAR").setVisible(true);
					var sum = parseInt(response.results[0].Menge);
					for (var i = 1; i < response.results.length; i++) {
						if (i < response.results.length) {
							sum = parseInt(response.results[i].Menge) + sum;
						}
					}
					var model2 = new JSONModel({
						"Sum": sum,
						"Products": lines
					});
					oView.setModel(model2, "Model2");
					var model = new JSONModel({
						"items": newArray
					});
					model.setSizeLimit(100);
					oView.setModel(model, "itemModel");
				}
				jQuery.sap.delayedCall(500, this, function() {
					oView.byId("SearchArt").focus();
				});
			}, function(error) {
				BusyIndicator.hide();
				console.log("Error: " + error.response.body.toString());
				promise.reject();
			});
		},

		Validate: function() {
			var oView = this.getView();
			var oController = oView.getController();
			var ocon = oView.byId("CONFIRM").getText();
			var oyes = oView.byId("YES").getText();
			var ono = oView.byId("NO").getText();
			MessageBox.show(
				ocon, {
					//icon: MessageBox.Icon.INFORMATION,
					actions: [oyes, ono],
					onClose: function(oAction) {
						if (oAction === oyes) {
							oController.SaveData();
						}
					}
				});
		},

		SaveData: function() {
			var oView = this.getView();
			var plant = oView.byId("DC_Drop_In").getSelectedItem().getText();
			var plantArray = plant.split("-");
			var URL = "/sap/opu/odata/sap/ZPREPARE_FLUX_SRV/ItemsSet(Zfilter='S" + "01" + plantArray[0] + "')";
			BusyIndicator.show();
			OData.read(URL, function(response) {
				BusyIndicator.hide();
				if (response.Message !== "" && response.EZtype === "O") {
					oView.byId("TOOL_BAR").setVisible(false);
					oView.byId("table1").setVisible(false);
					var model = new JSONModel();
					oView.setModel(model, "itemModel");
					MessageBox.show(response.Message, {
						icon: MessageBox.Icon.INFORMATION,
						onClose: function() {
							jQuery.sap.delayedCall(500, this, function() {
								oView.byId("SearchArt").focus();
							});
						}
					});
				} else {
					var path = $.sap.getModulePath("Press_Shop_Fiori", "/audio");
					var aud = new Audio(path + "/MOREINFO.png");
					aud.play();
					MessageBox.show(response.Message, {
						icon: MessageBox.Icon.ERROR,
						onClose: function() {
							jQuery.sap.delayedCall(500, this, function() {
								oView.byId("SearchArt").focus();
							});
						}
					});
				}
			}, function(error) {
				BusyIndicator.hide();
				console.log("Error: " + error.response.body.toString());
				promise.reject();
			});
		}
	});
});