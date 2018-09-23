import React, { Component } from 'react';
import * as d3 from 'd3';

import Glyph from './Glyph'
import {glyphToStrokes} from './orthographer'

export default class Panel extends Component
{

	//Props contains a panel name, draw parameters, and generator glyph
	constructor(props)
	{
		super(props)

    this.glyphsX = function() { return this.props.width / this.props.boxScale; };
    this.glyphsY = function() { return this.props.height / this.props.boxScale; };
    
    this.glyphCount = this.glyphsX()*this.glyphsY();
    const MAX_GLYPHS = this.glyphCount*3;

    if(this.props.inspectScale > this.glyphsX())
        this.props.inspectScale = this.glyphsX();

    this.xScale = d3.scaleLinear()
                    .domain([0, this.props.glyphScale])
                    .range([0, this.props.boxScale]);
    this.yScale = d3.scaleLinear()
                .domain([0, this.props.glyphScale])
                .range([0, this.props.boxScale]);  

    this.gScaleX = d3.scaleLinear()
        .domain([0, this.glyphsX()])
        .range([0, this.props.width]);

    this.gScaleY = d3.scaleLinear()
        .domain([0, this.glyphsY()])
        .range([0, this.props.height]);

    this.panelWidth = 2*this.props.boxScale;

    this.glyphCounter = 0;
    this.generator = this.props.glyphs;
		this.state = //State is reserved for elements which trigger re-rendering of components
		{
			glyphData: [],
			windowData: [],
			initData: true,
			
			glyphWindow: 0,
			group: d3.select("g").attr("transform", 
      "translate("+this.props.x+","+this.props.y+")"),
			
			fullClick: false,
			/*fullButton: this.group.append("rect")
				.attr("x", 0)
				.attr("y", this.drawParams.boxScale)
				.attr("width", this.drawParams.boxScale)
				.attr("height", 0)
				.style("fill", 'gray')
				.style("fill-opacity", 0.2)
				.on("click", function() 
				{
					if(!this.state.fullClick)
					{
						this.state.fullClick = true;
						this.hideFullButton((this.props.drawParams.glyphsX()*this.props.drawParams.glyphsY()));
    	
		                this.state.expandedElement = Number.MAX_SAFE_INTEGER;
				    	this.state.glyphWindow += this.props.drawParams.glyphCount;
		                this.windowData = [];
		                if(this.MAX_GLYPHS === this.state.glyphData.length && this.state.glyphWindow === this.MAX_GLYPHS)
		                {
		                  this.state.glyphData = [];
		                  //_this.toggleGeneration();
		                  this.state.glyphWindow = 0;
		                }
					}
					
				}),*/
			expandedElement: Number.MAX_SAFE_INTEGER,
		};

    this.lastTime = 0;
    this.totalTime = 0.1;
    this.stopTime = 0;

    var _this = this;
    var timeCall = function(elapsed)  //Callback controlling generation of new glyphs
    { 
      _this.totalTime += (d3.now() - _this.lastTime);
      _this.lastTime = d3.now(); 
      if(elapsed > _this.props.rate)
      {
        if(!_this.glyphsFull())
        {
            var glyph = _this.generator.generateGlyph(_this.glyphCounter);
            _this.addGlyph(glyph);
        }  
        
        if(_this.state.windowData.length < _this.glyphCount)
        {
          //_this.state.windowData.push(_this.glyphData[_this.windowData.length+_this.glyphWindow]);
          //this.update();
        }  
      }
    }

    this.timer = d3.interval(timeCall, this.props.rate);

    this.lastExpanded= Number.MAX_SAFE_INTEGER;
    this.clicked = false;
    this.clickLength = 350;
    this.inspect = true;

    this.glyphsFull = function() 
    { return MAX_GLYPHS === this.state.glyphData.length; };

    this.addGlyph = function(glyph)  
    {
        this.setState(prevState => ({glyphData: [...prevState.glyphData, glyphToStrokes(glyph)]}));
        this.glyphCounter++;   
    };
  }


//General update pattern
/*shouldComponentUpdate() = function() 
{ 
  //Use glyph index as a key function to uniquely identify glyphs
  var glyphs = this.group.selectAll("g."+this.name).data(this.windowData, function(d, i) 
          { if(d === undefined) console.log("Undefined: "+i); else return d.index; });

    //Exit
    glyphs.exit().remove();

    //Update
    glyphs.attr("class", this.name);
    glyphs.selectAll("rect")
          .attr("class", "update");
          
    //Enter
    enterGlyphs = glyphs.enter()
          .append("g")
            .attr("class", this.name)
            .attr("transform", function(d, i) { return _this.positionGlyph(i, _this.expandedElement); });
    enterGlyphs.append("rect")
        .attr("class", "enter")
          .attr("x", 0)
          .attr("y", function(d, i) { return 0; })
          .attr("width", this.drawParams.boxScale)
          .attr("height", this.drawParams.boxScale)
          .attr("stroke", 'gray')
          .style("stroke-opacity", 0.15)
          .style("stroke-weight", 0.15)
          .style("fill-opacity", 0.2)
          .on("click", function(d, i) //Callbacks store references "as-is"
            { 
              var gElement = this.parentNode;
              if(_this.inspect)
                _this.clickFunction(d, i, gElement, partial(_this.doubleClickSemantics, _this, gElement));
            }).transition()
              .duration(function(d) 
                { return d3.select(this.parentNode).datum().strokes.length * _this.drawParams.drawDuration; })
              .style("fill-opacity", 0.2);

    var strokes = glyphs.merge(enterGlyphs).selectAll("path").data(function(d, i) { return d.strokes; });

    //Enter update - stroke-by-stroke render
    strokes.enter()
      .append("path")  
        .attr("class", "undrawn")
        .style("fill-opacity", 0)      
        .style("stroke-opacity", 0)
        .attr("d", function(d) { return strokeInterpret(d.contours, _this.drawParams.xScale, _this.drawParams.yScale); })
        .style("stroke-dasharray", function(d) 
          { return this.getTotalLength(); })
        .style("stroke-dashoffset", function(d) 
          { return this.getTotalLength(); })
        .transition()
          .duration(this.drawParams.drawDuration)
          .delay(function(d, i) { return _this.drawParams.drawDuration * i; })
          .ease(d3.easeLinear)
          .style("fill", this.drawParams.boxColor)
          .style("fill-opacity", 1)
          .style("stroke", "gray")
          .style("stroke-weight", 0.1)
          .style("stroke-opacity", 0.1)
          .style("stroke-dashoffset", function(d) 
          { return 0+"px"; })
          .on("end", function() { d3.select(this).attr("class", "drawn"); });

    //Responsible for initializing glyph points for editing
    if(this.INIT_DATA)
      initGlyphData(enterGlyphs, _this.drawParams.xScale, _this.drawParams.yScale, _this);

    if(this.windowData.length === this.drawParams.glyphCount)
    {
      this.showFullButton(this.drawParams.glyphCount-1);
    }
};*/

