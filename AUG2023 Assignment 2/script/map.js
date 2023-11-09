var w_map = 600;
var h_map = 400;

function initializeMap(){ // initialize the choropleth
    var zoom = d3.zoom().scaleExtent([1, 2]) //limite the maximum rate can be zoommed
            .translateExtent([[-600, -500], [1200, 1200]]).on('zoom', handleZoom); //limit the range can be draged
    function handleZoom(e) { //function to handle zoom
      
        d3.select('.map svg .t')
            .attr('transform', e.transform);
        if(e.transform.k !=1) // to check when users are zooming in
        {
            d3.select('.map svg') // make a border so that they can easily see teh boundary
            .style("border", "solid")
            .style("border-width", "1px");

        }
        else{
            console.log(e.transform); //remove border
            d3.select('.map svg').attr("style", null);
        }
        
    }       
    
    var svg = d3.select(".map") //make a new svg element
                .append("svg")
                .attr("width",w_map)
                .attr("height",h_map+100)
                .append("g") .attr("class","t")
                .attr("transform", 
                        `translate(${0},${0})`)
                .attr("viewBox", [0, 0, w_map , h_map])
                .call(zoom)
                .attr("fill","grey");
   
    
    d3.select(".map").select("svg").on("mouseleave", function(){ //when mouse leave the map, reset to normal zoom
           
             d3.select('.map svg .t')
                .transition()
                .duration(700)   
                .call(zoom.transform, d3.zoomIdentity .translate(w_map/2 -155, h_map/2 -163) .scale(1).translate(-145,-36.5)); 

            
            }) 
    drawMap("2021","Arrival", true);
}  

function drawMap(year,type,initialize = false) //update the choropleth
{   
    
    var projection = d3.geoMercator() //geoMercator projection
                    .center([173.5,-41.5])
                    .translate([w_map/2,h_map/2]) // move to the center
                    .scale(1200);
    var path = d3.geoPath()
                .projection(projection); //project 
    var svg = d3.select(".map").select("svg").select(".t"); 
    
    d3.csv(`./datasets/state_${type.toLowerCase()}.csv`).then(function(data){ //combine data from csv with json
        data.forEach(function(d) {
            d.State = d.State;
            for(var i = 2014; i <=2021; i++ )
            {
                d[`${i}`] = parseInt( d[`${i}`]);
            }
            
        });
        
        var color = d3.scaleLinear()
                .domain([100,1000,5000,15000,30000,35000])
                .range(d3.schemePurples[3]);

       
        d3.json("./script/nzmap.geojson").then(function(json){ //use json to to get coordinates of the map

            
            for(var i =0; i <data.length; i++)
            {
                var dataLoc = data[i].State;
                var dataValue = data[i][year];
                for(var j =0; j < json.features.length; j++)
                {
                    var jsonLoc = json.features[j].properties.STATE_NAME;
                    if(dataLoc == jsonLoc) // if location matches the json
                    {
                        json.features[j].properties.value = dataValue; //append value into json based on the location
                        
                        break;
                    }
                }
            }
            if(initialize) // if initialise then create the path
            {
                createColorScale(color,h); //create color scale legend
                map = svg.selectAll("path") //create path for each state
                        .data(json.features)
                        .enter()
                            .append("path")
                            .attr("d", path)
                            .style("stroke-width", ".3")
                            .style("stroke", "black")
                            .style("opacity", 1.5)
                            .attr("class", function(d){ return "state" } )

                            .attr("fill", (d)=>{
                                
                                var value = d.properties.value;
                                return color(value);
                            })
                            .append("title").text((d) => {
                            return `State: ${d.properties.STATE_NAME}\n${type}: ${d.properties.value}`
                            
                            });
            }
            { //update the map when there is something changed
                map = svg.selectAll("path")//just select the path
                        .data(json.features)
                        .transition()
                        .ease(d3.easePoly)
                        .duration(1000)
                        .style("opacity", 1.5)
                        .attr("fill", (d)=>{
                            
                            var value = d.properties.value;
                           
                            return color(value);
                        });
                svg.selectAll("title")
                    .data(json.features)
                    .text((d) => {
                       return `State: ${d.properties.STATE_NAME}\n${type}: ${d.properties.value}`
                    });
                        
            }
            svg.selectAll("path")
                .data(json.features)
                .on("mouseover",function(event,d){ //update the hover effect
                   focus(this);  //hover for a state no matter if there is a clicked state                
                })
                .on("mouseleave", function(){
                    if( !d3.select(this).classed("clicked") &&  !svg.classed("clicked-svg")) // if there is not a state that has been clicked
                    {
                        defocus(); //defocus for the whole map
                    }
                    if(!d3.select(this).classed("clicked") &&  svg.classed("clicked-svg")) //if there is a state that has been been clicked to focus
                    {
                        var object= d3.select(".state .clicked");
                        focus(".clicked"); //keep focus for that state
                    }
                })
                .on("click", function(event,d){
                    if(!d3.select(this).classed("clicked")) //if the state has not been cliked before
                    {
                        svg.classed("clicked-svg",true) //save the clicked state into svg
                        d3.selectAll(".state").classed("clicked",false) //defocus all other state first
                        d3.select(this).classed("clicked",true); //focus for the chosen setate
                        focus(this);
                        updateBar(d.properties.STATE_NAME); //update the bar chart
                    }
                    else{
                        svg.classed("clicked-svg",false)
                        d3.select(this).classed("clicked",false);
                        defocus(); //defocus for the whole map
                        updateBar("New Zealand"); //draw the bars for the whole New Zealand
                    }
                })
    })
    })
}

function createColorScale(color,h) //color legend for the choropleth
{
    var svg = d3.select(".map")
                .select("svg");

    svg.append("rect") //append a rect
        .attr("id", "colorScale")
        .attr("x", 20)
        .attr("y", h_map )
        .attr("width", 170)
        .attr("height", 20)
        .attr("style", "outline: thin solid black;");

    var defs = svg.append("defs");
    var linearGradient = defs.append("linearGradient").attr("id", "linear-gradient-map"); //linear-gradient definition

    linearGradient.selectAll(".stop")
                .data(color.range())
                .enter()
                .append("stop")
                .attr("offset", (d, i) => i / (color.range().length ))
                .attr("stop-color", d => d);

    svg.select("#colorScale")
        .style("opacity", 1.5)
        .style("fill", "url(#linear-gradient-map)"); //apply gradient to the rect

    svg.append("text").text("100").attr("x", 20).attr("y", h_map - 7);
    svg.append("text").text("45,000").attr("x", 140).attr("y", h_map - 7);

}

function focus(object){ //focus for a specific state
    d3.selectAll(".state") //make all other states blur
        .transition()
        .duration(200)
        .style("stroke-width", "0.1")
        .style("opacity", 0.5);
    d3.select(object) //make the focused not more outstanding
        .transition()
        .duration(200)
        .style("opacity", 2)
        .style("stroke-width", "1.5")
        .style("stroke", "black");
}

function defocus(){ //set every state back to normal
    d3.selectAll(".state")
        .transition()
        .duration(500)
        .style("opacity", 1.5)
        .style("stroke-width", ".2")
        .style("stroke", "black");
}