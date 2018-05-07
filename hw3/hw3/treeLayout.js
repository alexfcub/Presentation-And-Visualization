function TreeLayout(){
// adapted from 
https://bl.ocks.org/d3noob/43a860bc0024792f8803bba8ca0d5ecd , https://bl.ocks.org/mbostock/4339083 
	/*************** initial settings *****************/
	var root,
		treeLayout, //initial tree layout
		treedata,	//tree layout with the data associated
		nodes,		//the nodes of the tree layout
		links,		//the links of the tree layout
		distanceNode = 180,//we fix the horizontal distance between nodes
		distanceLabelX = 13,//distance from label to node
		distanceLabelY = -7,//distance from label to node
		margin = {top:20,right:90,bottom:30,left:90},
		width,
		height,
		duration = 700,  //transition duration
		zScale = d3.scaleOrdinal(d3.schemeCategory20);
		
		
	/*************** end initial settings ****************/

	function my(selection) {
		var color = d3.scaleOrdinal()
		.domain(["Product line","Product type", "Product"])
		.range(['#CCCCFF', '#92A1CF', '#2A52BE']);

		var colors = ['#CCCCFF', '#92A1CF', '#2A52BE'];
	
		selection.each(function(data) {
			
		if(!width) throw new Error("Tree layout width must be defined.");
		if(!height) throw new Error("Tree layout height must be defined.");
		

		/*************** containers and graph groups ***************/
		var svg = d3.select(this)
			.attr("width",width)
			.attr("height",height)
			
		var g = svg.selectAll("g")
			.data([1]);
		
		g = g.enter() //this will only be created once, not at update
		   .append('g')
		   .attr("id","tree")
		   .attr('transform','translate(' + margin.left +','+margin.top+')');
		
		var innerWidth = width - margin.left - margin.right;
		var innerHeight = height - margin.top - margin.bottom;
		
		g			//this will only be created once, not at update
			.append('g')
			.attr("class","links");

		g			//this will only be created once, not at update
			.append('g')
			.attr("class","nodes") //the nodes must be drawn after the lines

			
		
		/*********** end containers and graph groups ***************/

		
		/*********** scales ****************************************/
		
		zScale
			.domain(["Product line","Product type", "Product"])

		
		/*********** end of scales *********************************/
				
		/********** preparing the data ****************************/
		
		//we create the tree layout	
		var treeLayout = d3.tree()
			.size([innerHeight,innerWidth]);
		root = d3.hierarchy(data,function(d) {return d.children;});
		root.x0 = innerHeight/2;
		root.y0 = 0;
		root.children.forEach(collapse);

		update(root);

		// Collapse the node and all it's children
		function collapse(d) {
		  if(d.children) {
			d._children = d.children
			d._children.forEach(collapse)
			d.children = null
		  }
		};

		function update(source) {	
		//we create a new variable joining the tree layout and the data
		var treeData=treeLayout(root);
		
		// Compute the new tree layout.
		nodes = treeData.descendants();
		links = treeData.descendants().slice(1);

		// We fix the distance between nodes
		nodes.forEach(function(d){ d.y = d.depth * distanceNode});
		
		/********** end preparing the data ************************/
	   
			

		/***************** nodes **************************/
			
		//datajoin with only nodes
		
		var nodeGroup =d3.select('svg g.nodes')
		  .selectAll('g.node')
		  .data(nodes, function(d) {return d.data.name;}); 
				//we put an id to ensure object constancy

		//Circles enter
		var nodeEnter=
			nodeGroup.enter()
			.append("g")
				.classed('node', true)
				.attr("transform", function(d) {return "translate(" + source.y0 + "," + source.x0 + ")"; })
				.on('click',click); //we add an event listener
		
		nodeEnter
			.append('circle')
				.attr("id",function(d) {return d.data.name;})
				.classed(function(d) {return d.children || d._children ? "internal" : "leaf";},true)
				.attr('r', function(d) {return Math.sqrt(d.data.radius)*50+1;})
				.attr("fill",function(d) {return colors[d.data.level-1]/* d.children || d._children ? zScale("internal") : zScale("leaf")*/;});

				
		//Labels enter
		nodeEnter
			.append('text')
				.attr('x', function(d) { return d.children || d._children ? -distanceLabelX : distanceLabelX; })
				.attr('y', distanceLabelY)
				.attr('dy', '.35em')
				.style('text-anchor',function(d) { return d.children || d._children ? "end" : "start";}) //for internal end, for leaves start
				.text(function(d) {return d.data.name;})
				
		// UPDATE
		var nodeUpdate = nodeEnter
							.merge(nodeGroup);

	  // Transition to the proper position for the node
	  nodeUpdate.transition()
		.duration(duration)
		.attr("transform", function(d) { 
			return "translate(" + d.y + "," + d.x + ")";
		 });

	  // Update the node attributes and style
	  nodeUpdate.select('circle.node')
		.attr('r',  function(d) {return Math.sqrt(d.data.radius)*50+1;})
		.style("fill", function(d) {return colors[d.data.level-1]/*d._children ? 
									zScale("internal") : zScale("leaf")*/;})
		.attr('cursor', 'pointer');

		
		nodeUpdate.select('g.node circle text')
			.text(function(d) {return d.data.name;})
		
		//Nodes and node labels exit
		var nodeExit = nodeGroup.exit()
			.transition()
			.duration(duration)
			.attr("transform", function(d) {
					return "translate(" + source.y + "," + source.x + ")";})			
			.remove();		

		  // On exit reduce the node circles size to 0
		nodeExit.select('circle')
			.attr('r', 1e-6);

		// On exit reduce the opacity of text labels
		nodeExit.select('text')
			.style('fill-opacity', 1e-6);
	
			
		/******************** end nodes *****************************/


		
		/********************* links ********************************/
		//datajoin with only links
		
		var linkGroup =svg.select('g.links')
		   .selectAll('path.link')
		   .data(links,function(d) { return d.data.name; });
			//we put an id to ensure object constancy
		

		var linkEnter = linkGroup.enter()
			.append('path', 'g')
				.classed('link', true)
				.attr('d', function(d){
					var o = {x: source.x0, y: source.y0}
					return diagonal(o, o)});

		// UPDATE
		var linkUpdate = linkEnter.merge(linkGroup);
		
		// Transition back to the parent element position
		linkUpdate
			.transition()
			.duration(duration)
			.attr('d', function(d){return diagonal(d, d.parent);});
		

		var linkExit = linkGroup.exit()
			.transition()
			.duration(duration)
			.attr('d', function(d) {
				var o = {x: source.x, y: source.y}
				return diagonal(o, o)
			})
			.remove();
		/********************* edges ********************************/
		// Store the old positions for transition.
		nodes.forEach(function(d){
			d.x0 = d.x;
			d.y0 = d.y;
		});
		

		/* color legend */
	
		var colorLegendSVG = d3.select("#colorLegend")
			.attr("style","padding:30")
			.attr("width",300)
			.attr("height",100)

		
		var legendOrdinal = d3.legendColor()
			.shapePadding(5)
			.scale(color)
			.title(zLegend)
			.labelWrap(20)
			.on("cellclick",legendColorsCellClick())
			.on("cellover",legendColorsCellOver())
			.on("cellout",legendColorsCellOut()); 
	
		colorLegendSVG
		  .call(legendOrdinal);		
					
		/* end color legend */		

		/***************************** INTERACTION *****************************/

		function click(d) {
			if (d.children) {
				d._children = d.children;
				d.children = null;
			  } else {
				d.children = d._children;
				d._children = null;
			  }
			update(d);
		};
		
		function legendColorsCellClick() {
		};

		function legendColorsCellOver() {
		};

		function legendColorsCellOut() {
		};

		/***************************** INTERACTION *****************************/

		/*********************** AUXILIAR FUNCTIONS *****************************/


		// Auxiliar function that creates a curved (diagonal) path from parent to the child nodes
		function diagonal(source,target) {
			return "M" + source.y + "," + source.x
					+ "C" + ((source.y + target.y) / 2) + "," + source.x
					+ " " + ((source.y + target.y) / 2) + "," + source.x
					+ " " + target.y + "," + target.x;
		}; 
/******************** end AUXILIAR FUNCTIONS ****************************/

		
		}; //end update
		});//end selection each
	}; //end function my
	
	/*************** SETTERS AND GETTERS ON GRAPH SETTINGS ************
	
	They follow the pattern
	
	some_function.x = function(value) {
		if (!arguments.length) {
			return x;
		} else {
			x = value;
			return my;
		}
	};
		
	in a compressed form
		
	*/
	my.width = function (value){
        return arguments.length ? (width = value, my) : width;
    };
        
    my.height = function (value){
		return arguments.length ? (height = value, my) : height;
    };
        

	my.zLegend = function (value){
		return arguments.length ? (zLegend = value, my) : zLegend;
    };

	my.colorLegendWidth= function (value){
        return arguments.length ? (colorLegendWidth = value, my) : colorLegendWidth;
    };
		
	my.colorLegendHeight= function (value){
        return arguments.length ? (colorLegendHeight = value, my) : colorLegendHeight;
    };


	my.duration = function (value){
		return arguments.length ? (duration = value, my) : duration;
    };
	
    return my;
	/*********** end SETTERS AND GETTERS ON GRAPH SETTINGS ***********/

};


	