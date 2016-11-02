
// indiana = spatialAwareness();
var indiana = null;

    function createSVGFoundation(divSelector){
      $(divSelector).html('');
      // $(divSelector).append("<ul id='itemslist' aria-hidden=false aria-label='Help Info'/>");
      // var ul = $(divSelector).find('ul');
      // ul.hide();

      var foundation = d3.select(divSelector);

      var svgWidth = $(window).width();
      var svgHeight = $(window).height();

      var width = svgWidth,
          height = svgHeight,
          radius = Math.min(width, height);
          radarradius = Math.round(radius/2.5);
          itemradius = Math.round(radarradius/8);

        // .attr('aria-hidden',true)
      var svg = foundation.append("svg")
        .attr("width", radius)
        .attr("height", radius)
        .append("g")
        .attr("transform", "translate(" + radius / 2 + "," + radius / 2 + ")");
      return {radius: radius, svg: svg, itemradius: itemradius, radarradius: radarradius};
    }

    function drawCircles(foundation) {
      radius = foundation.radius;
      svg = foundation.svg;

      var w = radius/7;

      var center = svg.append("g")
          .append("svg:a")
          .attr("aria-live","polite")
          .attr("id", "radarButton")
          .attr("xlink:href", "#pagecontent")
          // .attr('aria-hidden',true)
          // .attr('role', 'Nothing is in front of you.');
      center.append("title").html("Nothing")
      center.append("desc").html("is in front of you.")
      center.append("svg:image")
          .attr('aria-hidden',true)
          .attr("xlink:href", "img/arrow.png")
          .attr("x", -w/2)
          .attr("y", -w/2)
          .attr("width", w)
          .attr("height", w);
      w = radius/5
      var centerimage = center.append("svg:image")
          .attr('aria-hidden',true)
          .attr("id", "radarTargetImage")
          .attr("x", -w/2)
          .attr("y", -w/2)
          .attr("width", w)
          .attr("height", w);

      generateCircle(svg, radarradius);
      generateCircle(svg, radarradius*5/6);
      generateCircle(svg, radarradius*2/3);
      generateCircle(svg, radarradius/2);

      svg.append("circle")
        .attr("r", radarradius/3)
        .attr('aria-hidden',true)
        .attr("id", "selectionCircle")
        .style("stroke", "#ff6f00")
        .attr("fill","none");

      svg.append('clipPath')
      .attr('id', 'clipCircle')
      .append('circle')
        .attr('r', itemradius)
        .attr('cx','0')
        .attr('cy','0');

      svg.append('clipPath')
      .attr('id', 'clipCenterCircle')
      .append('circle')
        .attr('r', itemradius*2)
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

    // var items = JSON.parse(txt2);
    // var txt = '{\
    // "laptop": {\
    //   location: {dir: 120},\
    //   label: "laptop",\
    //   img: "img/laptop.jpg"\
    // },\
    // "lamp1": {\
    //   location: {dir: 0},\
    //   label: "office lamp",\
    //   img: "img/lamp.png",\
    //   hueid: "1",\
    //   restAPI: bridgeip + "/api/" + hueuser + "/lights/"\
    // }}';

    // var items = JSON.parse(txt);

    function populateRadar(foundation, items){

      $.each(items, function(key, val){
        // ul.append('<li>'+key+' blub blub</li>')
        var x = -radarradius*Math.sin((val.location.dir)*Math.PI/180);
        var y = -radarradius*Math.cos((val.location.dir)*Math.PI/180);
        // console.log(x,y)
          // .attr("onclick", "$('#"+key+"')[0].scrollIntoView()")
          // .attr("cursor", "pointer")
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
        /* better performance (in chrome usable), no image borders, images not round */
        // var w = itemradius*2;
        // svg.append("svg:a")
        //   .attr("xlink:href", "#"+key)
        //   .append("svg:image")
        //   .attr("id", key+"radar")
        //   .attr("xlink:href", val.img)
        //   .attr("x", -w/2)
        //   .attr("y", -w/2)
        //   .attr("width", w)
        //   .attr("height", w)
        //   .attr("transform", "translate("+x+"," + y + ")")

        /* worse performance (in chrome almost unusable), icons in circles */
        if(val.img) {
          // generatePattern(svg, itemradius*2, val.img, key+'pattern');
          // generatePattern(svg, 100, val.img, key+'patternFull');
        } else {
          // var img = "img/" + key + ".png"
          // generatePattern(svg, itemradius*2, img, key+'pattern');
          // generatePattern(svg, 100, img, key+'patternFull');
        }
        var item = svg.append("svg:a")
          .attr("xlink:href", "#" + key)
            .attr("id", key+"radar");

            item.append("svg:image")
            .attr("xlink:href", val.img)
            .attr('x', -itemradius)
            .attr('y', -itemradius)
            // .attr("transform", "translate("+x+"," + y + ")")
            .attr('width', itemradius*2)
            .attr('height', itemradius*2)
            .attr('clip-path','url(#clipCircle)');

          item.append("circle")
            .attr("fill", "none")      
          .attr("r", itemradius)
          .style("stroke-width", 2)
          .style("stroke", color)



          // .attr('aria-hidden',true)

          // item.append("circle")
          // .attr("r", itemradius)
          // .style("stroke-width", 3)
          // .style("stroke", "green")
          // // // .attr("id", key+"radar")
          // .attr("transform", "translate("+x+"," + y + ")")

          // .attr('clip-path','url(#clipCircle)');
          // .attr("fill","url(#"+key+"pattern)")
        item.append("title").html(key)

        //get location position for specific item
        if(indiana != null)
         item.append("desc").html(getLocationText(key))
      });
    }

    function updatePositions(items, direction) {
      $.each(items, function(key, val){
        var degree = val.location.dir;
        var actualDirection = degree-direction;
        // console.log(getLocation().dir,actualDirection)
        // $('#radartarget1').html(Math.round(getLocation().dir) + " " + Math.round(actualDirection));
        // var color = "black";
        // if(val.status != undefined && !val.status) {
        //   color = "red";
        //   .attr("stroke", color)
        // }
        var x = -radarradius*Math.sin(actualDirection*Math.PI/180);
        var y = -radarradius*Math.cos(actualDirection*Math.PI/180);
        var item = d3.select("#"+key+"radar")
          .attr("transform", "translate("+x+", "+y+")")

        if(indiana != null)
          item.select("desc").html(getLocationText(key))
      });
    }