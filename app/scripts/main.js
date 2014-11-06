/*global d3:false*/
'use strict';

var gameStats;

var width = 800,
    height = 750;

var labelWidth = 120;
var barMaxWidth = width/2 - labelWidth/2;

var svg = d3.select('body').select('.svg').append('svg')
	.attr('width', width)
	.attr('height', height);

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
			return 'translate(0,' + parseFloat(i*barHeight) + ')'; 
		});

	playerEnter.append('rect')
		.attr('class', 'wins')
		.attr('width', function(d) { return xScale(d.values.wins); })
		.attr('height', barHeight-1)
		.attr('transform', function(d) { 
			return 'translate(' + parseFloat(barMaxWidth - xScale(d.values.wins)) + ',0)'; 
		});

	playerEnter.append('rect')
		.attr('class', 'losses')
		.attr('width', function(d) { return xScale(d.values.losses); })
		.attr('height', barHeight-1)
		.attr('transform', function() { 
			return 'translate(' + parseFloat(barMaxWidth+labelWidth) + ',0)'; 
		});

	playerEnter.append('text')
		.attr('class', 'text-box')
		.attr('transform', 'translate(' + width/2 + ',0)')
		.text(function(d) { return d.key + ': ' + Math.round(d.values.wins/(d.values.losses+d.values.wins) * 100) / 100; })	
		//.style('font-size', function() { return Math.min(labelWidth, (labelWidth - 8) / this.getComputedTextLength() * 14) + 'px'; })
		.attr('dy', parseFloat((barHeight+2)/2) + 'px');
}

d3.tsv('gameStats.tsv', function(error, json){
	gameStats = d3.nest()
		.key(function(d) { return d.Player; })
		.rollup(function(leaves) { return { 'wins' : d3.sum(leaves, function(d){ return d.Win === 'TRUE'; }), 'losses' : d3.sum(leaves, function(d) { return d.Win === 'FALSE'; }), 'games': leaves }; })
		.entries(json);

	gameStats.sort(function(a, b){
		var toReturn = b.values.wins/(b.values.losses+b.values.wins) - a.values.wins/(a.values.losses+b.values.wins);
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