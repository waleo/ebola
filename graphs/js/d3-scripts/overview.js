$(document).ready(function () {
    var chartGroup = "overviewGroup";

    $('#reset').click(function () {
        dc.filterAll();
        dc.redrawAll();
    });

    d3.csv("test-update.csv", function (error, data) {
        var casesDeathsChart = dc.lineChart("#casesDeathsChart");
        var typeRingChart = dc.pieChart("#chart-ring-type");
        //var casesDeathsPieChart = dc.pieChart("#casesDeathsPieChart");
        var casesDeathsCountryChart = dc.barChart("barChart");

        var datatable = dc.dataTable("#dc-data-table");

        // crossfilter(data) provides a way to put the rows of information into crossfilter,
        // dimension is how the data should be sliced (ie day of week, locations, datetime)
        var ndx = crossfilter(data);

        var countryNameRange = [];
        var parseDate = d3.time.format("%m/%_d/%Y").parse;

        data.forEach(function(d) {
        	d.Date = parseDate(d.Date);

          if ($.inArray(d.Country, countryNameRange) == -1) {
              countryNameRange.push(d.Country);
          }
        });

        var dayDimension = ndx.dimension(function (d) { return d.Date; });
        var countryDimension = ndx.dimension(function (d) { return d.Country; });

        var casesGroup = dayDimension.group().reduceSum( function (d) {return d.Cases - d.Deaths });
        var deathsGroup = dayDimension.group().reduceSum(dc.pluck('Deaths'));

        var countryGroup = countryDimension.group().reduceSum(dc.pluck('Cases'));
        var group = dayDimension.group();

        var minDay = dayDimension.bottom(1)[0].Date;
        var maxDay = dayDimension.top(1)[0].Date;

        var width = 800,
            height = 200;

        casesDeathsChart
            .width(width).height(height)
            .dimension(dayDimension)
            .group(deathsGroup)
            .stack(casesGroup)
            .colors(d3.scale.ordinal().range(['#990000', '#555555']))
            .renderArea(true)
            .x(d3.time.scale().domain([minDay,maxDay]))
            .elasticY(true)
            .renderHorizontalGridLines(true)
            .dotRadius(100)
            .brushOn(true)
            .yAxisLabel("Total");

        typeRingChart
            .width(300).height(height)
            .dimension(countryDimension)
            .group(countryGroup)
            .innerRadius(30);

        var country = ndx.dimension(function (d) {
          return d.Country;
        });
        var countryGroup = country.group();

        casesDeathsCountryChart
          .width(width).height(height)
          .dimension(country)
          .group(countryGroup)
          .colors(d3.scale.ordinal().range(['#a4dee6', '#95d9e2', '#85d3dd', '#76ced9', '#67c9d5', '#57c3d0', '#48becc']))
          .x(d3.time.scale().domain([minDay,maxDay]))
          .gap(25)
          .centerBar(true);


        datatable
            .dimension(dayDimension)
            .group(function(d) {return d.Day;})
            // dynamic columns creation using an array of closures
            .columns([
                function(d) {return d.Day;},
                function(d) {return d.Country;},
                function(d) {return d.Cases;},
                function(d) {return d.Deaths;}
            ]);

        dc.renderAll();
    });
});
