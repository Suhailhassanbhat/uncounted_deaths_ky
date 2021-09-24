import * as d3 from 'd3';
let pymChild;

const margin = { top: 30, left: 40, right: 30, bottom: 60 };
const height = 500 - margin.top - margin.bottom;
const width = 700 - margin.left - margin.right;

const svg = d3
	.select('#graphics')
	.append('svg')
	// .style('background-color', 'lightgrey')
	.attr('height', height + margin.top + margin.bottom)
	.attr('width', width + margin.left + margin.right)
	.append('g')
	.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

// Parse time
const parseTime = d3.timeParse('%Y-%m-%d');

// Scales
const xPositionScale = d3.scaleLinear().range([0, width]);
const yPositionScale = d3.scaleLinear().range([height, 0]);

// Line here
const lineReportedDeaths = d3
	.line()
	.x((d) => xPositionScale(d.datetime))
  .y((d) => yPositionScale(+d.reported_deaths_7DMA));

const lineDeaths = d3
	.line()
	.x((d) => xPositionScale(d.datetime))
  .y((d) => yPositionScale(+d.deaths_7DMA));


// Read data

d3.csv(require('/data/daily_deaths.csv'))
	.then(ready)
	.catch((err) => {
		console.log(err);
	});

function ready(daily_deaths) {
	daily_deaths.forEach((d) => {
		d.datetime = parseTime(d.date);
  });
//   console.log(delay_data)
  console.log(daily_deaths)

  
	const filtered_data = daily_deaths.filter(function(d) {
		return d.date > '2020-10-31' && d.date < '2021-02-01';
  });

  	const filtered_deaths = filtered_data.map((d) => +d.deaths_7DMA);
  	const dates = daily_deaths.map((d) => d.datetime);
	const rdeaths = daily_deaths.map((d) => +d.reported_deaths_7DMA);

	// update scales
  	const allDates = d3.extent(dates)
  	const filteredDates = [parseTime('2020-10-31'), parseTime('2021-02-01')]
  
	xPositionScale.domain(allDates);
  	yPositionScale.domain([0, d3.max(rdeaths) + 20]);
  
  	const deathsLine = svg.append('path').datum(daily_deaths).attr('class','deaths').attr('d', lineDeaths).attr('opacity',0)
  	const rDeathsLine = svg.append('path').datum(daily_deaths).attr('class','rdeaths').attr('d', lineReportedDeaths)
  

	const restrictionsRect = svg.append('rect')
		.attr('x', xPositionScale(parseTime('2020-11-19')))
		.attr('y', margin.top + 10)
		.attr('class', 'restrictions')
		.attr('width', xPositionScale(parseTime('2020-12-14')) -
		xPositionScale(parseTime('2020-11-19')))
		.attr('height', height - margin.top - 10)
		.lower();

	svg.append('text')
		.attr('class', 'restrictions_label')
		.text('Restrictions Duration')
		.attr('font-size', '12')
		.attr('x', xPositionScale(parseTime('2020-11-19')))
		.attr('y', height / 2)
		.attr('text-anchor', 'end');

	// Data dump labels

	svg.append('rect')
		.attr('x', xPositionScale(parseTime('2021-03-10')))
		.attr('y', margin.top + 10)
		.attr('class', 'audit_deaths')
		.attr('width', 1)
		.attr('height', height - margin.top - 10)
		.attr('fill', 'gray')
		.lower();

	svg.append('text')
		.attr('class', 'march_dump')
		.html('Audit starts')
		.attr('font-size', '12')
		.attr('x', xPositionScale(parseTime('2021-03-10')))
		.attr('y', height / 6)
		.attr('text-anchor', 'middle');

	svg.append('text')
		.attr('class', 'june_dump')
		.html('Final audit')
		.attr('font-size', '12')
		.attr('x', xPositionScale(parseTime('2021-06-01')))
		.attr('y', height / 3)
		.attr('text-anchor', 'middle');

	/// /text labels////////////////////////////////
	svg.append('text')
		.attr('class', 'x_label')
		.text('7-day avg. count')
		.attr('font-size', '12');

	// draw axis

	const yOptions = d3
		.axisLeft(yPositionScale)
		.tickPadding(15)
		.ticks(5);
	const yAxis = svg.append('g').attr('class', 'axis y-axis').call(yOptions);

	const xOptions = d3.axisBottom(xPositionScale);
	const xAxis = svg
		.append('g')
		.attr('class', 'axis x-axis')
    .attr('transform', 'translate(0,' + height + ')').call(xOptions);
  


	// ///////////////////STEP START HERE///////////////////////////////////////////////
  // name our steps
 	 const reset= d3.select('#reset')
	const actualData = d3.select('#actual_data');
  	const deadliestPhase = d3.select('#deadliest_phase');
  
	reset.on('stepin', function () {
		xPositionScale.domain(allDates);
		yPositionScale.domain([0, d3.max(rdeaths) + 20]);
		deathsLine.attr('d', lineDeaths).transition().attr('opacity', 0)
		restrictionsRect.transition().attr('width', xPositionScale(parseTime('2020-12-14')) - xPositionScale(parseTime('2020-11-19'))).attr('x', xPositionScale(parseTime('2020-11-19')))
	})

	actualData.on('stepin', function () {
      xPositionScale.domain(allDates);
      yPositionScale.domain([0, d3.max(rdeaths) + 20]);
      yAxis.call(yOptions)
      xAxis.call(xOptions)
      deathsLine.transition().attr('d', lineDeaths).transition().attr('opacity',1)
      rDeathsLine.transition().attr('d', lineReportedDeaths)
      restrictionsRect.transition().attr('width', xPositionScale(parseTime('2020-12-14')) - xPositionScale(parseTime('2020-11-19'))).attr('x', xPositionScale(parseTime('2020-11-19')))
	  svg.selectAll('.audit_deaths').attr('width', 1)
	  svg.selectAll('.march_dump').attr('font-size', 12)
	  svg.selectAll('.june_dump').attr('font-size', 12)
		})

	// step 3
	deadliestPhase.on('stepin', function() {
		xPositionScale.domain(filteredDates);
      	yPositionScale.domain([0, d3.max(filtered_deaths)+5]);

      	//  redraw everything with transitions
		yAxis.transition().call(yOptions)
		xAxis.transition().call(xOptions)
		deathsLine.transition().attr('d', lineDeaths).transition().attr('opacity',1)
		rDeathsLine.transition().attr('d', lineReportedDeaths)
		restrictionsRect.transition().attr('width', xPositionScale(parseTime('2020-12-14')) - xPositionScale(parseTime('2020-11-19'))).attr('x', xPositionScale(parseTime('2020-11-19')))

		svg.selectAll('.audit_deaths').attr('width', 0)
		svg.selectAll('.march_dump').attr('font-size', '0')
		svg.selectAll('.june_dump').attr('font-size', '0')
	})

	// resize function + on start
	function render() {
		const svgContainer = svg.node().closest('div');
		const svgWidth = svgContainer.offsetWidth;
		// Do you want it to be full height? Pick one of the two below
		const svgHeight = height + margin.top + margin.bottom;
		// const svgHeight = window.innerHeight

		const actualSvg = d3.select(svg.node().closest('svg'));
		actualSvg.attr('width', svgWidth).attr('height', svgHeight);

		const newWidth = svgWidth - margin.left - margin.right;
		const newHeight = svgHeight - margin.top - margin.bottom;

		// Update our scale
		xPositionScale.range([0, newWidth]);
		yPositionScale.range([newHeight, 0]);

		deathsLine.attr('d', lineDeaths)
		rDeathsLine.attr('d', lineReportedDeaths)
    	restrictionsRect.attr('width', xPositionScale(parseTime('2020-12-14')) - xPositionScale(parseTime('2020-11-19'))).attr('x', xPositionScale(parseTime('2020-11-19')))

		svg.selectAll('.restrictions_label')
			.attr('x', xPositionScale(parseTime('2020-11-18')))
			.attr('y', height / 2);
		svg.selectAll('.march_dump')
			.attr('x', xPositionScale(parseTime('2021-03-15')))
			.attr('y', margin.top);

		svg.selectAll('.june_dump')
			.attr('x', xPositionScale(parseTime('2021-06-01')))
			.attr('y', height / 1.6);

		svg.selectAll('.audit_deaths')
			.attr('x', xPositionScale(parseTime('2021-03-15')))
			.attr('y', margin.top + 10)
			.attr('height', height - margin.top - 10);

		svg.selectAll('.x_label')
			.attr('x', -margin.left+10)
			.attr('y', margin.top-10);

		// axis updated
		yAxis
			.call(
				yOptions
					.tickSizeInner(-newWidth)
					.tickPadding(10)
					.ticks(5)
			)

		xAxis
			.call(
				xOptions
					.ticks(newWidth / 50)
					.tickPadding(15)
					.tickFormat(d3.timeFormat('%b %d'))
			)
    

		//   // send the height to our embed
		if (pymChild) pymChild.sendHeight();
	}

	// // kick off the graphic and then listen for resize events
	render();
	window.addEventListener('resize', render);

	// // for the embed, don't change!
	if (pymChild) pymChild.sendHeight();
	pymChild = new pym.Child({ polling: 200, renderCallback: render });
}
