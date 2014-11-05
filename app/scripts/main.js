/*global d3:false*/
'use strict';

var gameStats;

var margin = {top: 10, right: 10, bottom: 10, left: 10},
    width = 800 - margin.left - margin.right,
    height = 700 - margin.top - margin.bottom;

var labelWidth = width/7;
var barMaxWidth = width/2 - labelWidth;

var svg = d3.select('body').select('.svg').append('svg')
	.attr('width', width+margin.left+margin.right)
	.attr('height', height+margin.top+margin.bottom);

var player = svg.selectAll('.player');

var yScale = d3.scale.linear()
	.range([height, 0]);

var xScale = d3.scale.linear()
	.range([1, barMaxWidth]);

function update(){
	var barHeight = height / gameStats.length;
	yScale.domain([0, gameStats.length]);
	xScale.domain([0, d3.max(gameStats, function(d) { return Math.max(d.values.wins, d.values.losses); })]);

	player = player.data(gameStats, function(d) { return d.key; });
	var playerEnter = player.enter().append('g')
		.attr('class', 'player')
		.attr('transform', function(d, i) { 
			return 'translate(0,' + parseFloat(i*barHeight+margin.top) + ')'; 
		});

	playerEnter.append('rect')
		.attr('class', 'wins')
		.attr('width', function(d) { return xScale(d.values.wins); })
		.attr('height', barHeight-3)
		.attr('transform', function(d) { 
			return 'translate(' + parseFloat(barMaxWidth - xScale(d.values.wins)) + ',0)'; 
		});

	playerEnter.append('rect')
		.attr('class', 'losses')
		.attr('width', function(d) { return xScale(d.values.losses); })
		.attr('height', barHeight-3)
		.attr('transform', function() { 
			return 'translate(' + parseFloat(barMaxWidth+labelWidth) + ',0)'; 
		});

	playerEnter.append('text')
		.text(function(d) { return d.key + ': ' + Math.round(d.values.wins/d.values.losses * 100) / 100; })
		.attr('transform', 'translate(' + barMaxWidth + ',0)')
		.attr('dy', '18px');
}

d3.tsv('gameStats.tsv', function(error, json){
	gameStats = d3.nest()
		.key(function(d) { return d.Player; })
		.rollup(function(leaves) { return { 'wins' : d3.sum(leaves, function(d){ return d.Win === 'TRUE'; }), 'losses' : d3.sum(leaves, function(d) { return d.Win === 'FALSE'; }), 'games': leaves }; })
		.entries(json);

	gameStats.sort(function(a, b){
		var toReturn = b.values.wins/b.values.losses - a.values.wins/a.values.losses;
		if(isNaN(toReturn)) {
			toReturn = b.values.wins - a.values.wins;
		}
		if(toReturn === 0){
			toReturn =  a.values.losses - b.values.losses;
		}

		return toReturn;
	});

	update();
});