  render()  //Render the panel as a list of glyphs
  {
    const glyphs = this.state.glyphData;
    return (<g transform={"translate("+this.props.x+","+this.props.y+")"}>
                {glyphs.map((glyph) => //Cannot use index as key in the long term - Will also need to pass strokes in as Props
                  <Glyph key={glyph.index} transform={this.positionGlyph(glyph.index, this.expandedElement)} boxScale={this.props.boxScale} color={this.props.color}
                          xScale={this.xScale} yScale={this.yScale} strokes={glyph.strokes}/>
                )}
            </g>);
  }

  positionGlyph(index, element)
  {
    var offset = 0;
    if(element !== Number.MAX_SAFE_INTEGER && index > element)
    {
      var columnNumber = (element) % this.glyphsX();
      var emptyColumns = this.props.inspectScale - (this.glyphsX() - columnNumber);
      if(emptyColumns < 0)
        emptyColumns = 0;
      var boundaryIndex = Math.floor((index - element - 1) / 
        (this.glyphsX() - (this.props.inspectScale - emptyColumns)))+1;
      if(boundaryIndex > this.props.inspectScale)
        boundaryIndex = this.props.inspectScale;

      offset = (boundaryIndex * (this.inspectScale - emptyColumns)) - 1;
    }

    var gY = Math.floor((index+offset) / this.glyphsX());
    var gX = (offset+index) - (gY * this.glyphsX());

    return "translate(" + this.gScaleX(gX) + "," + this.gScaleY(gY) + ") scale(1,1)";
  };
		
