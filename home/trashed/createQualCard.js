createQualCard: function(viewId){
							var self = this;
							var container = d3.select("#mainCanvas").append("div")
								.attr("class", "draggabledivcontainer")
								.attr("id", "cardcontainer"+viewId)
								.style("margin-top", "20px")
								.style("top", self.nextAvailY +"px")
								.style("left", self.nextAvailX +"px");
								//.style("top", "110px")
								//.style("left", "580px");

							var header = container.append("form")
									.attr("class", "cardheader")
										.append("div").attr("class", "form-group");

							header.append("label")
								.attr("class", "form-label")
								.attr("for", "sel1")
								.text("Metric: ");

							var metricSelect = header.append("select")
												.attr("name", "metricselector")
												.attr("class", "form-control")
												.attr("id", "sel"+viewId)
												.on("change", function(d){
													console.log(this.value);
												});

							
							for(var m = 0; m < self.availMetrics.length; m++){
								metricSelect.append("option")
											.attr("value", self.availMetrics[m]['value'])
											.text(self.availMetrics[m]['text']);
							}
							
							var curMetric = self.availMetrics[(viewId%self.availMetrics.length)]['value'];
							console.log(curMetric);
							$('#sel'+viewId).val(curMetric);
							$('.selectpicker').selectpicker('refresh');

							var card = container.append("div")
									.attr("class", "draggablediv")
									.attr("id", "card"+viewId);

							card.append("div")
								.attr("class", "control-panel")
								.attr("id", "panel"+viewId);

							self.nextAvailX += container.node().getBoundingClientRect().width; 
							console.log("NEXT "+ self.nextAvailX);
						},
						