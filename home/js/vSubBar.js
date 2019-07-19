(function($Q){
	'use strict'
	$Q.SubBarChart = $Q.defineClass(
					null, 
					function SubBarChart(viewId, color, dataname ,data, parent, svgw, svgh){
						var self = this;	
						self.parent = parent; 									
						self.highlightColor = "cyan"; 						
						self.draw(viewId, color, dataname, data, parent, svgw, svgh);
						self.months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

					},
					{
						updateDataLinks: function(viewId, data, parent){
							var self = this; 
							var parentData = parent.parent.dataViews[viewId]['data'];
							var cats = Object.keys(data);
							self.dataLinks = {};
							cats.forEach(function(cat){
								var dataLinks = {};
								for(var key in parentData){
									dataLinks[key] = {};
									for(var kk in parentData[key]){
										dataLinks[key][kk] = {};
										dataLinks[key][kk]['data'] = []; 
										dataLinks[key][kk]['value'] = 0; 
										for(var i=0; i < parentData[key][kk]['data'].length; i++){
											if(self.foundMatch(parentData[key][kk]['data'][i], cat, data)){
												dataLinks[key][kk]['data'].push(parentData[key][kk]['data'][i]);
												dataLinks[key][kk]['value']++; 
											}
										}
									}
								}
								self.dataLinks[cat] = dataLinks;
							});
							//console.log(self.dataLinks);
						},
						foundMatch: function(datum, cat, piedata){
							var self = this; 
							for(var i=0; i < piedata[cat].length; i++)
								if(piedata[cat][i] === datum)
									return true; 
							return false; 
						},
						drawWithNegative: function(viewId, vname, data, parent, svgw, svgh){
							var self = this; 
							var scale = 1.0;
							var margin = {top: 30, right: 20, bottom: 40, left: 40},
							    width = svgw - margin.left - margin.right,
							    height = svgh * scale - margin.top - margin.bottom;
							
							var div = d3.select("body").append("div")	
									    .attr("class", "tooltip")				
									    .style("opacity", 0);
							//console.log(data);
							//console.log(parent); 
							if(self.parent.g2){								
								d3.select("#slave-draw-area-2"+viewId).remove(); 								
							}

							
							self.parent.g2 = self.parent.ssvg2.append("g")
												.attr("class", "slave-draw-area-2")
												.attr("id", "slave-draw-area-2"+viewId);
							var g = self.parent.g2.append("g").attr("transform","translate(" + margin.left + "," + margin.top + ")" );
							    

							var x = d3.scaleBand().rangeRound([0, width]).padding(0.1), 
								y = d3.scaleLinear().range([height, 0]).nice(); 
							var center = d3.scaleLinear()
											.range([0, width]);
							var centerLine = d3.axisTop(center).ticks(0);
							x.domain(data.map(function(d){
									return d.date; 
							}));
							y.domain([d3.min(data, function(d){ return d.number; }), d3.max(data, function(d){ return d.number; })]);
							g.append("g")
							      .attr("class", "x axis")
							      .attr("transform", "translate("+ 0+"," + (height) + ")")
							      .call(d3.axisBottom(x))
									.selectAll("text")	
										.text(function(d){
											return $Q.months[d-1] || d; 
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
							    .data(data)
							    .enter().append("rect")
							      .attr("class", "bar")
							      .style("stroke", "darkgrey")
							      .attr("x", function(d) { return x(d.date); })
							      .attr("y", function(d) { 
							      	if(d.number >=0 )
								     	return y(d.number); 
								 	else
								 		return y(0); })
							      .attr("width", x.bandwidth())
							      .attr("height", function(d) { 
							      	if(d.number >=0 )
							      		return y(0) - y(d.number); 
							      	else
							      		return height  - y(d.number); 
							      })
							      .style("fill", function(d){
							      	//return self.palette[vname];
							      	return self.color;
							      })
							      .on("mouseover", function(d){
							      	div.transition()
							      		.duration(200)
							      		.style("opacity", 0.9);
							      	div .html((d.date) + "<br/>" + (d.number+ ""))
							      		.style("left", (d3.event.pageX) + "px")
							      		.style("top", (d3.event.pageY - 28) + "px");
							      	d3.select(this).style("fill", self.highlightColor);
							      	//self.parent.highlight(, viewId);
							      })
							      .on("mouseout", function(d){
							      	div.transition()
							      		.duration(500)
							      		.style("opacity", 0);
							      	//d3.select(this).style("fill", self.palette[vname]);
							      	d3.select(this).style("fill", self.color);
							      });

							      g.append("g")
											.attr("class", "centerline")
											.attr("transform", "translate(0," + y(0) + ")")
											.call(centerLine);

						},
						drawSimple: function(viewId, vname, data, parent, svgw, svgh){
							var self = this; 
							var scale = 1.0;
							var margin = {top: 30, right: 20, bottom: 40, left: 40},
							    width = svgw - margin.left - margin.right,
							    height = svgh * scale - margin.top - margin.bottom;
							
							var div = d3.select("body").append("div")	
									    .attr("class", "tooltip")				
									    .style("opacity", 0);
							//console.log(data);
							//console.log(parent); 
							if(self.parent.g2){								
								d3.select("#slave-draw-area-2"+viewId).remove(); 								
							}

							
							self.parent.g2 = self.parent.ssvg2.append("g")
												.attr("class", "slave-draw-area-2")
												.attr("id", "slave-draw-area-2"+viewId);
							var g = self.parent.g2.append("g").attr("transform","translate(" + margin.left + "," + margin.top + ")" );
							    

							var x = d3.scaleBand().rangeRound([0, width]).padding(0.1), 
								y = d3.scaleLinear().range([height, 0]).nice(); 

							x.domain(data.map(function(d){
									return d.date; 
							}));
							y.domain([0, d3.max(data, function(d){ return d.number; })]);
							g.append("g")
							      .attr("class", "x axis")
							      .attr("transform", "translate("+ 0+"," + (height) + ")")
							      .call(d3.axisBottom(x))
									.selectAll("text")	
										.text(function(d){
											return $Q.months[d-1] || d; 
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
							    .data(data)
							    .enter().append("rect")
							      .attr("class", "bar")
							      .attr("x", function(d) { return x(d.date); })
							      .attr("y", function(d) { return y(d.number); })
							      .attr("width", x.bandwidth())
							      .attr("height", function(d) { return height  - y(d.number); })
							      .style("fill", function(d){
							      	//return self.palette[vname];
							      	return self.color;
							      })
							      .on("mouseover", function(d){
							      	div.transition()
							      		.duration(200)
							      		.style("opacity", 0.9);
							      	div .html(self.months[(parseInt(d.date)-1)] + "<br/>" + (Math.round(d.number*10)/10+ ""))
							      		.style("left", (d3.event.pageX) + "px")
							      		.style("top", (d3.event.pageY - 28) + "px");
							      	d3.select(this).style("fill", self.highlightColor);
							      	//self.parent.highlight(, viewId);
							      })
							      .on("mouseout", function(d){
							      	div.transition()
							      		.duration(500)
							      		.style("opacity", 0);
							      	//d3.select(this).style("fill", self.palette[vname]);
							      	d3.select(this).style("fill", self.color);
							      });
						},
						highlight: function(tid){
							var self = this; 
							self.parent.g2.selectAll(".bar")
									.style("opacity", function(d,i){
										//d3.select(this).style("fill", "cyan");
										if(i === (tid-1)){																
											//return self.highlightColor;
											return 1.0;
										}
										else{
										//d3.select(this).style("opacity", 0.5);
										 return 0.3; 															
										}
									});
						},
						nohighlight: function(){
							var self = this;
							self.parent.g2.selectAll(".bar")
										.style("opacity", function(d,i){
											return 1.0; 
										});

						},
						drawCatBar: function(viewId, dict, parent, svgw, svgh){
							var self = this; 
								self.dict = dict;	
								var levels = Object.keys(dict[Object.keys(dict)[0]]); 
								var undef;

                                var ordered = [];
                                var orderedKeys = Object.keys(dict);
                                ////////////console.log(orderedKeys);
                                var xz = orderedKeys,
                                    yz = d3.range(levels.length).map(function(d){
                                        return Array.apply(null, Array(xz.length)).map(Number.prototype.valueOf,0);
                                    });
                                    for(var kx=0; kx < xz.length; kx++ ){
                                        for(var ky=0; ky < levels.length; ky++){  
                                         if(self.audit === "picanet")
                                         	yz[ky][kx] += dict[xz[kx]][levels[ky]]['value'];
                                         else                                      	
                                            yz[ky][kx] += dict[xz[kx]][levels[ky]];
                                        }
                                    }
                                    
                                   var y01z = d3.stack().keys(d3.range(levels.length))(d3.transpose(yz)),
                                        yMax = d3.max(yz, function(y) { return d3.max(y); }),
                                        y1Max = d3.max(y01z, function(y) { return d3.max(y, function(d) { return d[1]; }); });
    
                            self.yMax = y1Max; 
                            self.palette = [];

							if(self.parent.g2){
								var undef;
								d3.selectAll(".slave-draw-area-2"+self.id).remove(); 
								//self.parent.g1 = undef; 
							}
							
							self.parent.g2 = self.parent.ssvg2.append("g").attr("class", "slave-draw-area-2"+self.id);

							var margin = {top: 20, right: 20, bottom: 30, left:30};
							var width = svgw - margin.left - margin.right; 
							var height = svgh - margin.top - margin.bottom;
							
							var scale = 0.9; 
							
							

							var timeout = d3.timeout(function() {
											  changed(); 
											}, 4000);

							var g = self.parent.g2.append("g").attr("transform","translate(" + margin.left + "," + margin.top + ")" );

							var x = d3.scaleBand()
									    .domain(xz)
									    .rangeRound([0, width])
									    .padding(0.08);

							var y = d3.scaleLinear()
							    .domain([0, y1Max])
							    .range([height, 0]);

							var color = d3.scaleOrdinal()
							    .domain(d3.range(levels.length))
							    .range(d3.schemeCategory10);

							var series = g.selectAll(".series-sub")
							  .data(y01z)
							  .enter().append("g")
							  	.attr("class", "series-sub"+viewId)
							    .attr("fill", function(d, i) { 
							    	self.palette[i] = color(i);
							    	return color(i); });
							
							var origColor; 
							var rect = series.selectAll("rect")
							  .data(function(d) { return d; })
							  .enter().append("rect")
							  	.attr("class", "bar-sub")
							    .attr("x", function(d, i) { return x(i); })
							    .attr("y", height)
							    .attr("width", x.bandwidth())
							    .attr("height", 0)
							     .on("mouseover", function(d){
							  
							      	origColor = d3.select(this).style("fill");
							      	d3.select(this).style("fill", self.highlightColor);

							      })
							      .on("mouseout", function(d){
							      
							      	d3.select(this).style("fill", origColor);
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
								        .style("text-anchor", "end")
								        .attr("dx", "-.8em")
								        .attr("dy", ".15em")
								        .attr("transform", "rotate(-65)")
								        .call(changed);

								//////console.log(y.domain());
								//////console.log(y.range());
								g.append("g")
							      .attr("class", "y axis")
							      .call(d3.axisLeft(y).ticks(5, "s"))
							      .attr("transform", "translate(0,"+0+")");

							d3.selectAll(".toggle-button")
							    .on("click", changed);

							function changed() {
							  timeout.stop();
							  if (self.toggle === "grouped") 
							  	transitionGrouped();
							  else 
							    transitionStacked();
							}
						
						function transitionGrouped() {
							
						  y.domain([0, yMax]);
						  ////console.log(xz);
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
						      	return y(0) - y(d[1] - d[0]); });
						}
						function transitionStacked() {
							  y.domain([0, y1Max]);
				
							  rect.transition()
							      .duration(200)
							      .delay(function(d, i) { return i * 10; })
							      .attr("y", function(d) { return y(d[1]); })
							      .attr("height", function(d) { return y(d[0]) - y(d[1]); })
							    .transition()
							      .attr("x", function(d, i) { return x(xz[i]); })
							      .attr("width", x.bandwidth());
							}

						},
						prepData: function(data){
							var self = this;
							self.hasNegative = false;
							var res = [];
							for (var key in data){
								if(data[key]['unit'] < 0)
									self.hasNegative = true; 
								res.push({'date': key, 'number': data[key]['unit']});
							}
							return res; 
						},
						draw: function(viewId, color, dataname ,data, parent, svgw, svgh){
							var self = this;
							self.color = color; 
							//self.updateDataLinks(viewId, data, parent);
							//console.log(data); 
							if(dataname.indexOf("-") < 0){
								data = self.prepData(data); 
								if(!self.hasNegative)
									self.drawSimple(viewId, dataname, data, parent, svgw, svgh);
								else
									self.drawWithNegative(viewId, dataname, data, parent, svgw, svgh);
							}
							else 
								self.drawCatBar(viewId, data, parent, svgw, svgh); 
							
						}
					});
 })(QUALDASH);