		/*this.drawParams.createButton(this);

		//Might need to place d3 statements into render()
		this.group.append("line")
              .attr("class", "full")
							.attr("x1", (3*this.drawParams.boxScale/4))
							.attr("y1", this.drawParams.boxScale + this.drawParams.boxScale/8)
							.attr("x2", this.drawParams.boxScale/4)
							.attr("y2", this.drawParams.boxScale + this.drawParams.boxScale/8)
              .style("stroke-width", 0.5);
						this.group.append("line")
              .attr("class", "full")
							.attr("x1", this.drawParams.boxScale - this.drawParams.boxScale/3)
							.attr("y1", this.drawParams.boxScale)
							.attr("x2", this.drawParams.boxScale - this.drawParams.boxScale/4)
							.attr("y2", this.drawParams.boxScale + this.drawParams.boxScale/8)
              .style("stroke-width", 0.5);
						this.group.append("line")
							.attr("class", "full")
              .attr("x1", this .drawParams.boxScale - this.drawParams.boxScale/3)
							.attr("y1", this.drawParams.boxScale + this.drawParams.boxScale/4)
							.attr("x2", this.drawParams.boxScale - this.drawParams.boxScale/4)
							.attr("y2", this.drawParams.boxScale + this.drawParams.boxScale/8)
              .style("stroke-width", 0.5);
  
  toggleGeneration = function ()
	  {
	  	if(this.totalTime > this.stopTime)
	  		this.timer.stop();
	  	else
	  		this.timer = d3.interval(timeCall, this.drawParams.generationTime);
	  	this.stopTime = this.totalTime;
	  };

	showFullButton = function(index) 
	{ 
		var _this = this;
		d3.select(this.fullButton).remove();
		var lines = this.group.selectAll("line.full").remove();
		var lastElement = this.group.selectAll("g."+this.name).filter(function(d, i) 
		{
			return i === index;
		});
		lastElement.append(function() { return _this.fullButton._groups[0][0]; });

		for(var i = 0; i < 3; i++)
		{
			lastElement.append(function () { return lines._groups[0][i]; });							
		}

		this.fullButton.transition()
		.duration(100)
		.attr("height", this.drawParams.boxScale/4)
		.on("end", function() { lastElement.selectAll("line")
									.transition()
										.duration(100)
										.style("stroke-opacity", 1); });
	};

	hideFullButton = function(index) 
	{	
		var _this = this;
		var lastElement = this.group.selectAll("g").filter(function(d, i) 
		{
			return i === index;
		});
		d3.select(this.fullButton).remove();
		var lines = lastElement.selectAll("line.full").remove();
		lines.transition()
			.duration(0)
			.style("stroke-opacity", 0);
		this.fullButton.transition()
			.duration(0)
			.attr("height", 0)
			.on("end", function() { _this.fullClick = false; });
		this.group.append(function() { return _this.fullButton._groups[0][0]; });
		for(var i = 0; i < 3; i++)
		{
			this.group.append(function () { return lines._groups[0][i]; });							
		}
	};

	generateTrainingData = function(size)
    {
    	var train = []
    	for(var i = 0; i < size; i++)
    	{
    		var newGlyph = this.generator.trainGlyph(train);
    		train.push.apply(train, newGlyph);
    	}
    	var dataString = JSON.stringify(train);
    	download(dataString, "train.txt");
    };
}


//Factored click function with click/double-click semantics
Panel.prototype.clickFunction = function(d, i, gElement, dblClick) //if this can be referred to directly, it should be
{														//i.e. avoid aliases like _this
    var positionIndex;
    var _this = this;

	if(!this.clicked)
	{
		this.clicked = true;
    	var t = d3.timer(function(dt) //Click
		{

			if(dt > _this.clickLength || !_this.clicked)
			{
				if(!_this.clicked)
					t.stop();
				else
				{
					t.stop();
					_this.clicked = false;
					_this.clickSemantics(_this, gElement);
				}	
			}
		});
	}
	else
	{  
		this.clicked = false;
		dblClick();
	}
};

//Pass reference to panel for use in method-chaining
Panel.prototype.clickSemantics = function(_this, gElement)
{
	var drawing = false;
	var gSelect = d3.select(gElement);
	gSelect.selectAll("path").each(function(d, i) //Blocks inspection of undrawn glyphs
		{ if(d3.select(this).attr("class") === "undrawn") drawing = true; });
	if(!drawing)
	{
		_this.group.selectAll("g."+_this.name).each(function(d, i) //re-select elements in place
		{
		  if(d.index === gSelect.datum().index)                    
		  { positionIndex = i; }
		});
		_this.inspectGlyph(gElement, positionIndex);
	}
};

//Defaults to moving glyph to alphabet Panel
Panel.prototype.doubleClickSemantics = function(_this, gElement)
{
	var drawing = false;
	var gSelect = d3.select(gElement);
	gSelect.selectAll("path").each(function(d, i) //Blocks inspection of undrawn glyphs
		{ if(d3.select(this).attr("class") === "undrawn") drawing = true; });
	if(!drawing)
	{
        _this.group.selectAll("g."+_this.name).each(function(d, i) //Double-click
        {                	
          if(d.index === gSelect.datum().index)                    
          { positionIndex = i; }
        });

        alphabetize(gElement);
        _this.toggleGlyphData(gSelect, false);
        _this.removeGlyph(_this, positionIndex);
        //if(_this.totalTime === _this.stopTime)
        //	_this.toggleGeneration();
    }
};

Panel.prototype.removeGlyph = function(_this, index){
	_this.glyphData.splice(_this.glyphWindow+index, 1);
  _this.windowData.splice(index, 1);
	if(index === _this.expandedElement)
	{
		_this.expandedElement = Number.MAX_SAFE_INTEGER;
		_this.transformGlyphs(_this.collapse);
		return;
	}
	else if(index < _this.expandedElement)
	{
		_this.expandedElement--;
	}
	_this.transformGlyphs(_this.expand);
};

Panel.prototype.inspectGlyph = function(gElement, i)
  {
    this.lastExpanded = this.expandedElement;
    var positionFunc;
    if(i === this.expandedElement) 
    {
      this.expandedElement = Number.MAX_SAFE_INTEGER;
      positionFunc = this.collapse;
    }
    else {
      this.expandedElement = i;
      positionFunc = this.expand;
      this.toggleGlyphData(d3.select(gElement), true);
    }

    this.transformGlyphs(positionFunc);
  };

  //PositionFunction is collapse or expand
  Panel.prototype.transformGlyphs = function(positionFunction)
  {
  	var _this = this;
    this.group.selectAll("g."+this.name).each(function(d, i) 
    {
      var groupElement = d3.select(this);
      var startTransform = parseTransform(groupElement.attr("transform"));
      var endTransform = positionFunction(i, _this); 
      if(i===_this.lastExpanded)
      { _this.toggleGlyphData(groupElement, false); }
      groupElement.transition()
        .attrTween("transform", function(t)
        {
          return function(t)
          { 
            return interpolateTransform(t, startTransform, endTransform);
          };
        });
    });
  };

Panel.prototype.toggleGlyphData = function(glyph, up)
{
  var _this = this;
  var radius = up ? 1 : 0;
  
  //Draw stroke elements for interactive editing
  var startPoints = glyph.selectAll("circle.start").attr("r", radius);
  var endPoints = glyph.selectAll("circle.end").attr("r", radius);
  var controlPoints1 = glyph.selectAll("circle.cp1").attr("r", radius);
  var controlPoints2 = glyph.selectAll("circle.cp2").attr("r", radius);

  var bbox = glyph.selectAll("circle.bbox").attr("r", radius);
  var aWidth = glyph.select("circle.awidth").attr("r", radius);
  var boundingLines = glyph.selectAll("line.bounds")
    .style("stroke-width", 0.1 * radius);

  glyph.selectAll("path").transition()
    .style("fill", function(d) { if(up) return d.color; else return _this.drawParams.boxColor; })
    .style("stroke",function(d) { if(up) return d.color; else return 'gray'; });

};

  //Adds false glyphs to make room for expanded element
  Panel.prototype.expand = function(i, panel)
  {  
    if(i >= panel.expandedElement) //Only position glyphs past the expanded element
    {       
      if(i === panel.expandedElement)
      { 
        var transform = parseTransform(panel.positionGlyph(i, Number.MAX_SAFE_INTEGER));
        transform.scale = [panel.drawParams.inspectScale, panel.drawParams.inspectScale];
        return transform;
      }
      else
      {
        return parseTransform(panel.positionGlyph(i, panel.expandedElement));
      }
    }
    else
    {
      return parseTransform(panel.positionGlyph(i, Number.MAX_SAFE_INTEGER));
    }   
  };

  //Collapses transforms to return to default panel formatting
  Panel.prototype.collapse = function(i, panel)
  {
    return parseTransform(panel.positionGlyph(i, Number.MAX_SAFE_INTEGER));
  };


  Panel.prototype.showFont = function(font)
  {
    this.toggleGeneration();
    this.glyphData = [];
    this.INIT_DATA = false;
    for(var i = 0; i < font.glyphs.length; i++)
    {
      if(this.glyphData.length > this.MAX_GLYPHS*2)
        break;
      var glyph = fontGlyphToStrokes(font.glyphs.glyphs[i], this.drawParams.boxColor);

      if(glyph.strokes.length > 0)
      {
        this.glyphData.push(glyph);
        this.windowData.push(glyph);
      }  
      var height = this.windowData.length / this.drawParams.glyphsX() * this.drawParams.boxScale
      d3.select("body").select("svg").attr("height", 800+height);
    }
    
    this.update();
    //this.showFullButton(this.drawParams.glyphCount-1);
  };*/
}
