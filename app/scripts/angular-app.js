'use strict';

var app = angular.module('calcApp', []);

app.directive('dthreePlot', function(){
  return {
    restrict: 'EA',
    scope: {dat:'&', patient:'='},
    link: function(scope, element, attrs){
    // core inspired by http://bl.ocks.org/benjchristensen/2579599, will need to clean up to make it more usable for us
      // define dimensions of graph
    var m = [80, 80, 80, 80]; // margins
    var w = 480 - m[1] - m[3]; // width
    var h = 480 - m[0] - m[2]; // height

    scope.$watch('patient', function(newVal, oldVal){
      console.log('change', newVal);
      if(graph){
        graph.selectAll('g').remove();
        graph.selectAll('path').remove();


        var data = scope.dat()[0];

    // X scale will fit all values from data[] within pixels 0-w
    // var x = d3.scale.linear().domain([0, _.max(_.pluck(data, 'x_coord'))]).range([0, w]);
    var x = d3.scale.linear().domain([0, 200]).range([0, w]);
    // Y scale will fit values from 0-10 within pixels h-0 (Note the inverted domain for the y-scale: bigger is up!)
    // var y = d3.scale.linear().domain([0, _.max(_.pluck(data, 'y_coord'))]).range([h, 0]);
    var y = d3.scale.linear().domain([0, 200]).range([h, 0]);
      // automatically determining max range can work something like this
      // var y = d3.scale.linear().domain([0, d3.max(data)]).range([h, 0]);

    // create a line function that can convert data[] into x and y points
    var line = d3.svg.line()
      // assign the X function to plot our line as we wish
      .x(function(d,i) {
        // return the X coordinate where we want to plot this datapoint
        return x(d.x_coord);
      })
      .y(function(d) {
        // return the Y coordinate where we want to plot this datapoint
        return y(d.y_coord);
      });


    //   // create yAxis
      var xAxis = d3.svg.axis().scale(x).tickSize(-h).tickSubdivide(true);
      // Add the x-axis.
      graph.append('svg:g')
            .attr('class', 'x axis')
            .attr('transform', 'translate(0,' + h + ')')
            .call(xAxis);


      // create left yAxis
      var yAxisLeft = d3.svg.axis().scale(y).ticks(4).orient('left');
      // Add the y-axis to the left
      graph.append('svg:g')
            .attr('class', 'y axis')
            .attr('transform', 'translate(-25,0)')
            .call(yAxisLeft);

    //     // Add the line by appending an svg:path element with the data line we created above
    //   // do this AFTER the axes above so that the line is above the tick-lines
        graph.append('svg:path').attr('d', line(data));
      }

    }, true);

    // create a simple data array that we'll plot with a line (this array represents only the Y values, X will just be the index location)

    var data = scope.dat()[0];

    // X scale will fit all values from data[] within pixels 0-w
    // var x = d3.scale.linear().domain([0, _.max(_.pluck(data, 'x_coord'))]).range([0, w]);
    var x = d3.scale.linear().domain([0, 200]).range([0, w]);
    // Y scale will fit values from 0-10 within pixels h-0 (Note the inverted domain for the y-scale: bigger is up!)
    // var y = d3.scale.linear().domain([0, _.max(_.pluck(data, 'y_coord'))]).range([h, 0]);
    var y = d3.scale.linear().domain([0, 200]).range([h, 0]);
      // automatically determining max range can work something like this
      // var y = d3.scale.linear().domain([0, d3.max(data)]).range([h, 0]);

    // create a line function that can convert data[] into x and y points
    var line = d3.svg.line()
      // assign the X function to plot our line as we wish
      .x(function(d,i) {
        // return the X coordinate where we want to plot this datapoint
        return x(d.x_coord);
      })
      .y(function(d) {
        // return the Y coordinate where we want to plot this datapoint
        return y(d.y_coord);
      });

      // // Add an SVG element with the desired dimensions and margin.
      var graph = d3.select(element[0]).append("svg:svg")
            .attr("width", w + m[1] + m[3])
            .attr("height", h + m[0] + m[2])
          .append("svg:g")
            .attr("transform", "translate(" + m[3] + "," + m[0] + ")");

      // create yAxis
      var xAxis = d3.svg.axis().scale(x).tickSize(-h).tickSubdivide(true);
      // Add the x-axis.
      graph.append("svg:g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + h + ")")
            .call(xAxis);


      // create left yAxis
      var yAxisLeft = d3.svg.axis().scale(y).ticks(4).orient("left");
      // Add the y-axis to the left
      graph.append("svg:g")
            .attr("class", "y axis")
            .attr("transform", "translate(-25,0)")
            .call(yAxisLeft);

        // Add the line by appending an svg:path element with the data line we created above
      // do this AFTER the axes above so that the line is above the tick-lines
        graph.append("svg:path").attr("d", line(data));
    }
  };
});

