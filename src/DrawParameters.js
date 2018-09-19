import * as d3 from 'd3';

//props: x, y, width, height, scale, color, inspect, rate, speed
export function DrawParameters(props)
{
	/*this.x = x;
	this.y = y;
	this.boxScale = scale;
    this.boxColor = color;
    this.width = width;
    this.height = height;
    this.inspectScale = inspect;
    //this.generationTime = rate;
    //this.drawDuration = speed;*/

    this.xScale = d3.scaleLinear()
                .domain([0, GLYPH_SCALE])
                .range([0, this.boxScale]);
    this.yScale = d3.scaleLinear()
                .domain([0, GLYPH_SCALE])
                .range([0, this.boxScale]);

    this.glyphsX = function() { return this.width / this.boxScale; };
    this.glyphsY = function() { return this.height / this.boxScale; };
    this.glyphCount = this.glyphsX()*this.glyphsY();

    if(this.inspectScale > this.glyphsX())
    	this.inspectScale = this.glyphsX();

    this.gScaleX = d3.scaleLinear()
	    .domain([0, this.glyphsX()])
	    .range([0, this.width]);

	this.gScaleY = d3.scaleLinear()
	    .domain([0, this.glyphsY()])
	    .range([0, this.height]);

    

    this.panelWidth = 2*this.boxScale;
}

DrawParameters.prototype.createButton = function(panel)
{
    var _this = this;
    this.parameterShow = true;
    this.parameterClick = false;
    var pbWidth = (this.width-this.boxScale);
    var pbHeight = (-this.boxScale/4);

    this.parameterX = (this.width+(this.boxScale*this.inspectScale))-(this.boxScale/2);
    this.parameterPanel = panel.group.append("g")
        .attr("class", "parameters")
        .attr("transform", "translate("+this.parameterX+","+(0)+") scale(1,1)");

    //Glyph parsing button - accepts .ttf, .otf, .txt (training/learning data)
    this.parameterPanel.append("rect")
        .attr("x", 0)
        .attr("y", this.panelWidth)
        .attr("width", this.panelWidth)
        .attr("height", this.panelWidth)
        .style("fill-opacity", 0.35)
        .style("fill", this.boxColor);

    this.parameterPanel.append("text")
        .attr("class", "noselect")
        .attr("x", 0)
        .attr("y", this.panelWidth)
        .text("Glyph data file")
        .style("font-size", 12+"px");

    if(window.FileReader)
    {
        this.inputButton = document.createElement("INPUT");
        this.inputButton.setAttribute("type", "file");
        this.inputButton.setAttribute("value", "default");

        function inputDrag (ev) //this is calling drag rect
        {
            ev.stopPropagation (); 
            ev.preventDefault ();
            if (ev.type == 'drop') 
            {
              var reader = new FileReader ();
              reader.onloadend = function (ev) { panel.generator.parseGlyphs(this.result, panel); };
              reader.readAsText (ev.dataTransfer.files[0]);
              d3.select(this).style("fill-opacity", 0.1);                  
            } 
            else if(ev.type == 'dragenter')
            {
              d3.select(this).style("fill-opacity", 0.75);
            } 
            else if(ev.type == 'dragexit')
            {
              d3.select(this).style("fill-opacity", 0.1);                    
            }
        }
    
        this.parseGlyphButton = this.parameterPanel.append("rect") 
          .attr("x", 10)
          .attr("y", this.panelWidth+10)
          .attr("width", this.panelWidth-20)
          .attr("height", this.panelWidth-20)
          .style("fill", this.boxColor)
          .style("fill-opacity", 0.1)
          .style("stroke", "black")
          .style("stroke-opacity", 1);    

        this.parseGlyphButton.node().addEventListener("dragenter", inputDrag, false);
        this.parseGlyphButton.node().addEventListener("dragexit", inputDrag, false);
        this.parseGlyphButton.node().addEventListener("dragover", inputDrag, false);
        this.parseGlyphButton.node().addEventListener("drop", inputDrag, false);

        this.parameterPanel.append("text")
            .attr("class", "noselect")
            .attr("x", 0)
            .attr("y", this.panelWidth+this.panelWidth/2)
            .text("Drag glyph data here")
            .style("font-size", 12+"px");
    }
    else
    {
        this.parameterPanel.append("text")
        .attr("class", "noselect")
        .attr("x", 0)
        .attr("y", this.panelWidth)
        .text("Glyph data upload not supported for your browser.")
        .style("font-size", 12+"px");   
    }

    if(panel.name !== "font")
    {
        this.generator = panel.generator;
        this.addSlider("minStrokes", 0, 0, 10);
        this.addSlider("maxStrokes", this.panelWidth/8, 0, 10);
        this.addSlider("strokeLength", this.panelWidth/4, 0, GLYPH_SCALE/2);
        this.addSlider("lengthVariance", this.panelWidth/4+this.panelWidth/8, 0, GLYPH_SCALE/2)
        this.addSlider("strokeWidth", this.panelWidth/2, 0, GLYPH_SCALE/10);
        this.addSlider("widthVariance", this.panelWidth/2+this.panelWidth/8, 0, GLYPH_SCALE/10);
        this.addSlider("connectProbability", 3*this.panelWidth/4, 0, 1);
        this.addToggle("line", 0);
        this.addToggle("quadratic", this.panelWidth/4);
        this.addToggle("cubic", this.panelWidth/2);

        this.parameterPanel.append("text")
            .attr("class", "noselect")
            .attr("x", 0)
            .attr("y", 2*this.panelWidth + 20)
            .text("Download training data")
            .style("font-size", 10+"px");
        this.parameterPanel.append("rect")
            .attr("x", 0)
            .attr("y", 2*this.panelWidth + 20)
            .attr("width", this.panelWidth)
            .attr("height", this.panelWidth/4)
            .style("stroke", 'black')
            .style("stroke-weight", 5)
            .style("fill-opacity", 1)
            .style("fill", this.boxColor)
            .on("click", function() { panel.generateTrainingData(_this.generator.trainingDataSize); });
        this.addSlider("trainingDataSize", 2*this.panelWidth+50, 0, 1000);
    }
}

