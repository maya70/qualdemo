(function($Q){
	'use strict'
	$Q.Control = $Q.defineClass(
					null, 
					function Control(config){
						var self = this;
						self.highlightColor = "cyan"; 
						self.sessionLog = {}; 
						self.dataModel = new $Q.Model(self); 
						self.mainView = new $Q.MainView(self); 						
					
					},
					{
						viewReady: function(view){
							var self = this; 	
							self.audit = self.dataModel.getAudit(); 					
							if(self.audit === "minap")
								self.dataModel.readMinapData(); 
							else 
								self.dataModel.readPicanetData(); 
						},
						startSessionLog: function(config){
							var self = this;
							self.sessionLog = [];
							
							if(!self.sessionID) self.sessionID = 0; 
							$Q.handleJSON('./php/get_session_id.php', 
											function(newID){
												self.sessionID = newID; 
											}, 
											{
												type: 'GET',
												data: {id: 0}
											});
							
							//self.sessionParams = {}; // stores audit, year and job title to be retrievable later
							//self.sessionLog['cardExpands'] = []; 
							//self.sessionLog['btnClicks'] = 0; 
							
							for(var key in config){
								var rec = {};
								rec['sessionID'] = self.sessionID; 							
								rec['evtOwnedBy'] = "application";
								rec['evtType'] = "start";							
								rec['evtTime'] = new Date().toLocaleString(); 
								rec['paramName'] = key;
								rec['paramValue'] = config[key]; 
								self.sessionLog.push(rec); 
							}
							//self.sessionLog['evtParam'] = self.sessionParams; 
							console.log(self.sessionLog); 
						},
						updateSessionLog: function(config){
							var self = this;
							if(config['params']){
								for(var key in config['params']){
									var rec = {};
									rec['sessionID'] = self.sessionID; 							
									rec['evtOwnedBy'] = config['owner'] ;
									rec['evtType'] = config['type'];							
									rec['evtTime'] = new Date().toLocaleString(); 
									rec['paramName'] = key;
									rec['paramValue'] = config['params'][key]; 
									self.sessionLog.push(rec); 
								}
							}
							else{
								var rec = {};
									rec['sessionID'] = self.sessionID; 							
									rec['evtOwnedBy'] = config['owner'] ;
									rec['evtType'] = config['type'];							
									rec['evtTime'] = new Date().toLocaleString(); 
									rec['paramName'] = '';
									rec['paramValue'] = ''; 
									self.sessionLog.push(rec); 
							}
							
						},
						writeSessionLog: function(){
							var self = this;
							//self.sessionLog['exitTime'] = Date.now(); 
							$Q.handleJSON('./php/submit_log.php', 
												function(){},
												{
													type: 'POST',
								                    data: {
								                       "sessionLog": self.sessionLog								                      
								                      }
												});
						        
						},
						writeSessionErr: function(msg){
							var self = this;
							//self.sessionLog['exitTime'] = Date.now(); 
							$Q.handleJSON('./php/submit_err.php', 
												function(){},
												{
													type: 'POST',
								                    data: {
								                       "sessionErr": msg								                      
								                      }
												});			        
						},						
						addBtnClick: function(){
							var self = this;
							self.sessionLog['btnClicks']++;
							console.log(self.sessionLog); 
						},
						addCardExpand: function(cardname){
							var self = this; 
							self.sessionLog['cardExpands'].push(cardname); 
							console.log(self.sessionLog); 
						},
						getMetaData: function(){
							var self = this; 
							return self.dataModel.getMetaData(); 
						},
						getVarDesc: function(vname){
                            return this.dataModel.getVarDesc(vname); 
                        },                        
						dataReady: function(dataViews, rawData){
							var self = this;	
							self.dataViews = dataViews; 						
							self.allVars =  Object.keys(rawData[0]); 
							self.mainView.createQualCards(dataViews);
							self.mainView.createQualityPane(); 
						},
						getYear: function(){
							return this.dataModel.year; 
						},
						getTimeHier: function(viewId){
							var self = this;
							return self.dataModel.getTimeHier(viewId); 
						},
						prepTimeData: function(tspan, viewId, vname ){
							var self = this;
							return self.dataModel.prepTimeData(tspan, viewId, vname);

						},
						buildMetaHier: function(){
							return this.dataModel.buildMetaHierarchy(); 
						},
						getDataViews: function(){
							return this.dataViews; 
						},
						getAvailVars: function(){
							var self = this;
							return self.allVars; 
						},
						getAvailMetrics: function(){
							var self = this; 
							return self.dataModel.availMetrics; 
						},	
						getQuality: function(varname){
							return this.dataModel.getQuality(varname);
						},					
						drawChart: function(displayId, data, cat, levels, trellis){
							var self = this;
							// get type of chart from view
							//var view = self.mainView.getChartType(displayId); 

							// tell view to draw bar chart
							if(!cat)
								this.mainView.drawBarChart(displayId, data); 
							else if(!trellis)
								this.mainView.drawCatBar(displayId, data, cat, levels,0);
							else
								this.mainView.drawBarTrellis(displayId, data, cat, levels); 
						}, 
						//getDisplayVariables: function(){
						//	var self = this;
						//	return self.displayVariables; 
						//}, 
						addCategorical: function(viewId, catName){
						  	this.dataModel.addCategorical(viewId, catName);
						},
						resetCategoricals: function(viewId){
							this.dataModel.resetCategoricals(viewId); 
						},
						getCardCats: function(viewId){							
							return this.dataModel.getCategoricals(viewId); 
						},
						getCardQs: function(viewId){							
							return this.dataModel.getQs(viewId); 
						},						
						updateDataViews: function(viewId, slaves){
							var self = this;
							self.mainView.updateDataViews(viewId, slaves);
						},
						variableInData: function(newvar){
							return this.dataModel.variableInData(newvar); 
						},
						setCardCats: function(viewId, newcats){
							var self = this;
							self.dataModel.setCategoricals(viewId, newcats);
						},
						setCardQs: function(viewId, newQs){
							var self = this;
							self.dataModel.setQuantitatives(viewId, newQs);
						},
						updateMetrics: function(viewId, value){
							var self = this;
							console.log(value); 
							self.dataModel.updateMetrics(viewId, value); 
						},
						getMissing: function(metric, varname){
							return this.dataModel.getMissing(metric, varname); 
						},
						getAllMissing: function(){
							return this.dataModel.getAllMissing(); 
						},
						getDataLength: function(){
							var self = this; 
							return self.dataModel.getDataLength(); 
						},
						getRecordById: function(recId){
							return this.dataModel.getRecordById(recId); 
						},
						getEHR: function(){
							return this.dataModel.getEHR(); 
						},
						refreshGrid: function(){
							var self = this;
							self.mainView.refreshGrid(); 
						},
						refreshGrid1x1: function(){
							this.mainView.refreshGrid1x1(); 
						},
						refreshGrid32x23: function(str){
							this.mainView.refreshGrid32x23(str); 
						}
						
					}
		);
})(QUALDASH);