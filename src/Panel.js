import React, { Component } from 'react';
import * as d3 from 'd3';

import Glyph from './Glyph'
import {glyphToStrokes, alphabetize } from './orthographer'

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

    this.group = React.createRef();

    this.clickFunction = this.clickFunction.bind(this);
    this.lastExpanded= Number.MAX_SAFE_INTEGER;
    this.clicked = false;
    this.clickLength = 350;
    this.inspect = true;

    this.positionFunction;

    this.fullClick = false;
    this.glyphsFull = function() 
    { return MAX_GLYPHS === this.state.glyphData.length; };

    this.addGlyph = function(glyph)  
    {
        this.setState(prevState => ({glyphData: [...prevState.glyphData, glyphToStrokes(glyph)]}));
        this.glyphCounter++;   
    };
  }

/*
    //Responsible for initializing glyph points for editing
    if(this.INIT_DATA)
      initGlyphData(enterGlyphs, _this.drawParams.xScale, _this.drawParams.yScale, _this);

    if(this.windowData.length === this.drawParams.glyphCount)
    {
      this.showFullButton(this.drawParams.glyphCount-1);
    }
};*/

  componentDidUpdate(prevProps, prevState)
  {
    /*if(prevState.expandedElement !== this.state.expandedElement)
    {
      var _this = this;
      var gGroup = d3.select(this.group.current);
      gGroup.selectAll().each(function(d, i) //No data bound to our group, can't select anything
      {
        console.log(i);
        var groupElement = d3.select(this);
        var startTransform = parseTransform(groupElement.attr("transform"));
        var endTransform = _this.positionFunction(i, _this); 
        console.log(startTransform);
        console.log(endTransform);
        if(i===_this.lastExpanded)
        { _this.toggleGlyphData(groupElement, false); }
        
      });
      console.log("failed");
    }*/
  }

  render()  //Render the panel as a list of glyphs
  {
    const glyphs = this.state.glyphData;
    return (<g ref={this.group} transform={"translate("+this.props.x+","+this.props.y+")"}>
                {glyphs.map((glyph, i) => //Cannot use index as key in the long term - Will also need to pass strokes in as Props
                  {
                      return (<Glyph key={glyph.index} index={glyph.index} name={this.props.name} transform={this.positionGlyph(i, this.state.expandedElement)} 
                      boxScale={this.props.boxScale} color={this.props.color} xScale={this.xScale} yScale={this.yScale} strokes={glyph.strokes} drawSpeed={this.props.speed} 
                      inspecting={i===this.state.expandedElement} clickFunction={this.clickFunction}/>);
                  }
                )}
            </g>);
  }

  positionGlyph(index, element)
  {
    console.log(index);
    console.log(element);
    var offset = 0;
    var inspectScale = 1;
    if(element !== Number.MAX_SAFE_INTEGER && index >= element)
    {
      if(index === element)
      {
        inspectScale = this.props.inspectScale;
      }
      else
      {
        var columnNumber = (element) % this.glyphsX();
        var emptyColumns = this.props.inspectScale - (this.glyphsX() - columnNumber);
        if(emptyColumns < 0)
          emptyColumns = 0;
        var boundaryIndex = Math.floor((index - element - 1) / 
          (this.glyphsX() - (this.props.inspectScale - emptyColumns)))+1;
        if(boundaryIndex > this.props.inspectScale)
          boundaryIndex = this.props.inspectScale;

        offset = (boundaryIndex * (this.props.inspectScale - emptyColumns)) - 1;
      }   
    }

    var gY = Math.floor((index+offset) / this.glyphsX());
    var gX = (offset+index) - (gY * this.glyphsX());

    return "translate(" + this.gScaleX(gX) + "," + this.gScaleY(gY) + ") scale("+inspectScale+","+inspectScale+")";
  }

  //Factored click function with click/double-click semantics
  //Cannot provide  input, must get fields from Glyph component
  clickFunction = function(selectedIndex)
  {                           
    var _this = this;
    if(!this.clicked)
    {
      this.clicked = true;
      var t = d3.timer(function(dt) //Click
      {
        if(dt > _this.clickLength || !_this.clicked)
        {
          if(!_this.clicked)
            t.stop()
;          else
          {
            t.stop();
            _this.clicked = false;
            _this.clickSemantics(selectedIndex);
          } 
        }
      });
    }
    else
    {  
      this.clicked = false;
      this.doubleClickSemantics(selectedIndex);
    }
  }

  //Pass reference to panel for use in method-chaining
  clickSemantics = function(selectedIndex)
  {
    var drawing = false;
    //gSelect.selectAll("path").each(function(d, i) //Blocks inspection of undrawn glyphs
    //  { if(d3.select(this).attr("class") === "undrawn") drawing = true; });
    if(!drawing)  //Find the index of the selected element within the DOM hierarchy
    {
      var positionIndex = this.state.glyphData.findIndex((glyph) => {return glyph.index === selectedIndex});
      this.inspectGlyph(positionIndex);
    }
  }

  //Toggle interactive elements and expand glyph for inspection
  //Shift transform on all other glyphs 
  inspectGlyph = function(selectedIndex)
  {
    this.lastExpanded = this.state.expandedElement;
    if(selectedIndex === this.state.expandedElement) 
    {
      this.setState({expandedElement: Number.MAX_SAFE_INTEGER});
    }
    else 
    {
      this.setState({expandedElement: selectedIndex});
    }
  }

  doubleClickSemantics = function(_this, gElement)
  {
    var drawing = false;
    var gSelect = d3.select(gElement);
    var positionIndex;
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
          //  _this.toggleGeneration();
      }
  }

  removeGlyph = function(_this, index)
  {
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
  }

  toggleGlyphData = function(glyph, up)
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

  }

  //Adds false glyphs to make room for expanded element
  /*expand = function(i)
  {  
    if(i >= this.state.expandedElement) //Only position glyphs past the expanded element
    {       
      if(i === this.state.expandedElement)
      { 
        var transform = parseTransform(this.positionGlyph(i, Number.MAX_SAFE_INTEGER));
        transform.scale = [this.props.inspectScale, this.props.inspectScale];
        return transform;
      }
      else
      {
        return parseTransform(this.positionGlyph(i, this.expandedElement));
      }
    }
    else
    {
      return parseTransform(this.positionGlyph(i, Number.MAX_SAFE_INTEGER));
    }   
  }

  //Collapses transforms to return to default panel formatting
  collapse = function(i)
  {
    return parseTransform(this.positionGlyph(i, Number.MAX_SAFE_INTEGER));
  }*/
		
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
