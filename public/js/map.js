

function getMapUtility(){
    return {
        createSVGFoundation: createSVGFoundation,
        draw: draw,
        populate: populate,
        updatePosition: updatePosition
    }
}

function createSVGFoundation(divSelector){

    $(divSelector).html('');
    // $(divSelector).append("<ul id='thingslist' aria-hidden=false aria-label='Help Info'/>");
    // var ul = $(divSelector).find('ul');
    // ul.hide();

    var foundation = d3.select(divSelector);

    var svgWidth = $(window).width();
    var svgHeight = $(window).height();

    var width = svgWidth,
        height = svgHeight,
        radius = Math.min(width, height);
    radarradius = Math.round(radius/2.5);
    thingradius = Math.round(radarradius/8);
    position ={x:0,y:0};


    var svg = foundation.append("svg")
        .attr("width", radius)
        .attr("height", radius)
        .append("g")
        .attr("transform", "translate(" + radius / 2 + "," + radius / 2 + ")");
    return {radius: radius, svg: svg, thingradius: thingradius, radarradius: radarradius};
}

function draw(foundation) {
    radius = foundation.radius;
    svg = foundation.svg;

    var center = svg.append("g")
        .append("svg:a")
        .attr("aria-live","polite")
        .attr("id", "mapButton")
        .attr("xlink:href", "#pagecontentMap")

    center.append("title").html("Nothing")
    center.append("desc").html("is in front of you.")
    w = radius/30;
    var centerimage = center.append("svg:image")
        .attr('aria-hidden',true)
        .attr("id", "mapTargetImage")
        .attr("x", -w/2)
        .attr("y", -w/2)
        .attr("width", w)
        .attr("height", w);

    generateBlock(svg,radarradius*2,radarradius*2);

    svg.append('clipPath')
        .attr('id', 'clipCircleMap')
        .append('circle')
        .attr('r', thingradius)
        .attr('cx','0')
        .attr('cy','0');

    svg.append('clipPath')
        .attr('id', 'clipCenterCircleMap')
        .append('circle')
        .attr('r', thingradius*2)
        .attr('cx','0')
        .attr('cy','0');
}

function generateCircle(svgparent, radius) {
    svgparent.append("circle")
        .attr("r", radius)
        .attr('aria-hidden',true)
        .style("fill", "none")
        .style("stroke", "#ff6f00")
        .attr("class", "svgshadow");
}

function generateBlock(svgparent, height, width ){
    svgparent.append("rect")
        .attr("x", -width/2)
        .attr("y", -height/2)
        .attr("height", width)
        .attr("width", height)
        .attr('aria-hidden',true)
        .style("fill", "none")
        .style("stroke", "#ff6f00")
        .attr("class", "svgshadow");
}

function populate(foundation, things){

    $.each(things, function(key, val){
        var color = "black";
        if(val.status != undefined && !val.status) {
            color = "red";
        }
        if(val.status == "danger")
            color = "red";
        if(val.status == "warning")
            color = "yellow";
        if(val.status == "ok")
            color = "green";

        var thing = svg.append("svg:a")
            .attr("xlink:href", "#" + key)
            .attr("id", key+"map");

        thing.append("svg:image")
            .attr("xlink:href", val.img)
            .attr('x', -thingradius)
            .attr('y', -thingradius)
            .attr('width', thingradius*2)
            .attr('height', thingradius*2)
            .attr('clip-path','url(#clipCircleMap)');

        thing.append("circle")
            .attr("fill", "none")
            .attr("r", thingradius)
            .style("stroke-width", 2)
            .style("stroke", color)
        thing.append("title").html(key)
    });
}


function move(dX,dY){
    position.x+=dX;
    position.y-=dY;
}

function updatePosition(things, direction) {
    // move(0,5);
    var clippedCoords;
    $.each(things, function(key, val){
        clippedCoords=clipCoordsToBorder(val.location.x,val.location.y);
        d3.select("#"+key+"map")
            .attr("transform", "rotate(270) translate("+clippedCoords.x+", "+clippedCoords.y+") rotate(90)")
    });

    clippedCoords=clipCoordsToBorder(position.x,position.y);
    d3.select('#mapTargetImage')
        .attr('xlink:href', 'img/' + "arrow2" + '.png')
        .attr("transform", "translate("+clippedCoords.x+", "+clippedCoords.y+")"+" rotate("+(-direction)+") ");
}

function clipCoordsToBorder(x,y) {
    var xTemp = Math.min(x, radarradius);
    var yTemp = Math.min(y, radarradius);
    var clippedX = Math.max(-radarradius, xTemp);
    var clippedY = Math.max(-radarradius, yTemp);
    return {x:clippedX , y:clippedY}
}