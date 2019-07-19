(function($Q){
	'use strict'
	$Q.SubScatterChart = $Q.defineClass(
					null, 
					/**
					*  scatter plot inspired from: https://bl.ocks.org/mthh/e9ebf74e8c8098e67ca0a582b30b0bf0
					**/
					function SubScatterChart(viewId, comboname ,data, parent, svgw, svgh){
						var self = this;	
						self.parent = parent; 
						self.id = viewId; 			
						self.drawSeq(viewId, comboname, data, parent, svgw, svgh);
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
						prepData: function(data){
							var self = this;
							var res = []; 
							for(var key in data){
								if(key !== "xs" && key !== "ys" && key !== "xType" && key !== "yType"){
									for(var kk in data[key]){									
										var temp = {};
										temp['x'] = key;
										temp['y'] = kk; 
										temp['size'] = data[key][kk][Object.keys(data[key][kk])[0]];
										temp['shade'] = data[key][kk][Object.keys(data[key][kk])[1]];	
										res.push(temp); 																	
									}
								}
							}
							return res; 
						},
						drawSeq: function(viewId, data, parent, svgw, svgh){
							var self = this;
							console.log(data);
							var unitPatients = Object.keys(data);
							var margin = { top: 20, right: 20, bottom: 30, left: 30 },
								width = svgw - margin.left - margin.right,
								height = svgh - margin.top - margin.bottom;

							var x = d3.scaleLinear().range([0, width]);
							var y = d3.scaleBand()
							          .range([height, 0])
							          .padding(0.1);
							 
							y.domain(unitPatients.map(function(d) { return d; }));
							
							//var xAxis = d3.axisBottom(x),
							//    yAxis = d3.axisLeft(y).ticks(unitPatients.length);

							var svg = parent.ssvg3.append("svg")
										  .attr("width", width + margin.left + margin.right)
										  .attr("height", height + margin.top + margin.bottom)
										  .append("g")
										  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

							x.domain(d3.extent(0,365)).nice(); // days in a year
							
							var xlabel = "time", 
								ylabel = "patients"; 

							svg.append("g")
							   .attr("class", "sub-x axis")
							   .attr('id', "axis--x--sub"+self.id)
							   .attr("transform", "translate(0," + height + ")")
							   .call(d3.axisBottom(x));

								svg.append("text")
								  .style("text-anchor", "end")
								  .attr("x", width - 4)
								  .attr("y", height - 8)
								  .text(xlabel);

							svg.append("g")
							    .attr("class", "sub-y axis")
							    .attr('id', "axis--y--sub"+self.id)
							    .call(d3.axisLeft(y));

							svg.append("text")
	    						.attr("transform", "rotate(-90)")
	    						.attr("x", -5)
	    						.attr("y", 4)
	    						.attr("dy", "1em")
	    						.style("text-anchor", "end")
	    						.text(ylabel);



						},
						draw: function(viewId, comboname, cdata, parent, svgw, svgh){
							var self = this;
							//self.updateDataLinks(viewId, data, parent);
							console.log(cdata); 
							var xlabel = comboname.split("&")[0];
							var ylabel = comboname.split("&")[1];

							const color = d3.schemeCategory10;
							var margin = { top: 20, right: 20, bottom: 30, left: 30 },
								width = svgw - margin.left - margin.right,
								height = svgh - margin.top - margin.bottom;

							var x = (cdata['xType']==="q")? d3.scaleLinear().range([0, width]).nice()
														  : d3.scaleBand().rangeRound([0, width]).padding(0.1);

							var y = (cdata['yType']==="q")? d3.scaleLinear().range([height, 0])
														  : d3.scaleBand().rangeRound([height, 0]).padding(0.1);

							var maxRadius = 10,
								minRadius = 1; 
							var maxArea = Math.PI * Math.pow(maxRadius, 2);
							var size = d3.scaleLinear().range([0, maxArea]); 
							var shade = d3.scaleLinear().range([0.3,1]);

							var xAxis = d3.axisBottom(x).ticks(cdata['xs'].length),
							  yAxis = d3.axisLeft(y).ticks(cdata['ys'].length);

const xAxis2 = d3.axisBottom(x).ticks(cdata['xs'].length),
  yAxis2 = d3.axisLeft(y).ticks(cdata['ys'].length);

const brush = d3.brush()
  .extent([[0, 0], [width, height]])
  .on("end", brushended);

let idleTimeout,
  idleDelay = 350;

							var data = self.prepData(cdata); 
							var svg = parent.ssvg3.append("svg")
							  .attr("width", width + margin.left + margin.right)
							  .attr("height", height + margin.top + margin.bottom)
							  .append("g")
							  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

							const clip = svg.append("defs").append("svg:clipPath")
							  .attr("id", "clip")
							  .append("svg:rect")
							  .attr("width", width )
							  .attr("height", height )
							  .attr("x", 0)
							  .attr("y", 0);
							console.log(data); 
							if(cdata['xType']==="q")
									x.domain(d3.extent(data, d => d.x)).nice();
							else 
								x.domain(data.map(function(d){
									return d.x; 
									}));
							if(cdata['yType']==="q")
									y.domain(d3.extent(data, d => d.y)).nice();
							else
									y.domain(data.map(function(d){
									return d.y; 
									}));

							size.domain(d3.extent(data, d => d.size)); 
							shade.domain(d3.extent(data, d => d.shade));


const scatter = svg.append("g")
     .attr("id", "scatterplot")
     .attr("clip-path", "url(#clip)");
     //.attr("transform", "translate("+ +",22)");

scatter.selectAll(".dot")
    .data(data)
  .enter().append("circle")
    .attr("class", "dot")
    .attr("r", d => (Math.sqrt(size(d.size))/Math.PI))
    .attr("cx", d => (x(d.x)+x(data[0]['x'])*0.82))
    .attr("cy", d => (y(d.y)+y(data[0]['y'])*0.42))
    .attr("opacity", d => shade(d.shade))
    .style("fill", (_, i) => color[i % 9]);;

makeGrid();


							svg.append("g")
							   .attr("class", "sub-x axis")
							   .attr('id', "axis--x--sub"+self.id)
							   .attr("transform", "translate(0," + height + ")")
							   .call(xAxis);

								svg.append("text")
								  .style("text-anchor", "end")
								  .attr("x", width - 4)
								  .attr("y", height - 8)
								  .text(xlabel);

							svg.append("g")
							    .attr("class", "sub-y axis")
							    .attr('id', "axis--y--sub"+self.id)
							    .call(yAxis);

							svg.append("text")
	    						.attr("transform", "rotate(-90)")
	    						.attr("x", -5)
	    						.attr("y", 4)
	    						.attr("dy", "1em")
	    						.style("text-anchor", "end")
	    						.text(ylabel);

scatter.append("g")
    .attr("class", "brush")
    .call(brush);

function brushended() {
  const s = d3.event.selection;
  if (!s) {
      if (!idleTimeout) {
        return idleTimeout = setTimeout(() => {
          idleTimeout = null;
        }, idleDelay);
      }
      x.domain(d3.extent(data, d => d.x)).nice();
      y.domain(d3.extent(data, d => d.y)).nice();
  } else {
      x.domain([s[0][0], s[1][0]].map(x.invert, x));
      y.domain([s[1][1], s[0][1]].map(y.invert, y));
      scatter.select(".brush").call(brush.move, null);
  }
  zoom();
}


function makeGrid() {
  svg.insert("g", '#scatterplot')
    .attr("class", "grid grid-x")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis2
      .tickSize(-height)
      .tickFormat(''));

  svg.insert("g", '#scatterplot')
    .attr("class", "grid grid-y")
    .call(yAxis2
      .tickSize(-width)
      .tickFormat(''));

  svg.selectAll('.grid')
    .selectAll('line')
    .attr('stroke', 'lightgray');
}

function zoom() {
  const t = scatter.transition().duration(750);
  svg.select("#axis--x").transition(t).call(xAxis);
  svg.select(".grid-x")
      .transition(t)
      .call(xAxis2
        .tickSize(-height)
        .tickFormat(''))
      .selectAll('line')
      .attr('stroke', 'lightgray');

  svg.select("#axis--y").transition(t).call(yAxis);
  svg.select(".grid-y")
      .transition(t)
      .call(yAxis2
        .tickSize(-width)
        .tickFormat(''))
      .selectAll('line')
      .attr('stroke', 'lightgray');

  scatter.selectAll("circle")
    .transition(t)
    .attr("cx", d => x(d.x))
    .attr("cy", d => y(d.y));
}
						
							
						}
					});
 })(QUALDASH);