DrawParameters.prototype.togglePanel = function()
{
    var startTransform = parseTransform(this.parameterPanel.attr("transform"));
    var endTransform;
    if(this.parameterShow)
    {
        endTransform = "translate("+this.parameterX+","+(0)+") scale(1,1)";
    }
    else
    {
        endTransform = "translate("+this.parameterX+","+(0)+") scale(0,0)";
    }
    endTransform = parseTransform(endTransform);
    var _this = this;
    this.parameterPanel.transition()
        .attrTween("transform", function(t)
        {
          return function(t)
          { 
            return interpolateTransform(t, startTransform, endTransform);
          };
        }).on("end", function() { _this.parameterClick = false; });
}

DrawParameters.prototype.addSlider = function(name, y, min, max)
{
    var scaleParam = d3.scaleLinear().domain([0, 3*this.panelWidth/4]).range([min, max]);
    this.parameterPanel.append("line")
        .attr("x1", 0)
        .attr("y1", y)
        .attr("x2", 3*this.panelWidth/4)
        .attr("y2", y)
        .style("stroke-opacity", 1)
        .style("stroke-width", 0.5);
    var _this = this;
    this.parameterPanel.append("circle")
        .attr("cx", 0)
        .attr("cy", y)
        .attr("r", 3)
        .style("fill", this.boxColor)
        .style("stroke", 'black')
        .style("stroke-width", 1)
        .call(d3.drag().on("drag", function(d, i) { paramEdit(this, d3.event, name, _this, scaleParam); }))
        .on("click", function() { editFunction(); });

    this.parameterPanel.append("text")
        .attr("class", "noselect")
        .attr("x", 0).attr("y", y+10).text(name).style("font-size", 12+"px");
}

DrawParameters.prototype.addToggle = function(name, y)
{
    var _this = this;
    this.parameterPanel.append("rect")
        .attr("x", 3*this.panelWidth/4)
        .attr("y", y)
        .attr("width", this.panelWidth/4)
        .attr("height", this.panelWidth/4)
        .style("fill", this.boxColor)
        .style("stroke", 'black')
        .style("stroke-width", 1)
        .on("click", function() 
            { 
                _this.generator[name] = !_this.generator[name]; 
                if(!_this.generator.line && !_this.generator.cubic && !_this.generator.quadratic)
                    _this.generator[name] = !_this.generator[name];
                if(_this.generator[name]) 
                    d3.select(this).style("fill", _this.boxColor);
                else
                    d3.select(this).style("fill", "white"); 
            });
    this.parameterPanel.append("text")
        .attr("class", "noselect")
        .attr("x", this.panelWidth+5).attr("y", y+(y/2)).text(name).style("font-size", 10+"px");
}

function paramEdit(element, event, param, panel, scaleP)
{
    if(event.x > 0 && event.x < 3*panel.panelWidth/4)
    {
        d3.select(element).attr("cx", event.x);
        panel.generator[param] = scaleP(event.x);
    }
}