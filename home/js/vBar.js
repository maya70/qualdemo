(function($Q){
	'use strict'
	$Q.BarChart = $Q.defineClass(
					null, 
					function BarChart(dataView, pCard){
						var self = this;						
						self.parent = pCard;
						self.audit = self.parent.getAuditInfo(); 
						self.id = dataView['viewId'];
						self.iter = 0; 	
						self.dataView = dataView; 
						self.dualData = [];
						// do we need dual axis?
						self.dualAxis = false;
						self.months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
						var yaggregates = self.audit === "picanet"? $Q.Picanet["displayVariables"][self.id]["yaggregates"]
																  : $Q.Minap["displayVariables"][self.id]["yaggregates"];
						var avgIndex = yaggregates.indexOf("average");
						var runningAvgIndex = yaggregates.indexOf("runningAvg");
						var avgIndex = avgIndex >=0? avgIndex : runningAvgIndex; 

						if(yaggregates.indexOf("count")>=0 && avgIndex >=0)
							{
								self.dualAxis = true; 
								// put the average on a dual axis
								var dualVarName = dataView['levels'][avgIndex];
								self.dualVarName = dualVarName; 
								for(var key in dataView['data']){
									// store the dual axis values
									var val = dataView['data'][key][dualVarName]['value'];
									var dat = dataView['data'][key][dualVarName]['data']; 
									self.dualData.push({'date': key , 'value': val, 'data': dat});	
									//delete dataView['data'][key][dualVarName]; 
								}
								dataView['levels'].splice(dataView['levels'].indexOf(dualVarName), 1);
								

								// remove the dual axis component from the bars

							}

						self.palette = {};
						self.leftMargin = 60; 
						self.highlightColor = pCard.parent.control.highlightColor; 
						self.highlightOpacity = 0.6;
						if(dataView.ylength < 10 ){
							//(dataView['yscale'][0] === dataView['yscale'][1])?
							 self.data = self.fixDataFormat(dataView['data']);		
							 self.drawCatBar2(dataView,0);
							 //: self.drawDualBar();
						}
						else{ // create a trellis
							self.istrellis = true; 
							self.data = self.audit=== "picanet"? self.trellisDataFormat(dataView['data']) : dataView['data'];		
							self.drawCatBar2(dataView,1);
						}

						
					},
					{
						saveSVG: function(){
							var self = this;
							var mainsvg = (self.cat)? "#mainsvg"+self.id+"_"+self.iter :".mainsvg"+self.id; 
							var svgEl = $(mainsvg)[0];
							var name =  self.parent["metric"]+".png"; 
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


						},
						getData: function(){
							return this;
						},
						highlight: function(hdata, viewId){
							var self = this; 
							if(self.dataView.ylength > 1 && self.cat){
								self.shadeCatBar(hdata, viewId);
							}	
							else{
								self.shadeTrellis(hdata, viewId);
							}
						},
						removeShade: function(){
							var self = this;
							self.parent.svg.selectAll(".shades").remove(); 
						},
						shadeTrellis: function(dict, viewId){
							var self = this; 
							
							
							var c =0; 
							self.cats.forEach(function(cat){		                            	
                            		var arr = [];
		                            for(var key in dict){
		                            	var newdict = {};
		                            	newdict["date"] = key;
		                            	newdict["number"] = dict[key][cat]["value"];
		                            	newdict["data"] = dict[key][cat]["data"];
		                            	arr.push(newdict);
		                            }			          
		                            
		                            self.shadeBaseBarTrellis(viewId, arr, cat, c);
		                            c++;
		                        });

						},
						shadeBaseBarTrellis: function(viewId, dict, cat, iter){
							var self = this;
							var viewshare = 2; 	

							var drawArea = d3.select("#draw-area"+viewId);
								//drawArea.style("overflow-y", "hidden");
										
					
							var parentArea = drawArea.select(function(){
								return this.parentNode; 
							});						
							
							var scale = 0.6; 

							var svgw = d3.select("#trellissvg"+viewId+"_"+iter).attr("width");
							var svgh = d3.select("#trellissvg"+viewId+"_"+iter).attr("height");

							// calculate new svg width and height based on the new card size
							//var svgw = parentW * scale / viewshare,
							//	svgh = parentH * scale / viewshare;
						
             				//var shift = self.parent.expanded? ((scale-1.0)*(1-scale)*parentArea.node().getBoundingClientRect().width) : 0; 
							var margin = {top: 20, right: 10, bottom: 20, left: 23};							
							var width = svgw - margin.left - margin.right - 23; 
							var height = svgh - margin.top - margin.bottom - 10;
							var x = d3.scaleBand().rangeRound([0, width]).padding(0.1), 
								y = d3.scaleLinear().range([height, 0]).nice(); 

							x.domain(dict.map(function(d){
								return d.date; 
							}));
							y.domain([0, d3.max(self.data, function(d){ return d.number; })]);	

							var svgsub = d3.select("#trellissvg"+viewId+"_"+iter);	
							var g = svgsub.append("g"); 
							g.selectAll(".shades")
								.data(dict).enter()
								.append("rect")
									.attr("class", "shades")
									.attr("x", function(d) { return x(d.date); })
									.attr("y", function(d) { return y(d.number); })
									.attr("width", x.bandwidth())
							      	.attr("height", function(d) { return height  - y(d.number); })
							      	.attr("transform", function() {return "translate("+ margin.left +","+margin.top +")";})
									.style("fill", self.highlightColor);
									//.style("opacity", self.highlightOpacity)
									//.style("stroke-width", 1.0)
									//.style("stroke", self.highlightColor); 
							
							      
						},
						shadeCatBar: function(dict, viewId){
							var self = this; 
							var undef;
                            var ordered = [];
                            
                            //////////console.log(temp); 
                            var orderedKeys = Object.keys(dict);
                            //////////console.log(orderedKeys);
                            var xz = orderedKeys,
                                yz = d3.range(self.levels.length).map(function(d){
                                    return Array.apply(null, Array(xz.length)).map(Number.prototype.valueOf,0);
                                });
                                for(var kx=0; kx < xz.length; kx++ ){
                                    for(var ky=0; ky < self.levels.length; ky++){  
                                     	yz[ky][kx] += dict[xz[kx]][self.levels[ky]]['value'];                                     
                                    }
                                }
                                
                               var y01z = d3.stack().keys(d3.range(self.levels.length))(d3.transpose(yz));
                                
                                    
                           	                            
							var drawArea = d3.select("#draw-area"+viewId);							
							var parentArea = drawArea.select(function(){
								return this.parentNode; 
							});
							
							var scale =  0.6; 
							var svgw = scale * parentArea.node().getBoundingClientRect().width;
							var svgh = scale * parentArea.node().getBoundingClientRect().height; 
							var shift = ((scale-1.0)*(1-scale)*parentArea.node().getBoundingClientRect().width); 
							
							var margin = {top: self.marginTop, right: 10, bottom: 80, left: self.leftMargin};							
							var width = svgw - margin.left - margin.right; 
							var height = svgh - margin.top - margin.bottom;
							
							//console.log(width);

							var g = self.parent.svg.append("g").attr("transform","translate(" + margin.left + "," + (margin.top) + ")" );
							
							var x = d3.scaleBand()
									    .domain(xz)
									    .rangeRound([0, (width-35)])
									    .padding(0.1);

							var y = d3.scaleLinear()
							    .domain([0, self.yMax])
							    .range([height, 0]);

							
							var series = g.selectAll(".shades")
							  .data(y01z)
							  .enter().append("g")
							  	.attr("class", "shades")
							  	.style("stroke-width", 2.0)
								.style("stroke", function(d){
									//console.log(self.palette[self.levels[d["index"]]]); 
									return self.palette[self.levels[d["index"]]]; 
								})
							    .attr("fill", function(d, i) { 
							    	return self.highlightColor; });
							    //.style("opacity", self.highlightOpacity)
							    //
								//.style("stroke", self.highlightColor); 
							
							 var count = -1; 
							 var rect = series.selectAll("rect.shade")
							  .data(function(d) { return d; })
							  .enter().append("rect")
							  	.attr("class", "shade")
							    .attr("x", function(d, i) { return x(i); })
							    .attr("y", height)
							    .attr("width", x.bandwidth())
							    .attr("height", 0)
							    .attr("id", function(d,i){
							    	count++;
							    	return i+"-"+parseInt(count / y01z[0].length); 
							    });
							   

							    rect.transition()
								    .delay(function(d, i) { return i * 10; })
								    .attr("y", function(d) { return y(d[1]); })
								    .attr("height", function(d) { 
								    	return y(d[0]) - y(d[1]); })
								    .call(changed);

												
							function changed() {
							  
							  //console.log(self.toggle);
							  if (self.toggle === "grouped")
							  	transitionGrouped();
							  else 
							    transitionStacked();
							}
						
						function transitionGrouped() {
							
							y.domain([0, self.yMax]);
						  rect.transition()
						      .duration(200)
						      .attr("x", function(d, i) {							         
						      	 return x(xz[i]) + x.bandwidth() / self.levels.length * this.parentNode.__data__.key; })
						      .attr("width", x.bandwidth() / self.levels.length)
						    .transition()
						      .attr("y", function(d) { 
						      	return y(d[1] - d[0]); })
						      .attr("height", function(d) { 
						      	var y00 = y(0); 
						      	return y00 - y(d[1] - d[0]); });
						}
						function transitionStacked() {
							 y.domain([0, self.yMax]);
						  
						  rect.transition()
						      .duration(200)
						      .delay(function(d, i) { return i * 10; })
						      .attr("y", function(d, i) { 
						      	var thisEntry = parseInt(Object.keys(self.dict)[0]) + i; 
						      	var dictEntry = self.dict[thisEntry+""]; 
						      	if(!dictEntry)
						      		return null; 
						      	var cat = parseInt(d3.select(this).attr("id").split("-")[1]); 
						      	var prevCatEndsAt = (cat === 0)? 0 : dictEntry[Object.keys(dictEntry)[cat-1]]['value']; 
						      	//var parent = dictEntry[Object.keys(dictEntry)[cat]]['value']; 
						      	var y00 = y(0); 						      	
						      	//console.log(y00);
						      	//var p = y(prevCatEndsAt);
						      	//var p1 = y(d[1]);
						      	return  y(d[1]-d[0]) - (y00 - y(prevCatEndsAt)); })
						      .attr("height", function(d) { 
						      	return y(d[0]) - y(d[1]); })
						    .transition()
						      .attr("x", function(d, i) { return x(xz[i]); })
						      .attr("width", x.bandwidth());
						}

						 
						
						},


						drawBaseBarTrellis: function(viewId, dict, cat, iter){
							var self = this; 
							var viewshare = 2; 							
							var drawArea = d3.select("#draw-area"+viewId);
								//drawArea.style("overflow-y", "hidden");
										
					
							var parentArea = drawArea.select(function(){
								return this.parentNode; 
							});
							
							var scale = self.parent.expanded? 0.6 : 0.9; 
							var svgw = scale * parentArea.node().getBoundingClientRect().width / viewshare ;
							var svgh = 0.9* parentArea.node().getBoundingClientRect().height / viewshare; 
						 	//var svgh = 100; 
							var shift = self.parent.expanded? ((scale-1.0)*(1-scale)*parentArea.node().getBoundingClientRect().width) : 0; 
							var margin = {top: 20, right: 10, bottom: 20, left: 23};							
							var width = svgw - margin.left - margin.right - 23; 
							var height = svgh - margin.top - margin.bottom - 10;

							var svgsub = self.parent.svg.append("svg")
											.attr("id", "trellissvg"+viewId+"_"+iter)
											.attr("class", "trellissvg"+viewId)
											.attr("width", svgw).attr("height", svgh)										
											.attr("x", ((iter%viewshare)*svgw) + 10 )
											.attr("y", parseInt(iter/viewshare)*svgh+ margin.top); 
							
							svgsub.append("text")
								.attr("x", 10)
								.attr("y", 10)
								.attr("dy", ".35em")							      
							      .text(function(d) {
							      	return cat ;})
							        .style("font-size", "7pt");
							
							var div = d3.select("body").append("div")	
									    .attr("class", "tooltip")				
									    .style("opacity", 0);

							
							var g = svgsub.append("g").attr("transform","translate(" + margin.left + "," + margin.top + ")" );
						     
							
							var x = d3.scaleBand().rangeRound([0, width]).padding(0.1), 
								y = d3.scaleLinear().range([height, 0]).nice(); 

							x.domain(self.data.map(function(d){
									return d.date; 
							}));
							y.domain([0, d3.max(self.data, function(d){ return d.number; })]);

							g.append("g")
							      .attr("class", "x axis")
							      .attr("transform", "translate("+ 0+"," + (height) + ")")
							      .call(d3.axisBottom(x))									
									.selectAll("text")	
										.text(function(d){
											return $Q.months[d-1]; 
										})	
								        .style("text-anchor", "end")
								        .attr("dx", "-.8em")
								        .attr("dy", ".15em")
								        .attr("transform", "rotate(-65)");

							g.append("g")
							      .attr("class", "y axis")
							      .call(d3.axisLeft(y).ticks(5,"s"))
							      .attr("transform", "translate("+0+","+ 0+")");
							
							g.selectAll(".bar")
							    .data(dict)
							    .enter().append("rect")
							      .attr("class", "bar")
							      .attr("x", function(d) { return x(d.date); })
							      .attr("y", function(d) { return y(d.number); })
							      .attr("width", x.bandwidth())
							      .attr("height", function(d) { return height  - y(d.number); })
							      .style("fill", function(d){
							      	return "black";
							      })
							      .on("mouseover", function(d){
							      	div.transition()
							      		.duration(200)
							      		.style("opacity", 0.9);
							      	div .html((d.date) + "<br/>" + (d.number+ ""))
							      		.style("left", (d3.event.pageX) + "px")
							      		.style("top", (d3.event.pageY - 28) + "px");
							      	d3.select(this).style("fill", self.highlightColor);
								      	/*.style("stroke-width", 1.0)
										.style("stroke", self.highlightColor)
										.style("opacity", self.highlightOpacity);*/
								      	
							      	self.parent.highlightSubs(cat, d['data'], parseInt(d['date']));
							      	
							      	
							      })
							      .on("mouseout", function(d){
							      	div.transition()
							      		.duration(500)
							      		.style("opacity", 0);
							      	//var sel = d3.select(this);
							      	var sel = d3.select(this);
							      	var as = sel.attr("selected");
							      	if(!as || as=== "false" ){
							      		sel.style("fill", self.palette[d[0]]);							      		
							      	}
							      	self.parent.nohighlightSubs(); 
							      	
							      })
							      .on("click", function(d,i){
							      	var selStatus = d3.select(this).attr("selected");
							      	if(!selStatus || selStatus === "false"){
							      		// set selection
								      	for(var key in dict[i+1]){
								      		if(dict[i+1][key]['value'] === (d[1] - d[0])){
								      				self.parent.updateSelection(key, dict[i+1][key]['data'], 1); 
								      			} 
								      	}							      	
								      	d3.select(this).attr("selected", true); 
								      }
								     else{
								     	// reset selection
								     	for(var key in dict[i+1]){
								      		if(dict[i+1][key]['value'] === (d[1] - d[0])){
								      				self.parent.updateSelection(key, dict[i+1][key]['data'], 0, 0, 1); 
								      			} 
								      	}							      	
								      	d3.select(this).attr("selected", false); 
								     }
							      });

									
						},
						drawDualBar: function(){
							var self = this;
							 

						},
						highlightSelected: function(){
							var self = this;
							self.removeShade(); 
							self.svg.selectAll(".bar").style("fill", function(d){
								var sel = d3.select(this);
								var as = sel.attr("selected");
							    if(!as || as=== "false" )
							      	return self.palette[d[0]];
								else
									return self.highlightColor;								
									
							})
						},
						nohighlight: function(){
							var self = this;
							self.svg.selectAll(".bar").style("fill", function(d){
								return self.palette[d[0]];
							})
						},
						drawCatBar2: function(dataView, trellis){
							var self = this; 
							if(trellis){
								self.drawBarTrellis(dataView['viewId'], dataView['data'], dataView['cats'], dataView['levels']);
							}
							else 
								self.drawCatBar(dataView['viewId'], dataView['data'], dataView['cats'], dataView['levels'], self.iter);
							//self.drawCatBar(viewId, self.dict, self.cat[viewId], self.levels, 0); 
							//drawCatBar(displayId, data, cat, levels,0);
						},
						drawCatBar: function(viewId, dict, cat, levels, iter, trellis){
							var self = this; 
								self.dict = dict;
								self.cat = {}; 	
								self.cat[viewId] = cat;
								self.levels = levels; 
								var undef;
								var auditVars = self.audit === "picanet"? $Q.Picanet : $Q.Minap; 
								var ordinalScale = auditVars['displayVariables'][viewId]['yType'] === "o"? 1 : 0; 
								self.toggle = auditVars["displayVariables"][viewId]["chart"]; 
								if(trellis)
									console.log("this is a trellis view");
								// sort dict by date
                                function custom_sort(a,b){
                                    return new Date("01-"+a).getTime() - new Date("01-"+b).getTime(); 
                                }
    							
    							d3.select("#toggle-btn"+viewId)
    								.attr("hidden", undef)    								
    								.on("click", function(){
										self.toggleBarView(viewId); 
									});
                               		
                  
								$("#toggle-btn"+viewId).tooltip({    
								    placement : 'bottom',  
								    title : "Toggle Main View"         
								  });     

                                var ordered = [];
                                var temp = Object.keys(dict);
                                //////////console.log(temp); 
                                var orderedKeys = Object.keys(dict).sort(custom_sort);
                                //////////console.log(orderedKeys);
                                var xz = orderedKeys,
                                    yz = d3.range(levels.length).map(function(d){
                                        return Array.apply(null, Array(xz.length)).map(Number.prototype.valueOf,0);
                                    });
                                    for(var kx=0; kx < xz.length; kx++ ){
                                        for(var ky=0; ky < levels.length; ky++){  
                                         yz[ky][kx] += dict[xz[kx]][levels[ky]]['value'];
                                        
                                        }
                                    }
                                   
                                   //console.log(yz);

                                   var y01z = d3.stack().keys(d3.range(levels.length))(d3.transpose(yz)),
                                        yMax = d3.max(yz, function(y) { return d3.max(y); }),
                                        y1Max = d3.max(y01z, function(y) { return d3.max(y, function(d) { return d[1]; }); });
    
                               	self.yMax = y1Max; 
                               	self.yMax = self.toggle === "stacked"? y1Max : yMax; 
                               console.log(self.yMax); 

							if(self.parent.svg && iter === 0){
							//	d3.selectAll("svg").remove(); 
								var undef; 
								self.legend = undef; 
								d3.select(".mainsvg"+viewId).remove(); 
							}
							
							var drawArea = d3.select("#draw-area"+viewId);
							if(iter > 0)
								drawArea.style("overflow-y", "scroll"); 
					
							var parentArea = drawArea.select(function(){
								return this.parentNode; 
							});
							//console.log(parentArea.node().getBoundingClientRect());
							//var viewshare = self.dicts? Object.keys(self.dicts).length : 1; 
							var viewshare = trellis? 2 : 1; 
							//////console.log(viewshare); 
							//if(viewshare > 2) viewshare = 2; 
							var scale = self.parent.expanded? 0.6 : 0.95; 
							var svgw = scale * parentArea.node().getBoundingClientRect().width;
							var svgh = scale * parentArea.node().getBoundingClientRect().height / viewshare; 
							//var shift = self.parent.expanded? ((scale-1.0)*(1-scale)*parentArea.node().getBoundingClientRect().width) : 0; 
							var shift = self.parent.expanded? 100 : 0; 
							self.parent.svg = d3.select("#draw-area"+viewId).append("svg")
										.attr("id", "mainsvg"+viewId+"_"+iter)
										.attr("class", "mainsvg"+viewId)
										.attr("width", svgw).attr("height", svgh)
										.style("vertical-align", "top")
										.attr("transform", "translate("+0+","+ 0 +")");
							
							
							var div = d3.select("body").append("div")	
									    .attr("class", "tooltip")				
									    .style("opacity", 0);

							var margin = {top: 65, right: 10, bottom: 80, left: self.leftMargin};							
							var width = svgw - margin.left - margin.right; 
							var height = svgh - margin.top - margin.bottom;
							var cscale = (ordinalScale === 1)? $Q.ordinalColors: $Q.colors ; 
							var color = d3.scaleOrdinal()
							    .domain(d3.range(levels.length))
							    .range(cscale);
							
							   //console.log(width); 
							 
							 if(!self.legend)
							 {	
							 self.legend = self.parent.svg.selectAll(".legend")
							 				.data(color.domain())
							 				.enter().append("g")
							 					 .attr("class", "legend")
     											 .attr("transform", function(d, i) { return "translate("+(0.7* margin.left) +"," + (15) + ")"; });
     						 
     						 var numValues = color.domain().length;
     						 var legWidth = svgw/2; 
     						 self.parent.svg.append("text")
     						 		.attr("x", 8)
     						 		.attr("y", 10)
     						 		.attr("dy", ".35em")
								      .style("text-anchor", "start")							      
								      .text(function(d) {  	       	
								      	return "View: "+ self.toggle + " bars";  })
								      	.style("font-size", "9pt")
								      	.style("font-weight", "bold");
							self.parent.svg.append("text")
									.attr("id", "missing-text"+viewId)
     						 		.attr("x", 0.9 * legWidth)
     						 		.attr("y", 10)
     						 		.attr("dy", ".35em")
								      .style("text-anchor", "start")							      
								      .text(function(d) {  
								       var numRecs = self.parent.parent.control.getDataLength();
								       var totalMissing; 
								       //levels.forEach(function(level){
								       	totalMissing = self.parent.parent.control.getMissing(self.parent.metric); 	       	
								       //totalMissing = 0; 
								       //});  

								       //var qual = 
								      	return "Missing "+ totalMissing +" values in " + numRecs + " records" ;  })
								      	.style("font-size", "9pt")
								      	.style("font-family", "sans-serif")
								      	.style("font-weight", "bold");
								      	
     						 // draw legend colored rectangles
							  self.legend.append("rect")
							      .attr("x", function(d,i){
							      	return (i%2)*legWidth; 
							      })
							      .attr("y", function(d,i){
							      	return parseInt(i/2)*10+15;
							      })
							      .attr("width", 10)
							      .attr("height", 10)
							      .style("fill", function(d){
							      	self.palette[levels[d]] = color(d);
							      	return color(d);});

							  // draw legend text
							  self.legend.append("text")
							      .attr("x", function(d,i){
							      	return (i%2)*legWidth+13; 
							      })
							      .attr("y", function(d,i){
							      	return parseInt(i/2)*10+20;
							      })
							      .attr("dy", ".35em")
							      .style("text-anchor", "start")							      
							      .text(function(d, i) {
							      	var undef; 
							      	var mssLegend = auditVars["displayVariables"][viewId]["legend"]? auditVars["displayVariables"][viewId]["legend"][i]: undef;
							      	var dictLegend = self.audit=== "picanet"? $Q.Picanet['variableDict'][levels[d]]: $Q.Minap['variableDict'][levels[d]];
							      	var descLegend = self.parent.parent.control.getVarDesc(levels[d]);

							      	var dataDefs;
							      	if($Q.ValueDefs[self.audit] && $Q.ValueDefs[self.audit][auditVars["displayVariables"][viewId]["y"]])							      		
							      			if($Q.ValueDefs[self.audit][auditVars["displayVariables"][viewId]["y"]][levels[d]])
							      				dataDefs = $Q.ValueDefs[self.audit][auditVars["displayVariables"][viewId]["y"]][levels[d]];

							      	var name = mssLegend || dictLegend ||  descLegend || dataDefs || levels[d];
							      	
							      	return name;  })
							      	.style("font-size", "9pt");


							    if(numValues > 2){
							    	margin.top = 20 * Math.ceil(numValues/2);
							    	height = svgh - margin.top - margin.bottom;
							     }	
							     // y-axis labels
							     self.parent.svg.append("text")
							     	  .attr("class", "ylabel")
								      .attr("transform", "rotate(-90)")
								      .attr("y", margin.left/5)
								      .attr("x",0 - (height/2) - margin.top )
								      .attr("dy", "1em")
								      .style("text-anchor", "middle")
								      .style("font-size", "9pt")
								      .text(auditVars["displayVariables"][viewId]["ylabel"]);   

								if(self.dualAxis){
									self.legend.append("text")
									      .attr("x", function(d,i){
									      	return legWidth+14; 
									      })
									      .attr("y", function(d,i){
									      	return 20 * Math.ceil(numValues/2)+20;
									      })
									      .attr("id", "dual-legend")
									      .attr("dy", ".35em")
									      .style("text-anchor", "start")							      
									      .text(function(d, i) {
									      	    var undef; 
									      		var idx = auditVars["displayVariables"][viewId]["y"].indexOf(self.dualVarName);
												var mssLegend = auditVars["displayVariables"][viewId]["legend"]? auditVars["displayVariables"][viewId]["legend"][idx]: undef;
										      	var dictLegend = self.audit=== "picanet"? $Q.Picanet['variableDict'][self.dualVarName]: $Q.Minap['variableDict'][self.dualVarName];
										      	var descLegend = self.parent.parent.control.getVarDesc(self.dualVarName);
										      	var dataDefs;
										      	if($Q.ValueDefs[self.audit] && $Q.ValueDefs[self.audit][auditVars["displayVariables"][viewId]["y"]])							      		
										      			if($Q.ValueDefs[self.audit][auditVars["displayVariables"][viewId]["y"]][levels[d]])
										      				dataDefs = $Q.ValueDefs[self.audit][auditVars["displayVariables"][viewId]["y"]][levels[d]];

										      	var name = mssLegend || dictLegend ||  descLegend || dataDefs || self.dualVarName;
										      	return name;
										        	
									      	  })
									      	.style("font-size", "9pt");
									self.legend.append("line")
												.attr("x1", legWidth )
												.attr("x2", legWidth+ 9)
												.attr("y1", 20 * Math.ceil(numValues/2)+20)
												.attr("y2", 20 * Math.ceil(numValues/2)+20)
												.style("stroke", "brown");

								}

								 // x-axis labels
								/* self.parent.svg.append("text") 
								 	  .attr("class", "xlabel"+viewId)            
								      .attr("transform",
								            "translate(" + (svgw/2) + " ," + 
								                           (height + margin.top + margin.bottom-8) + ")")
								      .style("text-anchor", "middle")
								      .style("font-size", "9pt")
								      .style("font-weight", "bold")
								      .text(function(d)
								      	{   
								      		self.nsel = {}; 
								      		return "Selected: " +  0 + " records in " + self.parent.parent.control.getYear();
								      	});	*/

								  self.nsel = {}; 
								  var sl = self.parent.svg
								  			.append("g")
								  				.attr("class", "selection-legend"+viewId)
								  				.attr("transform", "translate(" + (svgw/10) + "," + (svgh-margin.bottom/2)  + ")");
								  				
								  var sltitle= sl.append("g").attr("transform", "translate(0,0)");

								  sltitle.append("rect")
								  				.attr("width", 60)
								  				.attr("height", 15)	
								  				.style("fill", "white")	
								  				.style("stroke-width", 0.5)						  				
								  				.style("stroke", "none");
								  sltitle.append("text")
								  	.attr("x", 2)
								  	.attr("y", 12)
								  	  .style("font-size", "9pt")
								      .text("Selected:");

								 var slbut = sl.append("g").attr("transform", "translate(0,16)")
								 				.on("click", function(){
								 					//console.log("CLEARING");
								 					if(!self.svg)
								 						self.svg = self.getMainSVG(self.id); 
								 					self.svg.selectAll(".bar").each(function(d){
								 						d3.select(this).attr("selected", false);
								 						d3.select(this).style("fill", self.palette[d[0]]);
								 					});								 			
								 					self.nsel = {};		
								 					self.parent.clearSelection(); 						 					
								      				self.parent.nohighlightSubs(); 
								     				d3.selectAll(".slcount-"+self.id).text("0");
								     				d3.select("#slbut-"+self.id).style("fill", "grey");
								     				self.parent.parent.control.updateSessionLog({'type': 'clear' , 
															'owner': 'bar' , 
															'params': {'metric': self.parent.metric}
														});
												
								 				});
								 slbut.append("rect")
								  				.attr("width", 60)
								  				.attr("height", 15)	
								  				.style("fill", "lightgrey")	
								  				.style("stroke-width", 0.5)
								  				.style("rx", 2)						  				
								  				.style("stroke", "black");
								  slbut.append("text")
								  	.attr("id", "slbut-"+viewId)
								  	.attr("x", 10)
								  	.attr("y", 12)
								  	  .style("font-size", "9pt")
								  	  .style("font-weight", "bold")
								  	  .style("fill", "grey")
								      .text("Clear");

								/* var slscroll = sl.append("g").attr("transform", "translate(100,2)")
								 				.on("click", function(){
								 					d3.selectAll(".sellegend").each(function(du){
								 						var curY = d3.select(this).attr("y");
								 						console.log(du.y);
								 					});
								 				});
								  slscroll.append("rect")
								  				.attr("width", 20)
								  				.attr("height", 15)	
								  				.style("fill", "red")	
								  				.style("stroke-width", 0.5)
								  				.style("rx", 2)						  				
								  				.style("stroke", "black");
								  slscroll.append("text")
								  	.attr("id", "slscroll-"+viewId)
								  	.attr("x", 10)
								  	.attr("y", 12)
								  	  .style("font-size", "9pt")
								  	  .style("font-weight", "bold")
								  	  .style("fill", "grey")
								      .text("V");

								 */

								 var sllabels = sl.selectAll(".varname")
								 				.data(color.domain())
							 						.enter().append("g")
							 					 .attr("class", "varname")
     											 .attr("transform", function(d, i) { return "translate("+(160) +"," + (i*15) + ")"; });
     								sllabels.append("rect")
     										.attr("width", (width)*0.6)
								  				.attr("height", 15)	
								  				.style("fill", "white")	
								  				.style("stroke-width", 0.5)						  				
								  				.style("stroke", "none");
								  	sllabels.append("text")

								  			.attr("x", 6)
								  			.attr("y", 12)
										  	  .style("font-size", "9pt")
										      .text(function(d, i){ 
										      	//var tex = self.audit=== "picanet"? $Q.Picanet['variableDict'][levels[d]]: $Q.Minap['variableDict'][levels[d]];
										      	//var name = tex || levels[d];
										      	var undef;
										      	var mssLegend = auditVars["displayVariables"][viewId]["legend"]? auditVars["displayVariables"][viewId]["legend"][i]: undef;
										      	var dictLegend = self.audit=== "picanet"? $Q.Picanet['variableDict'][levels[d]]: $Q.Minap['variableDict'][levels[d]];
										      	var descLegend = self.parent.parent.control.getVarDesc(levels[d]);
										      	var dataDefs;
										      	if($Q.ValueDefs[self.audit] && $Q.ValueDefs[self.audit][auditVars["displayVariables"][viewId]["y"]])							      		
										      			if($Q.ValueDefs[self.audit][auditVars["displayVariables"][viewId]["y"]][levels[d]])
										      				dataDefs = $Q.ValueDefs[self.audit][auditVars["displayVariables"][viewId]["y"]][levels[d]];

										      	var name = mssLegend || dictLegend ||  descLegend || dataDefs ||levels[d];
										      	return name;
										       });

							 	var slcounts = sl.selectAll(".varcount")
							 					.data(levels)
							 						.enter().append("g")
							 					 .attr("class", "varcount")
     											 .attr("transform", function(d, i) { return "translate("+ 60 +"," + (i*15) + ")"; });

     						 	slcounts.append("rect")
     						 				.attr("class","sellegend")
     										.attr("width", 40)
								  				.attr("height", 15)	
								  				.style("fill", "white")	
								  				.style("stroke-width", 0.5)						  				
								  				.style("stroke", "none");
								slcounts.append("text")
											.attr("id", function(d,i){
												return "slcount-"+viewId+"-"+i; 
											})
											.attr("class", "slcount-"+viewId)
								  			.attr("x", 12)
								  			.attr("y", 12)
										  	  .style("font-size", "9pt")
										  	  .style("font-family", "sans-serif")
										      .text("0");
								var div2 = d3.select("body").append("div")	
									    .attr("class", "tooltip")				
									    .style("opacity", 0);

								var sltots = sl.selectAll(".vartotal")
							 					.data(levels)
							 						.enter().append("g")
							 					 .attr("class", "vartotal")
     											 .attr("transform", function(d, i) { return "translate("+ (110) +"," + (i*15) + ")"; });

     						 	sltots.append("rect")
     						 				.attr("class","sellegend")
     										.attr("width", 55)
								  				.attr("height", 15)	
								  				.style("fill", "white")	
								  				.style("stroke-width", 0.5)						  				
								  				.style("stroke", "none")
								  				.on("mouseover", function(){
								  					var msg = "Selected: ";
								  					 for(var key in self.nsel){

											        	var nrecs = self.nsel[key] || 0; 
											        	msg += nrecs + " "+ key + "\n";											        	
											        	//var id = self.levels.indexOf(key); 
											        	//d3.select("#slcount-"+self.id+"-"+id).text(nrecs);
											        }		      	
								       
								  					div2.transition()
											      		.duration(200)
											      		.style("opacity", 0);
											      	div2 .html(msg)
											      		.style("left", (d3.event.pageX) + "px")
											      		.style("top", (d3.event.pageY - 28) + "px")
											      		.style("height", "100px");
											      		
											      	
								  				})
								  				.on("mouseout", function(){
								  					div2.transition()
											      		.duration(500)
											      		.style("opacity", 0);
											      	
								  				});
								sltots.append("text")
											.attr("id", function(d,i){
												return "sltot-"+viewId+"-"+i; 
											})
											.attr("class", "sltot-"+viewId)
								  			.attr("x", 2)
								  			.attr("y", 12)
										  	  .style("font-size", "9pt")
										  	  .style("font-family", "sans-serif")
										      .text(function(d,i){
										      	return "of ";
										      });
								sltots.append("text")
								  			.attr("x", 25)
								  			.attr("y", 12)
										  	  .style("font-size", "9pt")
										  	  .style("font-family", "sans-serif")
										      .text(function(d,i){
										      	//console.log(self.dict);
										      	var count =0; 
										      	for(var key in self.dict){
										      		if(self.dict[key][d])
										      			count += self.dict[key][d]["value"];
										      	}
										      	return count;
										      });


								

							    }

							self.marginTop = margin.top; 
							var g = self.parent.svg.append("g").attr("transform","translate(" + margin.left + "," + margin.top + ")" );

							var timeout = d3.timeout(function() {
											  changed(); 
											}, 4000);

							var x = d3.scaleBand()
									    .domain(xz)
									    .rangeRound([0, (width-35)])
									    .padding(0.1);

							var y = d3.scaleLinear()
							    .domain([0, y1Max])
							    .range([height, 0]);

							   
							var series = g.selectAll(".series")
							  .data(y01z)
							  .enter().append("g")
							  	.attr("class", "series"+viewId)
							    .attr("fill", function(d, i) { 
							    	//if(!self.palette[d]) self.palette[d] = color(i);
							    	return color(i); });

							
							var origColor; 
							var count =0; 
							var rcount = -1; 
							var rect = series.selectAll("rect")
							  .data(function(d) { return d; })
							  .enter().append("rect")
							  	.attr("class", "bar")
							    .attr("x", function(d, i) { return x(i); })
							    .attr("y", height)
							    .attr("width", x.bandwidth())
							    .attr("height", 0)
							    .style("stroke", "darkgrey")
							     .on("mouseover", function(d, i){
							     	var numValues = color.domain().length; 
							     	var prop = Math.round(((d[1] - d[0]) / (d[1] + d[0]) * 100)*10)/10; 
							     	if(numValues > 1){
							     		var allBars = 0;
							     		d['data'].forEach(function(b){
							     			allBars += b;
							     		});
							     		prop = Math.round(((d[1] - d[0]) / allBars * 100)*10)/10 
							     	}
							  		var proportion = self.toggle=== "grouped"? "": ("<br>" + prop + "%"); 
							      	div.transition()
							      		.duration(200)
							      		.style("opacity", 0.9);
							      	div .html((d[1] - d[0]+ proportion))
							      		.style("left", (d3.event.pageX) + "px")
							      		.style("top", (d3.event.pageY - 28) + "px");
							      	//origColor = d3.select(this).style("fill");
							      	d3.select(this).style("fill", self.highlightColor);
							      					//.style("opacity",self.highlightOpacity)
							      					//.style("stroke-width", 1.0)
													//.style("stroke", self.highlightColor); 
							
							      	// find the key for the corresponding data entry
							      	//var dictEntry = self.dict[(i+1)+""]; 
							      	var thisEntry = parseInt(Object.keys(self.dict)[0]) + i; 
							      	var dictEntry = self.dict[thisEntry+""]; 
							      	if(!dictEntry)
							      		return null; 
						      		var cat = parseInt(d3.select(this).attr("id").split("-")[1]); 
						      		var key = Object.keys(dictEntry)[cat];
							      	//for(var key in dict[i+1]){
							      	//	if(dict[i+1][key]['value'] === (d[1] - d[0]))
							      	self.parent.highlightSubs(key, dict[i+1][key]['data'], (i+1));
							      			//console.log(dict[i+1][key]['data']); 
							      	//}

							      })
							      .on("mouseout", function(d, i){
							      	div.transition()
							      		.duration(500)
							      		.style("opacity", 0);
							      	//var dictEntry = self.dict[(i+1)+""]; 
							      	var thisEntry = parseInt(Object.keys(self.dict)[0]) + i; 
							      	var dictEntry = self.dict[thisEntry+""]; 
							      	if(!dictEntry)
							      		return null; 
							      	var sel = d3.select(this);
							      	var as = sel.attr("selected");
							      	if(!as || as=== "false" ){
							      		sel.style("fill", self.palette[dictEntry]);
							      	}
							      	self.parent.nohighlightSubs(); 
							      })
							      .on("click", function(d,i){
							      	var selStatus = d3.select(this).attr("selected");
							      	if(!selStatus || selStatus === "false"){
							      		// set selection							      		
							      		var txt = "Selected: "; 
							      		//var dictEntry = self.dict[(i+1)+""]; 
							      		var thisEntry = parseInt(Object.keys(self.dict)[0]) + i; 
								      	var dictEntry = self.dict[thisEntry+""]; 
								      	if(!dictEntry)
								      		return null; 
						      			var cat = parseInt(d3.select(this).attr("id").split("-")[1]); 
						      			var key = Object.keys(dictEntry)[cat];
							      	
								      	//for(var key in dict[i+1]){								      		
								      	//	if(dict[i+1][key]['value'] === (d[1] - d[0])){
								      				self.parent.updateSelection(key, dict[i+1][key]['data'], 1); 
								      				if(!self.nsel[key])
										        		self.nsel[key] = 0; 
										        	self.nsel[key] +=  dictEntry[key]['value'];  //d[1] - d[0]; 							
								      		//	} 								      	  
								      	//}	
								      	//var totalSelected = self.parent.getSelection(); 
								        //for(var key in totalSelected){
								        for(var key in self.nsel){
								        	var keyname = $Q.Picanet["variableDict"][key] || key;
								        	var nrecs = self.nsel[key]; 
								        	//txt += nrecs +" "+ keyname +" "; 
								        	var id = self.levels.indexOf(key); 
								        	d3.select("#slcount-"+self.id+"-"+id).text(nrecs);
								        }		      	
								        //txt += " in 2014"; 
								        //d3.select(".xlabel"+ viewId).text(txt);
								      	d3.select(this).attr("selected", true); 
								      	d3.select(this).style("fill", self.highlightColor);
							      		d3.select("#slbut-"+self.id).style("fill", "black"); 
							      	// find the key for the corresponding data entry
							      	key = Object.keys(dictEntry)[cat];
							      	//for(var key in dict[i+1]){
							      	//	if(dict[i+1][key]['value'] === (d[1] - d[0]))

							      	self.parent.parent.control.updateSessionLog({'type': 'select' , 
											'owner': 'bar' , 
											'params': {'metric': self.parent.metric, 'variable': key}
										});
								
							      			self.parent.highlightSubs(key, dict[i+1][key]['data'], (i+1), 1);
							      			//console.log(dict[i+1][key]['data']); 
							      	//}

								      }
								     else{
								     	// reset selection
								     	txt = "Selected: "; 
								     	//var dictEntry = self.dict[(i+1)+""]; 
								     	var thisEntry = parseInt(Object.keys(self.dict)[0]) + i; 
								      	var dictEntry = self.dict[thisEntry+""]; 
								      	if(!dictEntry)
								      		return null; 
						      			var cat = parseInt(d3.select(this).attr("id").split("-")[1]); 
						      			var key = Object.keys(dictEntry)[cat];
							      	
								     	//for(var key in dict[i+1]){
								      	//	if(dict[i+1][key]['value'] === (d[1] - d[0])){
								      				self.parent.updateSelection(key, dict[i+1][key]['data'], 0, 0, 1); 
								      				self.nsel[key] -= d[1] - d[0];
								      	//		} 
								      	//}
								      	for(var key in self.nsel){
								        	//var keyname = $Q.Picanet["variableDict"][key] || key;
								        	var nrecs = self.nsel[key]? self.nsel[key] : 0 ; 
								        	//txt += nrecs +" "+ keyname +" "; 
								        	var id = self.levels.indexOf(key); 
								        	d3.select("#slcount-"+self.id+"-"+id).text(nrecs);
								        }		      	
								        //txt += " in 2014"; 
								        //d3.select(".xlabel"+ viewId).text(txt);
								      								      	
								      	d3.select(this).attr("selected", false); 
								      	d3.select(this).style("fill", self.palette[d[0]]);
								      	self.parent.nohighlightSubs(); 
								      	if(self.parent.selectionEmpty())
								      		d3.select("#slbut-"+self.id).style("fill", "grey"); 
								     
								     }
							      })
							      .attr("id", function(d,i){
							    	rcount++;
							    	return "p"+i+"-"+parseInt(rcount / y01z[0].length); 
							    });

							    rect.transition()
								    .delay(function(d, i) { return i * 10; })
								    .attr("y", function(d) { return y(d[1]); })
								    .attr("height", function(d) { return y(d[0]) - y(d[1]); });

								g.append("g")
								    .attr("class", "x axis")
								    .attr("transform", "translate(0," + height + ")")
								    .call(d3.axisBottom(x))
									.selectAll("text")	
										.text(function(d){
											return $Q.months[d-1]; 
										})
								        .style("text-anchor", "end")
								        .attr("dx", "-.8em")
								        .attr("dy", ".15em")
								        .attr("transform", "rotate(-65)")
								        .call(changed);

								////console.log(y.domain());
								////console.log(y.range());
								g.append("g")
							      .attr("class", "y axis")
							      .call(d3.axisLeft(y).ticks(5, "s"))
							      .attr("transform", "translate(0,"+0+")");

							    if(self.dualAxis){
							    	var parseDate = d3.timeParse("%B");
									self.dualData.forEach(function(d) { 
									    d.date = parseDate(self.months[parseInt(d.date)-1]);
									    d.value = +d.value;    
									});

							    	var ydscale = d3.scaleLinear()
							    					.domain([0, d3.max(self.dualData, function(d){
							    									return d.value; 
							    								})])
							    					.range([height, 0]);

							    	g.append("g")
							    		.attr("class", "y axis")
							    		.attr("id", "dualAxis")
							    		.call(d3.axisRight(ydscale).ticks(5, "s"))
							    		.attr("transform", "translate("+(width-35)+","+0+")");
							    	
							    	var xdscale = d3.scaleTime()
									    			.domain(d3.extent(self.dualData, function(d){
									    							return d.date; 
									    			}))
									    			.range([x(xz[0])+x.bandwidth()/2 , x(xz[xz.length-1])+x.bandwidth()/2]);
									    			
 									self.xz = xz; 

							    	var valueLine = d3.line()
							    					.x(function(d) { 
							    						return xdscale(d.date); })
							      					.y(function(d) { 
							      						//console.log(ydscale(d.value)); 
							      						return ydscale(d.value); })
							      	var line = g.append("path")
							      		.data([self.dualData])
							      		.attr("class", "line")
							      		.attr("id", "vline"+self.id)
							      		.attr("d", valueLine)
							      		.style("stroke", "brown"); 

							      	g.append("text")
							     	  .attr("class", "ylabel")
							     	  .attr("id", "dualabel"+self.id)
								      //.attr("transform", "rotate(-90)")
								     .attr("transform", "rotate(-90)")
								      .attr("y", width-5)
								      .attr("x",0 - (height/2)- margin.top )
								      .attr("dy", "1em")
								      .style("text-anchor", "middle")
								      .style("font-size", "9pt")
								      .text(function(){
								      	var vname =  self.dualVarName; 
								      	return auditVars["variableDict"][vname] || vname; 
								     	});   

							      	/*g.selectAll(".line")
							      		.data([dummy])
							      		.enter().append("path")
							      		.attr("class", "line")
							      		.attr("d", valueLine)
							      		.style("stroke", "red")
							      		.style("fill", "none"); */

var circleOpacity = '0.85';
								var circleOpacityOnLineHover = "0.25"
								var circleRadius = 3;
								var circleRadiusHover = 6;

var duration = 250;
							      	
  g.selectAll("circle")
  .data(self.dualData).enter()
  .append("g")
  .attr("class", "circle")  
  .on("mouseover", function(d) {
      d3.select(this)     
        .style("cursor", "pointer")
        .append("text")
        .attr("class", "text")
        .text(function(d) {
        	return Math.round(d.value*100)/100;
        })
        .style("font-family", "sans-serif")
        .style("fill", "brown")
        .attr("x", d => xdscale(d.date) + 5)
        .attr("y", d => ydscale(d.value) - 10);
    })
  .on("mouseout", function(d) {
      d3.select(this)
        .style("cursor", "none")  
        .transition()
        .duration(duration)
        .selectAll(".text").remove();
    })
  .append("circle")
  .attr("cx", d => xdscale(d.date))
  .attr("cy", d => ydscale(d.value))
  .attr("r", circleRadius)
  .style('opacity', 1)
  .style("fill", "brown")
  .on("mouseover", function(d) {
        d3.select(this)
          .transition()
          .duration(duration)
          .attr("r", circleRadiusHover);
      })
    .on("mouseout", function(d) {
        d3.select(this) 
          .transition()
          .duration(duration)
          .attr("r", circleRadius);  
      });

							    }

							d3.selectAll(".toggle-button")
							    .on("click", changed);

							function changed() {
							  timeout.stop();
							  if (self.toggle === "grouped") 
							  	transitionGrouped();
							  else 
							    transitionStacked();
							}
						self.changed = function(newx, newy, nviewId){
							 //console.log("changing"); 
							 //timeout.stop();
							  if (self.toggle === "grouped") 
							  	transitionGrouped(newx, newy, nviewId);
							  else 
							    transitionStacked(newx, newy, nviewId);
						};
						function transitionGrouped(newx, newy, nviewId) {
							
							if(newx) x = newx; 
							if(newy) y = newy; 
							if(newx) viewId = nviewId; 
						  y.domain([0, yMax]);
						  if(newx) {  	
						  	  series = d3.selectAll(".series"+viewId);
						  	  //console.log(series);
						  	  rect = series.selectAll("rect");
						  }
						  //console.log(xz);
						  rect.transition()
						      .duration(1000)
						      //.delay(function(d, i) { return i * 10; })
						      .attr("x", function(d, i) {							         
						      	 return x(xz[i]) + x.bandwidth() / levels.length * this.parentNode.__data__.key; })
						      .attr("width", x.bandwidth() / levels.length)
						    .transition()
						      .attr("y", function(d) { 
						      	return y(d[1] - d[0]); })
						      .attr("height", function(d) {
						      var y00 =  y(0); 
						      	return y00 - y(d[1] - d[0]); });
						}
						function transitionStacked(newx, newy, nviewId) {
							if(newx) x = newx; 
							if(newy) y = newy; 
							if(newx) viewId = nviewId; 
						  y.domain([0, y1Max]);
						  if(newx) {
						  	//console.log("THERE");
						  	//console.log(viewId); 
						  	  series = d3.selectAll(".series"+viewId);
						  	  //console.log(series);
						  	  rect = series.selectAll("rect");
						  }
						  rect.transition()
						      .duration(200)
						      .delay(function(d, i) { return i * 10; })
						      .attr("y", function(d) { 
						      	return y(d[1]); })
						      .attr("height", function(d) { 
						      	return y(d[0]) - y(d[1]); })
						    .transition()
						      .attr("x", function(d, i) { 
						      	return x(xz[i]); })
						      .attr("width", x.bandwidth());
						}

						 
						
						},
						fixDataFormat: function(sdata){
							var self = this;						
							var data = [];
							
							for(var key in sdata){
								data.push({'date': key, 'number': sdata[key][Object.keys(sdata[key])[0]]['value'] });								
							}							
							return data; 
						},
						trellisDataFormat: function(sdata){
							var self = this;
							var data = [];
							// self.data should hold the largest bars in the trellis
							// to correctly setup the y scale
							for(var key in sdata){
								var max = 0; 
								for(var kk in sdata[key]){
									if(sdata[key][kk]['value'] > max)
										max = sdata[key][kk]['value'];
								}
								data.push({'date': key, 'number': max});
							}
							return data; 
						},
						resize: function(){
							var self = this;
							if(self.trellis){
								self.resizeTrellis();
							}
							else
								self.resizeCatBar();
						},
						resizeTrellis: function(){
							var self = this; 
							var viewshare = 2; 
							var scale = self.parent.expanded? 0.6 : 0.9; 
							// update the div container
							d3.select(".trellisdiv"+self.id)
											.style("height", function() {
												if(self.parent.expanded)
													return "60%";
												else
													return "90%";})
											.style("width", function() {
												if(self.parent.expanded)
													return "60%";
												else
													return "100%";});
													
							// get the new card size
							var parentW = parseInt(d3.select("#card"+self.id).style("width")),
								parentH = parseInt(d3.select("#card"+self.id).style("height"));

							// calculate new svg width and height based on the new card size
							var svgw = parentW * scale,
								svgh = parentH * scale;
							var numRows = Math.ceil(self.cats.length/viewshare); 
                            var rowHeight =  svgh / viewshare; 
							// update the main svg size
							self.svg = d3.select("#mainsvg"+self.id+"_"+self.iter)
												.attr("width", svgw)
												//.attr("height", svgh);
											//.attr("width", (parentArea.node().getBoundingClientRect().width* scale)+"px" )
											   .attr("height", (rowHeight*numRows)+"px" );

							//TODO: update size and position of the trellis' sub-svgs:


							// TODO: update the axes and bars 




							/*
							
							var margin = {top: 0, right: 10, bottom: 30, left:10}; 
							

                            
                           
						
							// update the range of the scale with new width/ height
							var width = svgw - margin.right - margin.left, 
								height = svgh - margin.top - margin.bottom; 

							
		
							console.log("resized div");
							
							// update subsvgs of trellis
							var svgsubs = d3.selectAll(".trellissvg"+self.id)
												.each(function(d, iter){
													d3.select(this).attr("width", svgw).attr("height", svgh)										
														.attr("x", ((iter%viewshare)*svgw) + margin.left  )
														.attr("y", parseInt(iter/viewshare)*svgh+ margin.top);
												var x = d3.scaleBand().rangeRound([0, width]).padding(0.1), 
													y = d3.scaleLinear().range([height, 0]).nice(); 

												x.domain(self.data.map(function(d){
														return d.date; 
												}));
												y.domain([0, d3.max(self.data, function(d){ return d.number; })]);
												self.svg.select(".x.axis")
													   .attr("transform", "translate("+ 0+"," + (height + margin.top ) + ")")
												      .call(d3.axisBottom(x))
														.selectAll("text")	
														.text(function(d){
																return $Q.months[d-1]; 
															})
													        .style("text-anchor", "end")
													        .attr("dx", "-.8em")
													        .attr("dy", ".15em")
													        .attr("transform", "rotate(-65)");	

												self.svg.select(".y.axis")
														.call(d3.axisLeft(y).ticks(5, "s"))
												      	.attr("transform", "translate(0,"+ margin.top+")");


												});
											

							*/
						},
						resizeCatBar: function(){
							var self = this;
							var margin = self.cat? {top: self.marginTop, right: 10, bottom: 80, left:self.leftMargin} : {top: 10, right: 10, bottom: 65, left:self.leftMargin}; //TODO: modify this according to different views
							var scale = self.parent.expanded? 0.6 : 0.9; 
							var drawArea = d3.select("#draw-area"+self.id);							
							var parentArea = drawArea.select(function(){
								return this.parentNode; 
							});
														
							var svgw = scale * parentArea.node().getBoundingClientRect().width;
							var svgh = scale * parentArea.node().getBoundingClientRect().height; 

							/*var parentW = parseInt(d3.select("#card"+self.id).style("width")),
								parentH = parseInt(d3.select("#card"+self.id).style("height"));
							var svgw = parentW * scale,
								svgh = parentH * scale;*/
								// update the range of the scale with new width/ height
							var width = svgw - margin.right - margin.left, 
								height = svgh - margin.top - margin.bottom; 

							self.height = height; 

							var x = d3.scaleBand().rangeRound([0, (width-35)]).padding(0.1), 
								y = d3.scaleLinear().range([height, 0]).nice(); 
							//var data = self.audit === "picanet"? self.fixDataFormat() :self.data; 							
							var data = self.data; 
							//console.log(data);
							//console.log(width); 
							x.domain(data.map(function(d){
									return d.date; 
							}));
							y.domain([0, self.yMax]);
							
							// update svg width and height
							var iter = self.iter; 
							self.svg = self.getMainSVG(self.id); 
							//var xoffset = self.parent.expanded? (scale - 0.9) * width : 0; 
							var xoffset = 0; 
							self.svg.attr("width", svgw)
									.attr("height", svgh)
									.attr("transform", "translate("+ xoffset +",0)" );

							x.rangeRound([0, (width-35)]).padding(0.1);
							y.range([(height), 0]); 

							////console.log(self.svg.selectAll("*"));
							self.svg.select(".x.axis")
							.attr("transform", "translate("+ 0+"," + (height ) + ")")
							      .call(d3.axisBottom(x))
									.selectAll("text")	
									.text(function(d){
											return $Q.months[d-1]; 
										})
								        .style("text-anchor", "end")
								        .attr("dx", "-.8em")
								        .attr("dy", ".15em")
								        .attr("transform", "rotate(-65)");	

							self.svg.select(".y.axis")
									.call(d3.axisLeft(y).ticks(5, "s"))
							      	.attr("transform", "translate(0,"+ 0 +")");
							
							if(self.dualAxis){
								
								var xdscale = d3.scaleTime()
									    			.domain(d3.extent(self.dualData, function(d){
									    							return d.date; 

									    			}))
									    			.range([x(self.xz[0])+x.bandwidth()/2 , x(self.xz[self.xz.length-1])+x.bandwidth()/2]);
									    			//.range([x("1"), x("10")]);



							    	var ydscale = d3.scaleLinear()
							    					.domain([0, d3.max(self.dualData, function(d){
							    									return d.value; 
							    								})])
							    					.range([height, 0]);
							    	
							    	self.svg.select("#dualAxis")
										.call(d3.axisRight(ydscale).ticks(5, "s"))
							      		.attr("transform", "translate("+(width-35)+","+ 0 +")");

							      	self.svg.select("#dualabel"+self.id)
							      			.attr("x",0 - height/2 )
							      			.attr("y", width-5);
							    	var valueLine = d3.line()
							    					.x(function(d) { 
							    						return xdscale(d.date); })
							      					.y(function(d) { 
							      						//console.log(ydscale(d.value)); 
							      						return ydscale(d.value); });
								
							    	
							      	self.svg.select("#vline"+self.id).remove(); 
							      	self.svg.append("path")
							      		.data([self.dualData])
							      		.attr("class", "line")
							      		.attr("id", "vline"+self.id)
							      		.attr("d", valueLine)
							      		.attr("transform", "translate("+margin.left+","+margin.top+")")
							      		.style("stroke", "brown"); 
							      	self.svg.selectAll("circle")
							      		.attr("cx", d=> xdscale(d.date) )
							      		.attr("cy", d=> ydscale(d.value));

							}
							if(self.cat) self.changed(x, y, self.id); 
							else{
								self.svg.selectAll(".bar")
								.attr("x", function(d) { 
									return x(d.date); })
							      .attr("y", function(d) { 
							      	return y(d.number)+ margin.top; })
							      .attr("width", x.bandwidth())
							      .attr("height", function(d) { return height  - y(d.number); });
							}
							if(self.legend)
							 {	
							     // y-axis labels
							     self.parent.svg.select(".ylabel")
								      .attr("x",0 - (height/2) - margin.top );
								      
								 // x-axis labels
								 /*self.parent.svg.select(".xlabel"+self.id)             
								      .attr("transform",
								            "translate(" + (svgw/2) + " ," + 
								                           (height + margin.top + margin.bottom-5) + ")");*/

								 self.parent.svg.select(".selection-legend"+self.id)
								  .attr("transform", "translate(" + (svgw/10) + "," + (svgh-margin.bottom/2)  + ")");
								      
							  }
							
						},
						getPalette: function(){
							return this.palette; 
						},
						getMainSVG: function(id){
							var self = this; 
							return (self.cat)? d3.select("#mainsvg"+id+"_"+self.iter) :d3.select(".mainsvg"+id); 
						},
						toggleBarView: function(viewId){
							var self = this;
							if(self.toggle === "grouped")
								self.toggle = "stacked";
							else
								self.toggle = "grouped";

							if(self.iter < 1)
								self.drawCatBar(viewId, self.dict, self.cat[viewId], self.levels, 0); 

							else{
								 var c = 0;
								 for(var key in self.dicts){
		                         	   self.drawCatBar(viewId, self.dicts[key], self.cat[viewId], self.levels, c, 1);
		                         	   c++; 
		                         	}
							}

						},
						toggleView: function(viewId, value){
							var self = this;
							self.toggle = value; 

							if(self.iter < 1)
								self.drawCatBar(viewId, self.dict, self.cat[viewId], self.levels, 0); 

							else{
								 var c = 0;
								 for(var key in self.dicts){
		                         	   self.drawCatBar(viewId, self.dicts[key], self.cat[viewId], self.levels, c, 1);
		                         	   c++; 
		                         	}
							}

						},
						drawBarTrellis: function(viewId, dict, cat, levels){
							var self = this;						
							//self.dicts = dicts; 
							self.trellis = true; 
							var c =0;    
							self.iter = c;                         
                            var cats = Object.keys(dict["1"]);
                            self.cats = cats; 
                            //(self.cat)? d3.select("#mainsvg"+id+"_"+self.iter) :d3.select("#mainsvg"+id); 
                            //self.cat[viewId] = cats;
                            var viewshare = 2; 
                            var parentArea = d3.select("#draw-area"+viewId);
                            var numRows = Math.ceil(cats.length/2); 
                            var rowHeight =  parentArea.node().getBoundingClientRect().height / viewshare; 
                            var scale = self.parent.expanded? 0.6 : 0.9; 
							
                            self.parent.svg = d3.select("#draw-area"+viewId).append("div")
												.attr("class", "trellisdiv"+self.id)																						
												//.style("width", (parentArea.node().getBoundingClientRect().width* scale)+"px")
												//.style("height", (parentArea.node().getBoundingClientRect().height* scale)+"px")	
												.style("height", function() {
													if(self.parent.expanded)
														return "60%";
													else
														return "90%";})
												.style("width", function() {
													if(self.parent.expanded)
														return "60%";
													else
														return "100%";})
												.style("position", "relative")
												.style("overflow-y", "scroll")	
												.style("overflow-x", "hidden")												                            					
												.append("svg")
														.style("display", "inline-block")
														.attr("id", "mainsvg"+viewId+"_"+self.iter)
														.attr("class", "mainsvg"+viewId)
														.attr("x", 0)
														.attr("y", 0)
														.attr("width", (parentArea.node().getBoundingClientRect().width* scale)+"px" )
														.attr("height", (rowHeight*numRows)+"px" );

									
                            cats.forEach(function(cat){		                            	
                            		var arr = [];
		                            for(var key in dict){
		                            	var newdict = {};
		                            	newdict["date"] = key;
		                            	newdict["number"] = dict[key][cat]["value"];
		                            	newdict["data"] = dict[key][cat]["data"];
		                            	arr.push(newdict);
		                            }			          
		                            
		                            self.drawBaseBarTrellis(viewId, arr, cat, c);
		                            c++;
		                        });
                               
						}

					});
 })(QUALDASH);
