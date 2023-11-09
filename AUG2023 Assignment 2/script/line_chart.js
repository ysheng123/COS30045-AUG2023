var w = 700;
    var h = 400;
    var padding_line = 80;
    var axisPad = 6; //axis padding
    var color = d3.scaleOrdinal(d3.schemeCategory10);
    var R =6;
    var lineStroke = 1.5;
    var color_opacity = 0.7;


function initiliazeLine(){
  var svg = d3.select(".linechart") //make a new svg element
              .append("svg")
              .attr("width",w +300)
              .attr("height",h + padding_line )
              .attr("fill","grey")
              .append("g")
            .attr("transform",`translate(${padding_line},${10})`);;
  drawLine("New Zealand");
}



function lineDataProcess(data) //get data in the right format for the line chart
{
  result = {}
  var dataset = []; //dataset are lists of number of visa holders on arrival for each year, with year and value
  key= [];
  for(var i =0; i < data.length; i++){ //loop through all rows in the data
      var temp = Object.entries(data[i])
      var dict = {};
      var lst_small = []; //list of hasp map for each country and its corresponding value
      var temp_small = temp.slice(0,8); //get into the right format
      for(let j=0; j<8;j++){ //loop through every single year of each row
          var dict_small ={}
          dict_small["year"]= temp_small[j][0];
          dict_small["value"] = temp_small[j][1];
          lst_small.push(dict_small)
      }
      key.push(temp[8][1]);
      dict["key"] = temp[8][1]; //key is the visa type
      dict["values"] = lst_small; 
      dataset.push(dict);
  }
  result["dataset"] = dataset;
  result["key"] = key;
  return result;
}

