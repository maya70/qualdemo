cardSetupDrag: function(viewId){
							var self= this; 
							var curx, cury; 
							var container = d3.select("#cardcontainer"+viewId)
										.call(d3.drag()
											.on('start.interrupt', function(){
												container.interrupt();
												curx = d3.event.x ;
												cury = d3.event.y ;
											
											})
											.on('start drag', function(){
												//var curx = parseInt(container.style('left'));											
												var dx = d3.event.x - curx; 
												var dy = d3.event.y - cury;
											
												if(dx > 30 || dy > 30 )
												{
													container.style('top',  (d3.event.y) + 'px');
													container.style('left', (d3.event.x) + 'px');
												}
											}));

							var div = d3.select("#card"+viewId);

							div.call(d3.drag()
								.on('drag', function(){
											 var x = d3.mouse(this.parentNode)[0];
											 var y = d3.mouse(this.parentNode)[1];
											 var pWidth = this.parentNode.getBoundingClientRect().width; 
											 var pHeight = this.parentNode.getBoundingClientRect().height; 
											 if (x > (pWidth - 20) && y > (pHeight - 20) )
											 {
												console.log(y);
												//x = Math.max(50, x);
												//y = Math.max(50, y);
												div.style('width', x + 'px'); 	
												div.style('height', y + 'px'); 
												container.style('width', (x) +'px');	
												container.style('height', (y) +'px');	
												div.dispatch("resize");
											 }
											
										}));
								
							
						},
						