(function($Q){
	'use strict'
	$Q.LineChart = $Q.defineClass(
					null, 
					function LineChart(dataView, pCard){
						var self = this;
							//////////console.log(data);
							self.id = dataView['viewId'];
							self.data = dataView['data'];
							self.parent = pCard; 
							var drawArea = d3.select("#draw-area"+self.id);
							var parentArea = drawArea.select(function(){
								//d3.select(this.parentNode).on("resize", resize);
								return this.parentNode; 
							});
							var margin = {top: 10, right: 10, bottom: 65, left:30};
							////////console.log(parentArea.node().getBoundingClientRect());
							var svgw =  0.9* parentArea.node().getBoundingClientRect().width;
							var svgh =  0.9* parentArea.node().getBoundingClientRect().height; 
							var width = svgw - margin.left - margin.right; 
							var height = svgh - margin.top - margin.bottom;

							if(self.parent.svg)
								d3.select(".mainsvg"+self.id).remove(); 

							self.parent.svg = d3.select("#draw-area"+self.id).append("svg")
											.attr("id", "mainsvg"+self.id)
											.attr("class", "mainsvg"+self.id)
											.attr("width", svgw)
											.attr("height", svgh)											
											.attr("transform", "translate("+ 0+","+0+")")
											.attr("text-anchor", "middle")
							      			.style("font", "12px sans-serif");
											
							var div = d3.select("body").append("div")	
									    .attr("class", "tooltip")				
									    .style("opacity", 0);
							
							// parse the date / time
							//var parseTime = d3.timeParse("%d-%b-%y");

							var g = self.parent.svg.append("g")
									.attr("transform", "translate(" + margin.left + ", "+ 0 +")");

							// set the ranges
							var x = d3.scaleBand().rangeRound([0, width]).padding(0.1), 
								y = d3.scaleLinear().range([height, 0]).nice(); 
		
							x.domain(self.data.map(function(d){
									return d.date; 
							}));
							y.domain([0, d3.max(self.data, function(d){ return d.number; })]);
											
							g.append("g")
							      .attr("class", "x axis")
							      .attr("transform", "translate("+ 0+"," + (height+margin.top) + ")")
							      .call(d3.axisBottom(x))
									.selectAll("text")	
								        .style("text-anchor", "end")
								        .attr("dx", "-.8em")
								        .attr("dy", ".15em")
								        .attr("transform", "rotate(-65)");

							//console.log(y.domain());
							//console.log(y.range());
						
							g.append("g")
							      .attr("class", "y axis")
							      .call(d3.axisLeft(y).ticks(5,"s"))
							      .attr("transform", "translate("+0+","+ margin.top+")");
							
							// define the line
							var valueline = d3.line()
							    .x(function(d) { return x(d.date); })
							    .y(function(d) { return y(d.number); });

							 // Add the valueline path.
							  g.append("path")
							      .data([self.data])
							      .attr("class", "line")
							      .attr("d", valueline)
							      .style("fill", "none")
							      .style("stroke", "black");


					},
					{

					});
 })(QUALDASH);