function drawLine(country)
{
  var svg = d3.select(".linechart").select("svg g"); 
 
  xScale = d3.scaleTime() 
              .domain([2014,2021]) // range from year 2014 to 2021
              .range([0,w]);

  yScale = d3.scaleLinear()
              .range([h,0]);

  
 
  d3.csv(`./datasets/${country}.csv`).then(function(data){
      data.forEach(function(d) { //parse integers from the data
          d.type = d.type;
          for(var i = 2014; i <=2021; i++ )
          {
              d[`${i}`] = parseInt( d[`${i}`]);
          } 
      });
      var processed = lineDataProcess(data); //process data to get suitable format
      var dataset = processed.dataset;
      var key= processed.key; //visa type
    
      yScale.domain([0,max(data)]);
      color.domain(key); // set the domain for color
      line = d3.line()
              .x(function(d,i) {return xScale(d.year); }) // add padding_line to the x-coord to push it to the right
              .y(function(d) {return yScale(d.value); });
      var xAxis = d3.axisBottom().tickFormat(d3.format("d")).ticks(5).scale(xScale); // number of ticks on the axis
      var yAxis = d3.axisLeft(yScale).ticks(5, "s").tickSize(-w ); // number of ticks on the axis

      svg.selectAll(".line") // append new lines
          .data(dataset)
          .enter()
          .append("path")
          .attr("class","line-path")
            .attr("fill", "none")
            .attr("stroke", function(d,i){return color(d.key); })
            .attr("stroke-width", 2)
            .style("opacity", color_opacity)
            .attr("d", function(d,i){
                return d3.line()
                  .x(function(d) { return xScale(d.year); })
                  .y(function(d) { return yScale(d.value); })
                  .curve(d3.curveCatmullRom) //use curve function to make it smooth
                  (d.values)
            });
  
      svg.append("g") //append x-axis
        .attr("class", "xAxis")
        .attr("transform",`translate(${0},${h})`)
        .call(xAxis);
       
      svg.append("g") //append y-axis
        .attr("class", "yAxis")
       .attr("transform",`translate(${0},0)`)
        .call(yAxis)
        .call(g => {
          g.selectAll("text") //ticks for the y-axis
          .style("text-anchor", "middle")
          .attr("x", -axisPad*2)
          .attr('fill', '#A9A9A9')

          g.selectAll("line")
            .attr('stroke', '#A9A9A9')
            .attr('stroke-width', 1) // make horizontal tick thinner and lighter so that line paths can stand out
            .attr('opacity', 0.7)

          g.select(".domain").remove()
         })
         .append('text')
          .attr('x', 0)
          .attr("y", 20)
          .attr("fill", "#A9A9A9")
          .text("People") //y-axis legend

     
      var svgLegend = svg.append('g') //legend for color use of lines
          .attr('class', 'gLegend')
          .attr("transform", "translate(" + (w + 10) + "," + 0 + ")")

      var legend = svgLegend.selectAll('.legend') 
                            .data(key)
                            .enter().append('g')
                            .attr("class", "legend")
                            .attr("transform", function (d, i) {return "translate(0," + i * 20 + ")"}) //transform vertically according to the order

      legend.append("circle") // circle color
          .attr("class", "legend-node")
          .attr("cx", 0)
          .attr("cy", 0)
          .attr("r", R)
          .style("fill", d=>color(d))
          .style("opacity", color_opacity);

      legend.append("text") //text legend
          .attr("class", "legend-text")
          .attr("x", R*2)
          .attr("y", R/2)
          .style("font-size", 12)
          .style("opacity", 1.9)
          .text(d=>d);
      
      mouseG = d3.select(".linechart") //append g to create hover effect over the vertical line
                  .select("svg")
                  .append("g")
                  .attr("class", "mouse-over-effects");

      tooltip = d3.select(".linechart").append("div") //tooltip of a div
                  .attr('id', 'tooltip')
                  .style('position', 'absolute')
                  .style("background-color", "#F8EAD8")
                  .style("border", "solid")
                  .style("border-width", "1px")
                  .style("border-radius", "5px")
                  .style("padding", "5px")

                  .style('padding_line', 6)
                  .style('display', 'none');

      
      
      mouseG.append("path") // create vertical line to follow mouse
              .attr("class", "mouse-line")
              .style("stroke", "#A9A9A9")
              .style("stroke-width", 1.5)
              .style("opacity", "0");

      var mouseOverLine = mouseG.selectAll('.mouse-per-line') 
                              .data(dataset)
                              .enter()
                              .append("g")
                              .attr("class", "mouse-per-line");
      
      mouseOverLine.append("circle") // circles to follow the lines
                  .attr("r", 4)
                  .style("stroke", function (d,i) {
                      return color(d.key)
                  })
                  .style("fill", "none")
                  .style("stroke-width", lineStroke)
                  .style("opacity", "0");

      mouseG.append('svg:rect') // append a rect to catch mouse movements on canvas
              .attr('width', w+100) 
              .attr('height', h+10)
              .attr('fill', 'none')
              .attr('pointer-events', 'all')
              .on('mouseout', function () { // on mouse out hide line, circles and text
                  d3.select(".mouse-line")
                  .style("opacity", "0");
                  d3.selectAll(".mouse-per-line circle")
                  .style("opacity", "0");
                  d3.selectAll(".mouse-per-line text")
                  .style("opacity", "0");
                  d3.selectAll("#tooltip")
                  .style('display', 'none')

              })
              .on('mouseover', function () { // on mouse in show line, circles and text
                  d3.select(".mouse-line")
                  .style("opacity", "1");
                  d3.selectAll(".mouse-per-line circle")
                  .style("opacity", "1");
                  d3.selectAll("#tooltip")
                  .style('display', 'block')
              })
              .on('mousemove', function (event) { // update tooltip content, line, circles and text when mouse moves
                  var xDate, bisect,idx;
                  var mouse =  d3.pointer(event,this) //position of the mouse
                  
                  if(mouse[0]>padding_line)
                  {
                      d3.selectAll(".mouse-per-line") //transform the line and circles according to the mouse position
                        .attr("transform", function (d, i) {
                          var temp = mouse[0] -padding_line;
                          xDate = xScale.invert(temp) // use 'invert' to get date corresponding to distance from mouse position relative to svg
                          bisect = d3.bisector(function (d) { return d.year; }).left // retrieve row index of date on parsed csv
                          idx = bisect(d.values, xDate); //index of the data
                          d3.select(".mouse-line") //move the line to the mouse position
                            .attr("d", function () {
                              var data = "M" + (xScale(d.values[idx].year)+padding_line) + "," + (h);
                              data += " " + (xScale(d.values[idx].year)+padding_line) + "," + 0;
                          return data;
                        });
                          return "translate(" + (xScale(d.values[idx].year)+padding_line) + "," + (yScale(d.values[idx].value)+10) + ")"; //move cirlces based on the mouse x-position
        
                        });
                  }
                  update_Tooltip(dataset,tooltip,event,idx); //update tooltip content
                })
     
  })
}
function update_Tooltip(dataset,tooltip,event,idx)
{
  sortObject = [] //sort object with descending order
  dataset.map(d => {
    sortObject.push({ key: d.key, year: d.values[idx].year, value: d.values[idx].value})
  })

  sortObject.sort(function(x, y){
      return d3.descending(x.value, y.value);
  })
  var sortingArr = sortObject.map(d=> d.key)

  var res_nested1 = dataset.slice().sort(function(a, b){
    return sortingArr.indexOf(a.key) - sortingArr.indexOf(b.key) // rank visa types following the number of people
  })
  tooltip.html(sortObject[0].year)
          .style('display', 'block')
          .style('left', event.pageX + 30)
          .style('top', event.pageY - 20)
          .style('font-size', 11.5)
          .selectAll()
          .data(res_nested1)
          .enter() // for each visa type, list out number of people
          .append('div')
          .style('color', d => {
              return color(d.key)
          })
          .style('opacity',7)
          .style('font-size', 10)
          .html(d => {
              
              return d.key + ": " + d.values[idx].value.toString()
          })
}
function max(data) //find the max value in a dataset
{
  var temp =0;
  for(let i=0; i< data.length; i++)
  {
      var temp1 = data[i];
  
      for(var j = 2014; j <=2021; j++ )
      {
         
          if(parseInt(temp1[`${j}`])> temp)
          {
              temp = parseInt(temp1[`${j}`]);
          }
     }
  }
  return temp;

}