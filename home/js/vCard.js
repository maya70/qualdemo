(function($Q){
	'use strict'
	$Q.QualCard = $Q.defineClass(
					null, 
					function QualCard(mainView, viewId){
						var self = this; 
						self.expanded = false; 
						self.id = viewId; 
						self.parent = mainView; 
						self.state = {}; 	
						self.year = self.parent.control.getYear(); 					
						var container = d3.select("#mainCanvas").append("div")
											.attr("class", "item")
											.attr("id", "cardcontainer"+viewId)
											.on("dblclick", function(){
												////////console.log(this);	
												
												var curh = parseInt($(this).css("height")),
													curw = parseInt($(this).css("width"));
												
												if(self.expanded === false)
												{  // grow
													////////console.log("growing from "+ curh);
													curh *= 2;
													curw *= 2;	
													self.expanded = true; 
												}
												else
												{   // shrink
													////////console.log("shrinking from "+ curh);
													curh /= 2;
													curw /= 2; 
													self.expanded = false; 
												}
												$(this).css("height", curh+"px"); 
												$(this).css("width", curw+"px"); 
												self.parent.refreshGrid(1); 
												self.resizeVis(); 
											});
						
						self.createHeader(container, viewId);
						
						var cbody = container.append("div")
								.attr("class", "card-body")
								.style("width", "98%")
								.style("height", "92%")
								.style("padding-bottom", "3px")
								.style("margin-right", "1%")
								.style("margin-left", "1%")
								.style("margin-top", "-10px")
								.style("vertical-align", "top"); 
								 					
						
						var card = cbody.append("div")
										.attr("class", "item-content")
										.attr("id", "card"+viewId);
						card.append("div")
							.attr("class", "draw-area")
							.attr("id", "draw-area"+viewId);

						
						var panel = cbody.append("div")
										.attr("class", "w3-sidebar")
										.attr("id", "panel"+viewId)
										.style("background-color", "darkgrey")
										.style("max-width", "9%")
										.style("height", "82%").style("padding-bottom", "3px")
										.style("display", "inline-block")
										.style("visibility", "hidden")
								.style("margin-right", "0%")
								.style("margin-left", "0%")
								.style("overflow", "visible"); 
						
						$("#draw-area"+viewId).on("dblclick", function(e){
								e.stopPropagation(); 
							});

						self.createButtons(panel, viewId); 					
						
					},
					{
						getCardPalette: function(){
							var self = this;
							var allColors = [];
							$Q.colors.forEach(function(c){
								allColors.push(c); 
							});
							// remove colors that are already used by main view
							var mainViewColors = self.vis.getPalette(); 
							for(var key in mainViewColors){
								var index = allColors.indexOf(mainViewColors[key]);
								if(index >= 0) allColors.splice(index, 1);
							}
							if(!self.cardPalette)
								self.cardPalette = {};
							return allColors; 
						},
						setExpansion: function(){
							this.expanded = true; 
						},
						resetExpansion: function(){
							this.expanded = false; 
						},
						getExpansionState: function(){
							return this.expanded; 
						},
						isTrellisView: function(){
							var self = this; 
							return self.vis.istrellis; 
						},
						getCatData: function(d, cats){
							var self = this; 
							var catdata;
							var missingLabels = ["missing1", "missing2", "missing3", "missing4"];
							if(missingLabels.indexOf(d) >= 0){
								var missing = self.parent.control.getAllMissing(); 
								var id = parseInt(d[d.length-1])-1;
								var all = Object.keys(missing); 
								var start = parseInt(all.length/4 * id); 
								catdata = {};
								for(var i=start; i < (start+ all.length/4); i++){
									var key = all[i]; 
									catdata[key] = missing[key]['data']; 
								}
							}
							else
								catdata = cats['data'][d];
							return catdata; 

						},
						createSlave1: function(cats, ssvgW, ssvgH, xoffset){
							var self = this;
							var cat1 = cats['cats'][0];
							var catdata = self.getCatData(cat1, cats); //cats['data'][cat1];
							
							//////console.log(catdata);
							var auditVars = self.parent.control.audit === "picanet"? $Q.Picanet: $Q.Minap;
							var tabW = ssvgW/ cats['cats'].length;
							var div = d3.select("body").append("div")	
									    .attr("class", "tooltip")				
									    .style("opacity", 0);


							self.ssvg1div =d3.select("#draw-area"+self.id).append("div")
											.attr("class", "ssvgdiv"+self.id)																						
											.style("max-width", ssvgW+"px")
											.style("max-height", ssvgH+"px")	
											.style("position", "absolute")
											.style("top", "11px")
											.style("left", xoffset+"px")
											.style("border", "1px solid black");											

							self.ssvg1 = self.ssvg1div.append("svg")
											.attr("id", "ssvg1"+self.id)
											.attr("class", "ssvg"+self.id)
											.style("display", "inline-block")
											.attr("width", ssvgW)
											.attr("height", ssvgH);	
							
					 		
							var tabs = self.ssvg1.selectAll(".stabs"+self.id)
										.data(cats['cats'])
										.enter().append("g")
										.attr("class", "stabs"+self.id)
										.attr("transform", function(d, i){
											return "translate("+ (i*tabW) + ",0)"; 
										})
										.on("click", function(d){
											// deselect all tabs
											var all = d3.selectAll(".rtabs"+self.id);
											all.attr("active", 0);
											all.style("fill", "lightgrey");
											all.style("stroke", "white");

											// select only current tab
											var r = d3.select(this).select("rect");
												r.attr("active", 1);
												r.style("fill", "white");
												r.style("stroke", "black");			
											
											catdata = self.getCatData(d, cats);  //cats['data'][d];
											self.state['selectedCat'] = d; 
											self.subVis1.draw(self.id, d, catdata , self, ssvgW-10, ssvgH-10);
											self.keepHighlights(); 

										})
										.on("mouseover", function(d){
											d3.select(this).select("rect").style("fill", "white");
											//d3.select(this).style("fill", "white");
											//var mssLegend = auditVars["displayVariables"][self.id]["legend"]? auditVars["displayVariables"][self.id]["legend"][i]: undef;
							      			var dictLegend = self.audit=== "picanet"? $Q.Picanet['variableDict'][d]: $Q.Minap['variableDict'][d];
							      			var descLegend = self.parent.control.getVarDesc(d);

							      			var name = dictLegend ||  descLegend || d;
							      	

											div.transition()
									      		.duration(200)
									      		.style("opacity", 0.8)
									      		.style("width", "160px")
									      		.style("height", "70px")
									      		.style("background-color", "white")
									      		.style("vertical-align", "center");
									      	div .html( name + "")
									      		.style("left", (d3.event.pageX) -28 + "px")
									      		.style("top", (d3.event.pageY + 28) + "px");
									      	
										     
										})
										.on("mouseout", function(d){
											div.transition()
									      		.duration(500)
									      		.style("opacity", 0);
									      	
											d3.select(this).select("rect").style("fill", function(d){
												var a = d3.select(this).attr("active");
												return a === "1"? "white" : "lightgrey"; 
											});												
										});


									tabs.append("rect")
										.attr("class", "rtabs"+self.id)
										.attr("x", 0)
										.attr("y", 0)
										.attr("width", tabW )
										.attr("active", function(d,i){
											if(self.state['selectedCat'])
												return i===(cats['cats'].indexOf(self.state['selectedCat']))? 1: 0; 											 	
											return i===0? 1 : 0; 
										})
										.attr("height", 15 )
										.style("fill", function(d){
											var a = d3.select(this).attr("active");
											return a === "1"? "white" : "lightgrey"; 
										})
										.style("rx", 5)
										.style("stroke", function(d){
											var a = d3.select(this).attr("active");
											return a === "1"? "black" : "white"; 
										});

							tabs.append("text")
								.attr("dy", "1.2em")
								.attr("dx", ".3em")
							    .text(function(d) { return auditVars["variableDict"][d] || d; })
							    .style("font", "9px sans-serif")
							     .style("text-anchor", "bottom");
							
							if(self.state['selectedCat']){
								cat1 = self.state['selectedCat'];
								catdata = self.getCatData(cat1, cats); //cats['data'][cat1];
							}
							self.subVis1 = new $Q.SubPieChart(self.id, cat1, catdata , self, ssvgW-10, ssvgH-10);

						},
						createSlave2: function(slaves, ssvgW, ssvgH, xoffset){
							var self = this;
							//////console.log(qdata);
							var quantityNames = slaves['quants']; 
							var div = d3.select("body").append("div")	
									    .attr("class", "tooltip")				
									    .style("opacity", 0);

							var auditVars = self.parent.control.audit === "picanet"? $Q.Picanet: $Q.Minap;
							//exclude quantities that are already included in the main view 
							var mainQs = self.parent.control.audit === "picanet"? ($Q.Picanet["displayVariables"][self.id]["y"]):
																				 ($Q.Minap["displayVariables"][self.id]["y"]);

							if(!self.isTrellisView()){
								if(mainQs.constructor === Array){
									mainQs.forEach(function(q){
										var index = quantityNames.indexOf(q);
										if(index >=0)
											quantityNames.splice(index,1); 
									});
								}
								//else{
								//	quantityNames.splice(quantityNames.indexOf(mainQs));
								//}

								quantityNames.forEach(function(q, i){
									var index = mainQs.indexOf(q['q']);
									var first = quantityNames.indexOf(q); 
									if(index >=0 || first !== i){
										quantityNames.splice(i,1);
										//self.cardPalette.splice(i,1); 
									}
								});
							}
						   	var palette = self.getCardPalette(); 
						   	quantityNames.forEach(function(d,i){
						   		self.cardPalette[d['q']] = palette[i];
						   	});

							var tabW = ssvgW/ quantityNames.length;

							self.ssvg2div =d3.select("#draw-area"+self.id).append("div")	
											.attr("class", "ssvgdiv"+self.id)																																												
											.style("max-width", ssvgW+"px")
											.style("max-height", ssvgH+"px")	
											.style("position", "absolute")
											.style("top", (ssvgH + 3)+"px")
											.style("left", xoffset+"px")
											.style("border", "1px solid black");											

							self.ssvg2 = self.ssvg2div.append("svg")
											.attr("id", "ssvg2"+self.id)
											.attr("class", "ssvg"+self.id)
											.style("display", "inline-block")
											.attr("width", ssvgW)
											.attr("height", ssvgH);													
						
																			
							var tabs = self.ssvg2.selectAll(".qtabs"+self.id)
										.data(quantityNames)
										.enter().append("g")
										.attr("class", "qstabs"+self.id)
										.attr("transform", function(d, i){
											return "translate("+ (i*tabW) + ",0)"; 
										})
										.on("click", function(d, i){
											// deselect all tabs
											var all = d3.selectAll(".rqtabs"+self.id);
												all.attr("active", 0);
												all.style("fill", "lightgrey");
												all.style("stroke", "white");

											// select only current tab
											var r = d3.select(this).select("rect");
												r.attr("active", 1);
												r.style("fill", "white");
												r.style("stroke", "black");			
											
											qdata = slaves['data'][d['q']];
											////console.log(qdata);
											self.subVis2.draw(self.id, self.cardPalette[d['q']], d['q'], qdata , self, ssvgW-10, ssvgH-10);
											

										})
										.on("mouseover", function(d){
											d3.select(this).select("rect").style("fill", "white");
											//d3.select(this).style("fill", "white");
											var qname = auditVars["variableDict"][d['q']] || d['q'];
											div.transition()
									      		.duration(200)
									      		.style("opacity", 0.8)
									      		.style("width", "160px")
									      		.style("height", "70px")
									      		.style("background-color", "white")
									      		.style("vertical-align", "center");
									      	div .html( qname + "")
									      		.style("left", (d3.event.pageX) -28 + "px")
									      		.style("top", (d3.event.pageY + 28) + "px");
									      	
										     
										})
										.on("mouseout", function(d){
											div.transition()
									      		.duration(500)
									      		.style("opacity", 0);
									      	
											d3.select(this).select("rect").style("fill", function(d){
												var a = d3.select(this).attr("active");
												return a === "1"? "white" : "lightgrey"; 
											});												
										});


							tabs.append("rect")
								.attr("class", "rqtabs"+self.id)
								.attr("x", 0)
								.attr("y", 0)
								.attr("width", tabW )
								.attr("active", function(d,i){
									return i===0? 1 : 0; 
								})
								.attr("height", 15 )
								.style("fill", function(d){
									var a = d3.select(this).attr("active");
									return a === "1"? "white" : "lightgrey"; 
								})
								.style("rx", 5)
								.style("stroke", function(d){
									var a = d3.select(this).attr("active");
									return a === "1"? "black" : "white"; 
								});

							tabs.append("text")
								.attr("dy", "1.2em")
								.attr("dx", "1.3em")
							    .text(function(d) { 
							    	return auditVars["variableDict"][d['q']] || d['q']; })
							    .style("font", "9px sans-serif")
							     .style("text-anchor", "bottom");
							
							var quant1 = quantityNames[0]['q'];
							var qdata = slaves['data'][quant1];
							
							self.subVis2 = new $Q.SubBarChart(self.id, self.cardPalette[quant1], quant1, qdata , self, ssvgW-10, ssvgH-10);

						},
						createSlave3: function(slaves, ssvgW, ssvgH, xoffset){
							var self = this;
							
							var tabW = ssvgW/ slaves['combo'].length;
							self.ssvg3div =d3.select("#draw-area"+self.id).append("div")	
											.attr("class", "ssvgdiv"+self.id)																					
											.style("max-width", ssvgW+"px")
											.style("max-height", ssvgH+"px")	
											.style("position", "absolute")
											.style("top", (ssvgH*2 + 3)+"px")
											.style("left", xoffset+"px")
											.style("border", "1px solid black");											

							self.ssvg3 = self.ssvg3div.append("svg")
											.attr("id", "ssvg3"+self.id)
											.attr("class", "ssvg"+self.id)
											.style("display", "inline-block")
											.attr("width", ssvgW)
											.attr("height", ssvgH);													
						

							var ehrVar = self.parent.control.audit === "picanet"? $Q.Picanet["displayVariables"][self.id]["ehr"] 
																		:$Q.Minap["displayVariables"][self.id]["ehr"] ; 											
							var tabs = self.ssvg3.selectAll(".combstabs"+self.id)
										.data(ehrVar)
										.enter().append("g")
										.attr("class", "combstabs"+self.id)
										.attr("transform", function(d, i){
											return "translate("+ (i*tabW) + ",0)"; 
										})
										.on("click", function(d){
											// deselect all tabs
											var all = d3.selectAll(".combstabs"+self.id);
											all.attr("active", 0);
											all.style("fill", "lightgrey");
											all.style("stroke", "white");

											// select only current tab
											var r = d3.select(this).select("rect");
												r.attr("active", 1);
												r.style("fill", "white");
												r.style("stroke", "black");			
											
											//catdata = cats['data'][d];
											//self.subVis1.draw(self.id, catdata , self, ssvgW-10, ssvgH-10);

										})
										.on("mouseover", function(d){
											d3.select(this).select("rect").style("fill", "white");
											//d3.select(this).style("fill", "white");
										     
										})
										.on("mouseout", function(d){
											d3.select(this).select("rect").style("fill", function(d){
												var a = d3.select(this).attr("active");
												return a === "1"? "white" : "lightgrey"; 
											});												
										});


									tabs.append("rect")
										.attr("class", "rtabs"+self.id)
										.attr("x", 0)
										.attr("y", 0)
										.attr("width", tabW )
										.attr("active", function(d,i){
											return i===0? 1 : 0; 
										})
										.attr("height", 15 )
										.style("fill", function(d){
											var a = d3.select(this).attr("active");
											return a === "1"? "white" : "lightgrey"; 
										})
										.style("rx", 5)
										.style("stroke", function(d){
											var a = d3.select(this).attr("active");
											return a === "1"? "black" : "white"; 
										});

							tabs.append("text")
								.attr("dy", "1.2em")
								.attr("dx", ".3em")
							    .text(function(d) { return d; })
							    .style("font", "8px sans-serif")
							     .style("text-anchor", "bottom")
							     ;
							
							//var comb = slaves['combo'][0]; 
							//var combodata = slaves['data'][comb];
							var ehr = self.parent.control.getEHR(); 
							//self.subVis3 = new $Q.SubScatterChart(self.id, comb , combodata , self, ssvgW-10, ssvgH-10);
							self.subVis3 = new $Q.SubScatterChart(self.id, ehr , self, ssvgW-10, ssvgH-10);


						},
						createSlaveT: function(slaves, mainsvgW, drawAreaW, ssvgH, xoffset){
							var self = this;
							
							var tdata = self.parent.control.getTimeHier(self.id); 
							var div = d3.select("body").append("div")	
									    .attr("class", "tooltip")				
									    .style("opacity", 0);

							self.tView = "series";
							var auditVars = self.parent.control.audit === "picanet"? $Q.Picanet: $Q.Minap;
							var span = auditVars['displayVariables'][self.id]['granT'];
							// filter tspan to remove the first time granularity, which is already displayed in the main view
							//var index = tspan.indexOf("monthly");
							var tspan = Object.keys(span);
							var numtabs = span[tspan[0]].length; 
							
							self.ssvgtdiv =d3.select("#draw-area"+self.id).append("div")	
											.attr("id", "ssvgtdiv"+self.id)																					
											.style("max-width", (drawAreaW-20)+"px")
											.style("max-height", ssvgH+"px")	
											.style("position", "absolute")
											.style("bottom", "10px")
											.style("left", "10px")
											.style("overflow-x", "hidden")
											.style("overflow-y", "hidden")
											.style("border", "1px solid black");											

							self.ssvgt = self.ssvgtdiv.append("svg")
											.style("display", "inline-block")
											.attr("id", "ssvgt"+self.id)
											.attr("class", "ssvg"+self.id)
											.attr("width", mainsvgW*2)
											.attr("height", ssvgH);	
																			
							
							var tabW = mainsvgW/ numtabs * 1.5;
							
							var tabs = self.ssvgt.selectAll(".sttabs"+self.id)
										.data(span[tspan[0]])
										.enter().append("g")
										.attr("class", "sttabs"+self.id)
										.attr("transform", function(d, i){
											return "translate("+ (i*tabW) + ",0)"; 
										})
										.on("click", function(d){
											// deselect all tabs
											var all = d3.selectAll(".rttabs"+self.id);
											all.attr("active", 0);
											all.style("fill", "lightgrey");
											all.style("stroke", "white");

											// select only current tab
											var r = d3.select(this).select("rect");
												r.attr("active", 1);
												r.style("fill", "white");
												r.style("stroke", "black");			
											
											self.state['selectedTime'] = d;
											self.state['tspan'] = tspan[0];
											self.state['timeData'] = tdata;
											self.state['timeW'] = mainsvgW-10;
											self.state['timeH'] = ssvgH-10;
											self.subVisT.draw(self.id, d , tspan[0], tdata , self, mainsvgW-10, ssvgH-10, self.tView);				

										})
										.on("mouseover", function(d, i){
											d3.select(this).select("rect").style("fill", "white");
											//d3.select(this).style("fill", "white");
											var undef; 
							    	var mssLegend = auditVars["displayVariables"][self.id]["legend"]? auditVars["displayVariables"][self.id]["legend"][i]: undef;
							      	var dictLegend = auditVars['variableDict'][d];
							      	var descLegend = self.parent.control.getVarDesc(d);

							      	var name = mssLegend || dictLegend ||  descLegend || d;
							      	
											div.transition()
									      		.duration(200)
									      		.style("opacity", 0.8)
									      		.style("width", "160px")
									      		.style("height", "70px")
									      		.style("background-color", "white")
									      		.style("vertical-align", "center");
									      	div .html( name + "")
									      		.style("left", (d3.event.pageX) -28 + "px")
									      		.style("top", (d3.event.pageY + 28) + "px");
									      	
										     
										})
										.on("mouseout", function(d){
											div.transition()
									      		.duration(500)
									      		.style("opacity", 0);
									      	
											d3.select(this).select("rect").style("fill", function(d){
												var a = d3.select(this).attr("active");
												return a === "1"? "white" : "lightgrey"; 
											});												
										});

									tabs.append("rect")
										.attr("class", "rttabs"+self.id)
										.attr("x", 0)
										.attr("y", 0)
										.attr("width", tabW )
										.attr("active", function(d,i){
											return i===0? 1 : 0; 
										})
										.attr("height", 15 )
										.style("fill", function(d){
											var a = d3.select(this).attr("active");
											return a === "1"? "white" : "lightgrey"; 
										})
										.style("rx", 5)
										.style("stroke", function(d){
											var a = d3.select(this).attr("active");
											return a === "1"? "black" : "white"; 
										});

							tabs.append("text")
								.attr("dy", "1.2em")
								.attr("dx", "1.3em")
							    .text(function(d, i) { 
							    	////console.log(d);
							    	var undef; 
							    	var mssLegend = auditVars["displayVariables"][self.id]["legend"]? auditVars["displayVariables"][self.id]["legend"][i]: undef;
							      	var dictLegend = auditVars['variableDict'][d];
							      	var descLegend = self.parent.control.getVarDesc(d);

							      	var name = mssLegend || dictLegend ||  descLegend || d;
							      	
							    	return name; })
							    .style("font", "10px sans-serif")
							     .style("text-anchor", "bottom");

							self.state['selectedTime'] = span[tspan[0]][0];
							self.state['tspan'] = tspan[0];
							self.state['timeData'] = tdata;
							self.state['timeW'] = mainsvgW-10;
							self.state['timeH'] = ssvgH-10;
							
							self.subVisT = new $Q.SubTimeChart(self.id, span[tspan[0]][0] , tspan[0], tdata , self, mainsvgW-10, ssvgH-10, self.tView);						
						},
						nohighlight: function(){
							var self = this;
							if(self.selectionEmpty())
								self.vis.removeShade(); 
							else{
								self.vis.highlightSelected(); 

							}
						},
						highlight: function(hdata, viewId){
							var self = this ;
							if(self.selectionEmpty())
								self.vis.highlight(hdata, viewId);
							else{
								self.vis.nohighlight(); 
								// intersect with existing selection								
								var tempsel = {};
								for(var k in hdata){
									tempsel[k] = {};
									for(var kk in hdata[k]){
										tempsel[k][kk] = {};
										tempsel[k][kk]['data'] = [];
										tempsel[k][kk]['value'] = 0; 
										if(self.selection[kk]){
											var data = Object.keys(self.selection[kk]);
											data.forEach(function(d){
												if(hdata[k][kk]['data'].indexOf(parseInt(d))>=0){
													tempsel[k][kk]['data'].push(parseInt(d));
													tempsel[k][kk]['value']++;
												}
											});
										}
									}
								}
								self.vis.highlight(tempsel, viewId); 
							}

						},
						highlightSubs: function(key, recIds, tid, selected){
							var self = this; 
							if(self.selectionEmpty()){
								if(self.subVis1) self.subVis1.highlight(recIds);
								if(self.subVis2) self.subVis2.highlight(tid);	
							}
							else{
								// use recIds to expand selection temporarily then highlight subs 
								var tempsel = [];
								for(var sel in self.selection){
									var existing = Object.keys(self.selection[sel]);
									existing.forEach(function(ex){
										tempsel.push(parseInt(ex));
									});									
								}
								recIds.forEach(function(d){
									if(tempsel.indexOf(d) < 0)
										tempsel.push(d);									
								});									
								if(self.subVis1) self.subVis1.highlight(tempsel);									
							}

							
						},
						keepHighlights: function(){
							var self = this;
							if(self.selectionEmpty())
								return;
							
							var tempsel = [];
								for(var sel in self.selection){
									var existing = Object.keys(self.selection[sel]);
									existing.forEach(function(ex){
										tempsel.push(parseInt(ex));
									});									
								}
								self.localSelection = tempsel; 
								if(self.subVis1) self.subVis1.highlight(tempsel);									
						},
						nohighlightSubs: function(){
							var self = this;
							if(self.selectionEmpty()){
								if(self.subVis1) self.subVis1.nohighlight();		
								if(self.subVis2) self.subVis2.nohighlight();		
							}
							else{
								// only keep the selected records highlighted								
								var tempsel = [];
								for(var sel in self.selection){
									var existing = Object.keys(self.selection[sel]);
									existing.forEach(function(ex){
										tempsel.push(parseInt(ex));
									});									
								}		
								if(self.subVis1) self.subVis1.highlight(tempsel);		
							}
							
						},
						resizeVis: function(refresh){
							var self = this;
							d3.select("#sel"+self.id).style("width", "60%"); 
							d3.select("#panel"+self.id)
								.style("visibility", "hidden");

							self.vis.resize(); 
							var mainsvgW = parseInt(self.vis.getMainSVG(self.id).style("width"));
							var drawAreaW = parseInt(d3.select("#draw-area"+self.id).style("width"));
							var ssvgW = drawAreaW - mainsvgW - 40; 
							var xoffset = mainsvgW + 30 ;
							var mainsvgH = parseInt(self.vis.getMainSVG(self.id).style("height"));
							var drawAreaH = parseInt(d3.select("#draw-area"+self.id).style("height"));
							var ssvgH = drawAreaH / 3; 
							
								
							if(self.expanded){
								d3.select("#sel"+self.id).style("margin-left", "1%"); 
								d3.select("#sel"+self.id).style("width", "48%"); 
								if(self.ssvg1){
									// remove existing slaves if they exist
									// this is to create them anew and position them
									// according to the newly resized card dimensions
																	
									var undef;								
									d3.selectAll(".ssvg"+self.id).remove(); 
									d3.selectAll("#ssvgtdiv"+self.id).remove();
									d3.selectAll(".ssvgdiv"+self.id).remove();
									self.ssvg1 = undef;
									self.ssvg2 = undef;
									self.ssvg3 = undef;
									self.ssvgt = undef;
									
								}
								d3.select("#panel"+self.id)
									.style("visibility", "visible");

								// populate the first slave
								var slaves = self.getSlaves(); 
								//self.parent.control.addCardExpand(self.metric);
								self.parent.control.updateSessionLog({'type': 'expand' , 
											'owner': 'card' , 
											'params': {'metric': self.metric}
										});
								// handle the first visualization: a categorical
								
								self.createSlave1(slaves, ssvgW, ssvgH, xoffset);
								self.createSlave2(slaves, ssvgW, ssvgH, xoffset);
								//self.createSlave3(slaves, ssvgW, ssvgH, xoffset);
								self.createSlaveT(slaves, mainsvgW, drawAreaW, ssvgH, xoffset);	
								
							}
							else if(!refresh || ((xoffset + ssvgW) > drawAreaW)){
								d3.select("#sel"+self.id).style("margin-left", "0%"); 
								var undef;								
								d3.selectAll(".ssvg"+self.id).remove(); 
								d3.selectAll("#ssvgtdiv"+self.id).remove();
								d3.selectAll(".ssvgdiv"+self.id).remove();
								self.ssvg1 = undef;
								self.ssvg2 = undef;
								self.ssvg3 = undef;
								self.ssvgt = undef;
								self.expanded = false; 
								self.vis.resize();  
							}
							
						},
						updateCats: function(newcats){
							var self = this; 
							var mainsvgW = parseInt(self.vis.getMainSVG(self.id).style("width"));
							var drawAreaW = parseInt(d3.select("#draw-area"+self.id).style("width"));
							var ssvgW = drawAreaW - mainsvgW - 40; 
							var xoffset = mainsvgW + 30 ;
							var drawAreaH = parseInt(d3.select("#draw-area"+self.id).style("height"));
							var ssvgH = drawAreaH / 3; 
							var slaves = self.getSlaves();
							self.createSlave1(slaves, ssvgW, ssvgH, xoffset);							
						},
						updateQs: function(newQs){
							var self = this; 
							var mainsvgW = parseInt(self.vis.getMainSVG(self.id).style("width"));
							var drawAreaW = parseInt(d3.select("#draw-area"+self.id).style("width"));
							var ssvgW = drawAreaW - mainsvgW - 40; 
							var xoffset = mainsvgW + 30 ;
							var drawAreaH = parseInt(d3.select("#draw-area"+self.id).style("height"));
							var ssvgH = drawAreaH / 3; 
							var slaves = self.getSlaves();
							self.createSlave2(slaves, ssvgW, ssvgH, xoffset);							

						},
						getSelection: function(){
							return this.selection; 
						},
						updateSelection: function(key, newIds, union, intersect, subtract){
							var self = this;							
							document.getElementById("export-btn"+self.id).disabled = false;
							if(!self.selection){
								self.selection = {};
							}
							if(!self.selection[key])
								self.selection[key] = {};

							if(union)
								newIds.forEach(function(d){
									self.selection[key][d] = self.parent.control.getRecordById(d);
								});
							
							else if(intersect){
								var tempIntersect = {};
								tempIntersect[key] = {};
								newIds.forEach(function(d){
									if(self.selection[key][d])
										tempIntersect[key][d] = self.selection[key][d]; 									
										
								});
								self.selection = tempIntersect; 
							}
							else if(subtract){
								newIds.forEach(function(id){
									delete self.selection[key][id];
								});							

							}
							console.log(self.selection); 
						},						
						getSlaves: function(){
								var self = this;
								return self.parent.getSlaves(self.id);
							},
						saveSubSVGs: function(){
							var self = this;
							if(self.ssvg1){
								self.saveSVG("#ssvg1"+self.id, self.metric+"category.png");
							}
							if(self.ssvg2){
								self.saveSVG("#ssvg2"+self.id, self.metric+"quantity.png");	
							}
							if(self.ssvgt){
								self.saveSVG("#ssvgt"+self.id, self.metric+"timeView.png");	
							}

						},
						saveSVG: function(svg, name){
							var self = this;
							var svgEl = $(svg)[0];							
							//console.log(name); 
							svgEl.setAttribute("xmlns", "http://www.w3.org/2000/svg");
						    var svgData = svgEl.outerHTML;
						    var preface = '<?xml version="1.0" standalone="no"?>\r\n';
						    var svgBlob = new Blob([preface, svgData], {type:"image/svg+xml;charset=utf-8"});
						    var svgUrl = URL.createObjectURL(svgBlob);
						    
						    canvg('canvas', svgData);
						    var canvas = document.getElementById("canvas");
							var img = canvas.toDataURL("image/png");

							var downloadLink = document.createElement("a");
						    //downloadLink.href = svgUrl;
						    downloadLink.href = img;
						    downloadLink.download = name;
						    document.body.appendChild(downloadLink);
						    downloadLink.click();
						    document.body.removeChild(downloadLink);

						    self.parent.control.updateSessionLog({'type': 'save' , 
											'owner': 'card' , 
											'params': {'filename': name}
										});
								

						},
						createHeader: function(container, viewId){
							var self = this; 
							var header = container.append("div")
									.attr("id", "header"+viewId)
									.attr("class", "form-inline")
									.style("text-align", "left")
									.style("max-height", 35)
									.style("width", "99%")
									.style("margin-left", "3px")
									.style("overflow", "hidden")
										.append("div").attr("class", "form-group")
											//.style("height", 43)
											.style("width", "90%")
											.style("max-height", 45)
											.style("vertical-align", "top")
											.style("text-align", "left")
											.style("padding-top", 0)											
											.style("margin-top", 0); 

							var metricSelect = header.append("div")
												//.attr("name", "metricselector")
												.attr("class", "form-control")
												.style("vertical-align", "top")
												.attr("id", "sel"+viewId)
												.style("width", "50%")	
												.style("background-color", "white")																							
												.style("text-align", "center")
												.style("position", "absolute")												
												.style("left", "0px")
												.style("margin-left", "0px")
												.style("min-height", "25px")
												.style("border-radius", "0px")												
												.text("["+ self.year + "] "+ self.parent.availMetrics[viewId]['text'])
													.style("font-weight", "bold")
													.style("font-family", "sans-serif")
													.style("font-size", "11pt");
												/*.on("change", function(d){													
													////////console.log(this.value);													
													self.parent.control.updateMetrics(viewId, this.value); 											
													var dv = self.parent.getMetricDataView(this.value);													
													////////console.log(dv); 
													//TODO: reset here the grouping variables and dicts of this view
													self.parent.control.resetCategoricals(viewId); 
													self.drawBarChart(viewId, dv['data']);
												});*/

							document.getElementById("sel"+viewId).disabled = true;
							
							
							
							var curMetric = self.parent.availMetrics[(viewId%self.parent.availMetrics.length)]['value'];
							self.metric = curMetric; 
							////////////console.log(curMetric);
							$('#sel'+viewId).val(curMetric);
							$('.selectpicker').selectpicker('refresh');

							var downloadBtn = header.append("button")
												.attr("type", "button")
												.attr("class", "form-control ctrl-btn fa fa-download")
												.attr("id", "download-btn"+viewId)
												.style("font-size", "9pt")
												.style("vertical-align", "top")
												.style("horizontal-align", "right")												
												.style("min-width", "40px")
												.style("min-height", "24px")
												.style("position", "relative")
												.style("left", "40%")
												.style("background-color", "lightgrey")
												.style("color", "black")
												.on("click", function(){
													self.vis.saveSVG(); 
													self.saveSubSVGs();
												});
							
												//.text("Toggle View"); 
							var exportTableBtn = header.append("button")
												.attr("type", "button")
												.attr("title", "Export to table")
												.attr("class", "form-control ctrl-btn fa fa-table")
												.attr("id", "export-btn"+viewId)
												.attr("disabled", "true")
												.style("font-size", "9pt")
												.style("vertical-align", "top")
												.style("horizontal-align", "right")												
												.style("min-width", "40px")
												.style("min-height", "24px")
												.style("position", "relative")
												.style("left", "40%")
												.style("background-color", "lightgrey")
												.style("color", "black")
												.on("click", function(){
												  		//console.log(self.selection);	
												  		 $('[href="#tabCanvas"]').tab('show');						  		
												  		
												  		var tabContents = self.parent.setTableTabs(Object.keys(self.selection), self);
												  		
												  		for(var key in self.selection){
												  			if(!isEmpty(self.selection[key])){
												  				tabContents[key].append("p")
														  				.style("font-size", "16pt")
														  				.text("Data exported from card: "+ self.metric);
														  			tabContents[key].append("p")
														  					.style("font-size", "12pt")
														  					.text("Selected variable: "+ key);
														  					
														  			tabContents[key].append("p")
														  					.style("font-size", "12pt")
														  					.text("Number of selected records: "+ Object.keys(self.selection[key]).length);
														  			var table = tabContents[key].append('table').attr("id", "spreadsheet-"+key);
																	var thead = table.append('thead');
																	var	tbody = table.append('tbody');
																	var columns = Object.keys(self.selection[key][Object.keys(self.selection[key])[0]]);
																	var data = [];
																	for(var kk in self.selection[key]){
																		data.push(self.selection[key][kk]);
																	}
																	// append the header row
																	thead.append('tr')
																	  .selectAll('th')
																	  .data(columns).enter()
																	  .append('th')
																	    .text(function (column) { return column; });
																	 // create a row for each object in the data
																	var rows = tbody.selectAll('tr')
																	  .data(data)
																	  .enter()
																	  .append('tr');

																	// create a cell in each row for each column
																	var cells = rows.selectAll('td')
																			  .data(function (row) {
																			    return columns.map(function (column) {
																			      return {column: column, value: row[column]};
																			    });
																			  })
																			  .enter()
																			  .append('td')
																			    .text(function (d) { return d.value; });


																		}
														  			} 
														  			self.parent.control.updateSessionLog({'type': 'tableExport' , 
																			'owner': 'card' , 
																			'params': {'metric': self.metric}
																		});
								
							
												});
									
							var expandViewBtn = header.append("button")
												.attr("type", "button")
												.attr("class", "form-control ctrl-btn fa fa-expand")
												.attr("id", "expand-btn"+viewId)
												.style("font-size", "9pt")
												.style("vertical-align", "top")
												.style("horizontal-align", "right")												
												.style("min-width", "40px")
												.style("min-height", "24px")
												.style("position", "relative")
												.style("left", "40%")
												.style("background-color", "lightgrey")
												.style("color", "black")
												.on("click", function(){
													var curh = parseInt($("#cardcontainer"+self.id).css("height")),
													curw = parseInt($("#cardcontainer"+self.id).css("width"));
												
													if(self.expanded === false)
													{  // grow
														////////console.log("growing from "+ curh);
														curh *= 2;
														curw *= 2;	
														self.expanded = true; 
													}
													else
													{   // shrink
														////////console.log("shrinking from "+ curh);
														curh /= 2;
														curw /= 2; 
														self.expanded = false; 
													}
													$("#cardcontainer"+ self.id).css("height", curh+"px"); 
													$("#cardcontainer"+ self.id).css("width", curw+"px"); 
													self.parent.refreshGrid(1); 
													self.resizeVis();
												});
							function isEmpty(obj) {
								    for(var key in obj) {
								        if(obj.hasOwnProperty(key))
								            return false;
								    }
								    return true;
								}
							/*
							var viewSelect = header.append("select")
												.attr("name", "viewselector")
												.attr("class", "form-control")
												.attr("id", "vsel"+viewId)
												.style("font-size", "9pt")
												.style("vertical-align", "top")
												.style("horizontal-align", "right")
												.style("position", "relative")
												.style("left", "46%")
												.style("right", "10px")
												.style("min-width", "33%")
												.on("change", function(){
													//var dataViews = self.parent.control.getDataViews(); 
													////////console.log(dataViews[viewId]); 
													//self.populateCard(dataViews[viewId]); 
													self.vis.toggleView(viewId, this.value);
												});
							
								viewSelect.append("option")
											.attr("value", "grouped")
											.text("Grouped bars")
											.style("font-size", "9pt");
								viewSelect.append("option")
											.attr("value", "stacked")
											.text("Stacked bars")
											.style("font-size", "9pt");
								/*viewSelect.append("option")
											.attr("value", "trellis")
											.text("Trellis")
											.style("font-size", "9pt");
							/*for(var m = 0; m < self.parent.availViews.length; m++){
								viewSelect.append("option")
											.attr("value", self.parent.availViews[m]['value'])
											.text(self.parent.availViews[m]['text'])
											.style("font-size", "9pt");
								}*/

							$(".ctrl-btn").on("dblclick", function(e){
								e.stopPropagation(); 
							});


							
						},
						tableToCSV: function(key){							
							var self = this;							
							

							
						},
						createButtons: function(panel, viewId){
							var self = this; 

							var pbody = panel;
							var undef; 
							self.btn_data = [ 
											{"id": "split-btn"+viewId, "class": "ctrl-btn fa fa-plus", "data-toggle": "popover", "hidden": false, "data-popover-content":"#pp"+viewId}, 											
											{"id": "axes-btn"+viewId, "class": "ctrl-btn fa fa-plus", "data-toggle": "popover", "hidden": false, "data-popover-content":"#aa"+viewId},
											//{"id": "time-btn"+viewId, "class": "ctrl-btn fa fa-line-chart", "data-toggle": "popover", "hidden": false, "data-popover-content":"#grantpp"+viewId}
											{"id": "time-btn"+viewId, "class": "ctrl-btn fa fa-line-chart", "data-toggle": "none", "hidden": false}
											]; 

							
							//pbody.style("background-color", "red");
							var divs = pbody.selectAll(".ctrl-btn")
											.data(self.btn_data)
											.enter().append("div")
											.style("background-color", "darkgrey")
											.style("max-height", "12%")
											.style("margin-left", "0px"); 

							divs.append("button")
								.attr("type", "button")
								.attr("id", function(d){
									return d["id"]; 
								})
								.attr("class", function(d){
									return d["class"]; 
								})
								.attr("data-toggle", function(d){
									return d["data-toggle"]; 
								})
								.attr("data-placement", function(d){
										//if(viewId%3 === 0)
										//	return "bottom";
										//else
										//	return "left"; 
										return "right";
									})
								.attr("data-popover-content",function(d){
									return d["data-popover-content"];
								})
								.attr("hidden", function(d){
									if(d["hidden"]) return true; 
									else 
										return undef; 
								})
								.style("max-width", "90%")
								.style("min-height", "25px")
								.style("vertical-align", "top")
								.style("background-color", "lightgrey")
								.style("position", "relative")
								.style("top", function(d,i){
									var drawAreaH = parseInt(d3.select("#draw-area"+self.id).style("height"));
									var ssvgH = drawAreaH / 2; 
							
									return i<2?(i*ssvgH)+"px":  (i*ssvgH-10)+"px"; //(drawAreaH+80)+"px"; 
								})
								.style("color", "black"); 

							var split_ttip = $("#split-btn"+viewId).tooltip({    
							    placement : 'bottom', 
							    trigger: 'hover', 
							    title : "Add Category"         
							  });

							$("#split-btn"+viewId).on("dblclick", function(e){
								e.stopPropagation();
							});

							 $("#axes-btn"+viewId).tooltip({    
							    placement : 'bottom', 
							    trigger: 'hover', 
							    title : "Add Quantity"         
							  });    
							 $("#axes-btn"+viewId).on("dblclick", function(e){
								e.stopPropagation();
							});
							  
							/* $("#export-btn"+viewId).tooltip({    
							    placement : 'bottom', 
							    trigger: 'hover', 
							    title : "Export as table"         
							  }); 
							  $("#export-btn"+viewId).on("dblclick", function(e){
								e.stopPropagation();
								}); */  

							  $("#time-btn"+viewId).on("dblclick", function(e){
								e.stopPropagation();
								});

							  $("#time-btn"+viewId).on("click", function(e){
							  	self.updateTimeView(); 
							  });
							  var time_ttip = $("#time-btn"+viewId).tooltip({    
							    placement : 'bottom', 
							    trigger: 'hover', 
							    title : "Toggle Time View"         
							  });

							  /*d3.select("#export-btn"+viewId)							  	
							  	.on("click", function(){
							  	}); */
					
							  	
						},
						selectionEmpty: function(){
							var self = this;
							var isEmpty = true;
							if(!self.selection)
								return true; 
							for(var key in self.selection){
								var obj = self.selection[key]; 
								var condition = Object.keys(obj).length === 0 && obj.constructor === Object;
								if(!condition)
									isEmpty = false; 
							}
							return isEmpty; 
						},
						clearSelection: function(){
							var self = this;
							var undef; 
							self.selection = undef; 
						},
						getAuditInfo: function(){
							return this.parent.control.audit; 
						},
						getChartType: function(dataView){
							var self = this; 
							////////console.log(dataView); 
							var viewType; 
							if(dataView.mark){
								viewType = dataView.mark; 
							}
							else 
								viewType = $("#vsel"+self.id +' option:selected').val(); 
							////////console.log("TYPE = "+ viewType);
							return viewType; 

						},
						drawCatBar: function(displayId, data, cat, levels, trellis){
							var self = this;
							self.vis.drawCatBar(displayId, data, cat, levels, trellis);
						},
						populateCard: function(dataView){
							var self = this; 
							var chartType = self.getChartType(dataView); 
							
							if(chartType === 'bar')
								self.vis = new $Q.BarChart(dataView, self);
							else if(chartType === 'line')
								self.vis = new $Q.LineChart(dataView, self);
							else if(chartType === 'scatter')
								self.vis = new $Q.ScatterChart(dataView, self);
							else if(chartType === 'pie')
								self.vis = new $Q.PieChart(dataView, self); 
						},
						drawPieChart: function(dataView){
							var self = this; 
							//////console.log(dataView);
							var viewId = dataView['viewId'];
							var data = dataView['data'];
							

						},
						updateTimeView: function(){
							var self = this;
							//self.parent.control.addBtnClick();
							//console.log(self.id); 
							//console.log(viewType);  
							self.tView = self.tView==="series"? "multiples" : "series"; 

							self.subVisT.draw(self.id, self.state['selectedTime'] ,self.state['tspan'], self.state['timeData'] , self, 
											 self.state['timeW'], self.state['timeH'], self.tView);			
						},
						drawScatter: function(dataView){
							var self = this; 
							////////console.log(dataView);
							//scale function
							/*
							var xScale = d3.scaleLinear()
								//.domain(["Alabama","Alaska","Arizona","Arkansas","California"])
								.domain([0, d3.max(dataset, function(d) { return d[0]; })])
								//.range([padding, w-padding * 2]);
								.range([padding, w - padding * 2]);
								
							var yScale = d3.scaleLinear()
								.domain([0, d3.max(dataset, function(d) { return d[1]; })])
								//.range([padding, w-padding * 2]);
								.range([h - padding, padding]);
							
							var xAxis = d3.axisBottom().scale(xScale).ticks(5);
							
							var yAxis = d3.axisLeft().scale(yScale).ticks(5);
							
							//create svg element
							var svg = d3.select("body")
										.append("svg")
										.attr("width", w)
										.attr("height", h);
										
							svg.selectAll("circle")
								.data(dataset)
								.enter()
								.append("circle")
								.attr("cx", function(d) {
									return xScale(d[0]);
								})
								.attr("cy", function(d) {
									return h - yScale(d[1]);
								})
								.attr("r", 5)
								.attr("fill", "green");
								
							//x axis
							svg.append("g")
								.attr("class", "x axis")	
								.attr("transform", "translate(0," + (h - padding) + ")")
								.call(xAxis);
							
							//y axis
							svg.append("g")
								.attr("class", "y axis")	
								.attr("transform", "translate(" + padding + ", 0)")
								.call(yAxis);

								*/
			
						}
						
					});
	})(QUALDASH);	