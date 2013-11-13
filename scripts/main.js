/*globals Q, d3 */

(function() {
	'use strict';
	var graphId = 'artCircles';

	function ArtCirclesGraph(sourceElement) {
		this.sourceElement = sourceElement;
	}

	ArtCirclesGraph.prototype.parseLinks = function(links) {
		var nodes = {};
		links.forEach(function(link) {
			if (!nodes[link.source]) {
				nodes[link.source] = {name: link.source};
			}
			if (!nodes[link.target]) {
				nodes[link.target] = {name: link.target};
			}
		});

		links.forEach(function(link) {
			link.source = nodes[link.source];
			link.target = nodes[link.target];
		});
		this.nodes = d3.values(nodes);
		this.links = links;
		return this;
	};

	ArtCirclesGraph.prototype.getWidth = function() {
		return this.sourceElement.offsetWidth;
	};

	ArtCirclesGraph.prototype.getHeight = function() {
		return this.sourceElement.offsetHeight;
	};

	ArtCirclesGraph.prototype.start = function() {
		var width = this.getWidth();
		var height = this.getHeight();

		this.force = d3.layout.force()
			.nodes(this.nodes)
			.links(this.links)
			.size([width, height])
			.gravity(.1)
			.linkStrength(.2)
			.friction(.8)
			.linkDistance(75)
			.charge(-150)
			.on('tick', this.onTick.bind(this))
			.start();

		this.xScale = d3.scale.linear()
			.domain([-width / 2, width / 2])
			.range([0, width]);

		this.yScale = d3.scale.linear()
			.domain([-height / 2, height / 2])
			.range([height, 0]);

		this.zoom = d3.behavior.zoom()
			.scaleExtent([1, 8])
			.x(this.xScale)
			.y(this.yScale)
			.scaleExtent([1, 10])
			.on('zoom', this.onZoom.bind(this));

		this.svg = d3.select(this.sourceElement)
			.append('svg');

		this.rootGroup = this.svg.append('g')
			.call(this.zoom);

		this.rootGroup.append('rect')
			.attr('width', width)
			.attr('height', height)
			.attr('class', 'bg');

		this.linkElements = this.rootGroup.selectAll('.link')
			.data(this.links)
			.enter().append('line')
			.attr('class', 'link');

		this.nodeGroups = this.rootGroup.selectAll('.node')
			.data(this.nodes)
			.enter().append('g')
			.attr('class', 'node')
			.call(this.force.drag);

		this.nodeGroups.append('circle')
			.attr('r', 10);

		this.nodeGroups.append("text")
			.attr('dx', 12)
			.attr('dy', '.35em')
			.text(function(node) { return node.name; });
	};

	ArtCirclesGraph.prototype.onTick = function() {
		this.linkElements
			.attr('x1', function(link) { return link.source.x; })
			.attr('y1', function(link) { return link.source.y; })
			.attr('x2', function(link) { return link.target.x; })
			.attr('y2', function(link) { return link.target.y; });
		this.nodeGroups.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
	};

	ArtCirclesGraph.prototype.onZoom = function() {
		this.rootGroup.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
	};

	function csv(url, accessor) {
		var deferred = Q.defer();
		d3.csv(url, accessor, function(data) {
			if (data) {
				deferred.resolve(data);
			} else {
				deferred.reject(new Error('Data retrieval failed'));
			}
		});
		return deferred.promise;
	}

	function parseRecord(record) {
		if (typeof(record.value) !== 'undefined') {
			if (isNaN(record.value)) {
				console.error('non-numeric value: ' + record.value);
			} else {
				record.value = parseFloat(record.value);
			}
		}
		return record;
	}

	var graph = new ArtCirclesGraph(document.getElementById(graphId));
	csv('data/links.csv', parseRecord)
		.then(function(links) {
			graph.parseLinks(links);
			graph.start();
			return this;
		})
		.fail(function(err) {
			console.error(err);
		});
}());
