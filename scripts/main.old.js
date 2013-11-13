// get the data
d3.csv("force.csv", function(error, links) {

	var nodes = {};

// Compute the distinct nodes from the links.
	links.forEach(function(link) {
		link.source = nodes[link.source] ||
			(nodes[link.source] = {name: link.source});
		link.target = nodes[link.target] ||
			(nodes[link.target] = {name: link.target});
		link.value = +link.value;
	});

// basics
	var margin = {top: 0, right: 0, bottom: 0, left: 0},
		width = document.getElementById("artcirclesdiv").style.width - margin.left - margin.right,
		height = document.getElementById("artcirclesdiv").style.width - margin.top - margin.bottom;
	console.log("Width: " + width + " and height: " + height)
	var n = 200,
		m = 10,
		padding = 12,
		radius = d3.scale.sqrt().range([0, 12]),
		color = d3.scale.category10().domain(d3.range(m));

// defining the position
	function position() {
		this.style("left", function(d) { return d.x + "px"; })
			.style("top", function(d) { return d.y + "px"; })
			.style("width", function(d) { return Math.max(0, d.dx - 1) + "px"; })
			.style("height", function(d) { return Math.max(0, d.dy - 1) + "px"; });
	}




	var force = d3.layout.force()
		.nodes(d3.values(nodes))
		.links(links)
		.gravity(.1)
		.size([width, height])
		.linkStrength(.2)
		.friction(.8)
		.linkDistance(75)
		.charge(-150)
		.on("tick", tick)
		.start();

	var svg = d3.select("#artcircles")
		.append('g')
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")")
		.call(d3.behavior.zoom().scaleExtent([1, 8]).on("zoom", zoom));

	/*var body = d3.select("#artcircles")
	 .call(d3.behavior.zoom().scaleExtent([1, 8]).on("zoom", redraw))
	 .append("g");*/

// add the links and the arrows
	var path = svg.append("svg:g").selectAll("path")
		.data(force.links())
		.enter().append("svg:path")
		.attr("class", "link");

// define the nodes
	var node = svg.selectAll(".node")
		.data(force.nodes())
		.enter().append("g")
		.attr("class", "node")
		.call(force.drag);

// add the nodes
	node.append("circle")
		.attr("r", 10)
		.style("fill", "#BBBDC0");

// add the text 
	node.append("text")
		.attr("text-anchor", "middle")
		.text(function(d) { return d.name; });

	// force
	var circle = svg.selectAll("circle")
		.data(nodes)
		.enter().append("circle")
		.attr("r", function(d) { return d.radius; })
		.style("fill", function(d) { return d.color; })
		.call(force.drag);

	function tick(e) {
		circle
			.attr("cx", function(d) { return d.x; })
			.attr("cy", function(d) { return d.y; });
		path.attr("d", function(d) {
			var dx = d.target.x - d.source.x,
				dy = d.target.y - d.source.y,
				dr = 0; //Math.sqrt(dx * dx + dy * dy);
			return "M" +
				d.source.x + "," +
				d.source.y + "A" +
				dr + "," + dr + " 0 0,1 " +
				d.target.x + "," +
				d.target.y;
		});

		node
			.attr("transform", function(d) {
				return "translate(" + d.x + "," + d.y + ")"; });
	}

	function redraw(e) {
		d3.select("svg").attr("transform",
			"translate(" + d3.event.translate + ")"
				+ " scale(" + d3.event.scale + ")");
	}

	// zoom & pan
	var x = d3.scale.linear()
		.domain([-width / 2, width / 2])
		.range([0, width]);

	var y = d3.scale.linear()
		.domain([-height / 2, height / 2])
		.range([height, 0]);

	svg.append("div")
		.attr("width", width)
		.attr("height", height);

	function zoom() {
		svg.attr("transform", "translate(" + 5 + ")scale(" + 5 + ")");
	}

});