app.controller('MainCtrl', function($scope) {
  $scope.patient_data = {
    male: true,
    age: 12,
    weight: 123,
    creatinine: 1.1
  };
  // default gfr calc settings
  $scope.gfr_calc_settings = {
    weight_units: 'kg',
    creatinine_units: 'mg_dL'
  };

  // $scope.$watch('patient_data', function(newVal, oldVal){

  // }, true)
  $scope.calc_cockcroftGaultFormula = function(weight_units, creatinine_units){
    var sex_constant = $scope.patient_data.male ? 1.23 : 1.04;
    // TO DO make this work with units

    $scope.patient_data.creatinine_clearance = $scope.cockgroftGault(sex_constant,
      $scope.unitConvert_weight($scope.patient_data.weight, weight_units, 'kg'),
      $scope.patient_data.age,
      $scope.unitConvert_creatinine($scope.patient_data.creatinine,creatinine_units,'umol_L')
    );
    return $scope.patient_data.creatinine_clearance;
  };

  $scope.cockgroftGault = function(sex_constant, weight, age, creatinine){
    return (sex_constant * weight * (140-age)) / creatinine;
  };

  $scope.cockcroftGaultGraphing = function(missing_var, weight_units, creatinine_units){
    // get male and female graphs
    var y_array_male = [];
    var y_array_female = [];
    var weight = $scope.unitConvert_weight($scope.patient_data.weight, weight_units, 'kg');
    var age = $scope.patient_data.age;
    var creatinine = $scope.unitConvert_creatinine($scope.patient_data.creatinine,creatinine_units,'umol_L');
    var array_female = [];
    var array_male = [];
    var data_array = [];
    var x_array = [];
    switch (missing_var) {
      case 'weight':
        for(var i=1; i<200; i+=5){
          data_array.push({x_coord: i, weight: i, age: age, creatinine: creatinine});
        }
      break;
      case 'age':
        for(var i=20; i<100; i+=5){
          data_array.push({x_coord: i, weight: weight, age: i, creatinine: creatinine});
        }
      break;
      case 'creatinine':
        for(var i=0.1; i<10; i+=.2){
          data_array.push({x_coord: i, weight: weight, age: age, creatinine: i});
        }
      break;
      default:
      break;
    }
    angular.forEach(data_array, function(data_array){
      array_male.push({x_coord: data_array.x_coord, y_coord: $scope.cockgroftGault(1.23, data_array.weight, data_array.age, data_array.creatinine)});
      array_female.push({x_coord: data_array.x_coord, y_coord: $scope.cockgroftGault(1.04, data_array.weight, data_array.age, data_array.creatinine)});
    });
    return [array_male, array_female];
  };

  // TODO: abstract this into separate UNITS service, and combine these objects together
  $scope.weight_units = ['kg', 'lb'];
  var weightConversion = {
    kg: 1,
    lb: 2.2
  };

  $scope.creatinine_units = ['mg_dL', 'mg_L', 'umol_L'];
  var creatinineConversion = {
    mg_dL: 1,
    mg_L: 10,
    umol_L: 88.4,
  };
  // TODO: abstract unit conversion into separate service, with general function so as to be DRY
  $scope.unitConvert_weight = function(weight, fromUnit, toUnit){
    return weight * weightConversion[toUnit] / weightConversion[fromUnit];
  };
  $scope.unitConvert_creatinine = function(creatinine, fromUnit, toUnit){
    return creatinine * creatinineConversion[toUnit] / creatinineConversion[fromUnit];
  };
});