function timelinePlay(){ //update when timeline is change
    playButton = document.querySelector(".play")
    if (playButton.classList.contains("bi-play-fill")) { //toggle the button
        playButton.classList.remove("bi-play-fill");
        playButton.classList.add("bi-pause-fill"); //change icon for play button 

        year = document.querySelector("#year");
        if (year.value == 2021) {
            year.value = 2014;
            document.querySelector("#yearLabel").innerText = year.value;
        }
        let loopTimeout = function(i, max, interval, func) {
            if (i > max) { // End Of Timeline
              playButton.classList.remove("bi-pause-fill");
              playButton.classList.add("bi-play-fill");
              return;
            }
      
            func(i); // Call Update Function
            i++; // Increment Control Variable
            setTimeout(function() { loopTimeout(i, max, interval, func) }, interval);
        };

        loopTimeout(parseInt(year.value), 2021, 1200, (yearVal) => {
            year.value = yearVal;
            firstChartUpdate();
          });
    } 
    else{
        playButton.classList.remove("bi-pause-fill");
        playButton.classList.add("bi-play-fill"); //change icon for play button 
        let timeoutIDs = setTimeout(function() {}, 0); //cancel all current running timeline
        while (timeoutIDs--) clearTimeout(timeoutIDs);
    }
}
function timelineUpdate(){
    yearLabel = document.querySelector("#yearLabel");
    yearLabel.innerText = document.querySelector("#year").value;
}
function firstChartUpdate(){ //update the choropleth
   
    method = document.querySelector('.select-map').value //get the method
    year = document.querySelector("#year"); //get the year selected
    mapTitle = document.querySelector(".title-map"); //update title
    if(method =="Arrivals")
    {
        mapTitle.innerText = `${method} to New Zealand in ${year.value}`;
    }
    else{
        mapTitle.innerText = `${method} from New Zealand in ${year.value}`;
    }
    drawMap( year.value,method); //re-draw the map
    focusBar();
    timelineUpdate();

}
function sankeyUpdate(choice){ //update sankey chart based on the choice button
    button = document.querySelector(`.sankey-${choice}`);
    if(!button.classList.contains("active")){ // only re-render the sankey chart if the button has not been selected
        buttons = document.querySelectorAll(".sankey-btn");
        buttons.forEach(function(d){ //de-active every other buttons
            d.classList.remove("active");
        })        
        updateSankey(choice); //re draw snakey chart
        button.classList.add("active"); //make the button active
    }
    title = document.querySelector(".title-sankey");
    year = "2021";
    if(choice==1)
    {
        year = "2014";
    }
    else if(choice == 2)
    {
        year = "2015"
    }
    else if(choice == 3)
    {
        year = "2016"
    }
    else if(choice == 4)
    {
        year = "2017"
    }
    else if(choice == 5)
    {
        year = "2018"
    }
    else if(choice == 6)
    {
        year = "2019"
    }
    else if(choice == 7)
    {
        year = "2020"
    }
    title.innerText = `Top 10 migrant population at New Zealand in ${year}`; //update title
    nodes =  document.querySelectorAll(`.node`);
    if(nodes.length == 9 || nodes.length == 11) // if the user is focusing on a specific nodes
    {
        restore(choice); //restore the whole graph
    }
}

function init(){

    var selectMap = document.querySelector('.select-map');//add event lisenter to select dropdown of choropleth
    selectMap.onchange = (event) => {
        var inputText = event.target.value;
        var title = document.querySelector('.title-map');
        var year= document.querySelector("#year").value;
        if(inputText =="Arrival")
        {
            title.innerText = `${inputText}s to New Zealand in ${year}`;
        }
        else{
           
            title.innerText = `${inputText}s from New Zealand in ${year}`;
        }
        drawMap(`${year}`,inputText);
    }
    initializeMap();
    initiliazeLine();
    initialiseBar();
    initializeSankeyChart();
}
window.onload = init();