import React, { Component } from 'react';
import * as d3 from 'd3';
//import update from 'immutability-helper';

import Panel from './Panel'
import DrawParameters from './DrawParameters'
import Button from './Button'
import Generator from './generator'
import {glyphToStrokes, alphabetize } from './glyph-helper'
import {download, fontGlyphsToStrokes} from './font-helper'

export const GLYPH_SCALE = 1024;
export const BOX_SCALE = 50;

var PANEL_WIDTH = 400;
var PANEL_HEIGHT = 150;

var INSPECT_SCALE = 4;      
var GENERATION_RATE = 50;
var DRAW_SPEED = 500;

export default class Orthographer extends React.Component
{
	constructor(props)
	{
		super(props);
		this.fileGlyphs = [];
		this.font = null;
		this.fontIndex = 0;
		this.state =
		{
			glyphData: [],
			alphabetData: [],
			expandedElement: Number.MAX_SAFE_INTEGER,
			alphabeticElement: Number.MAX_SAFE_INTEGER
		}
		this.glyphCounter = 0;

		this.generator = new Generator();
		this.changeGeneratorValue = this.changeGeneratorValue.bind(this);
		this.changeExpandedElement = this.changeExpandedElement.bind(this);
		this.changeAlphabeticElement = this.changeAlphabeticElement.bind(this);
		this.changeStrokeData = this.changeStrokeData.bind(this);
	    this.changeAlphabetData = this.changeAlphabetData.bind(this);

		this.generateTrainingData = this.generateTrainingData.bind(this);
		this.alphabetize = this.alphabetize.bind(this);
		this.fullButtonClick = this.fullButtonClick.bind(this);

		this.glyphsX = PANEL_WIDTH / BOX_SCALE;
    	this.glyphsY = PANEL_HEIGHT / BOX_SCALE;
    
    	this.glyphCount = this.glyphsX*this.glyphsY;

	    this.lastTime = 0;
	    this.totalTime = 0.1;
	    this.stopTime = 0;

	    this.addGlyph = function(glyph)  //Does this re-render every glyph?
	    {

	        this.setState(prevState => ({glyphData: [...prevState.glyphData, glyph]}));
	        this.glyphCounter++;   
	    };

	    this.glyphsFull = function() 
    	{ return this.glyphCount === this.state.glyphData.length; };
    	this.fullButton = React.createRef();

	    var _this = this;
	    this.timeCall = function(elapsed)  //Callback controlling generation of new glyphs
	    { 
	      _this.totalTime += (d3.now() - _this.lastTime);
	      _this.lastTime = d3.now(); 
	      if(elapsed > GENERATION_RATE)
	      {
	        if(!_this.glyphsFull())
	        {
	            var glyph = _this.generator.generateGlyph(_this.glyphCounter);
	            _this.addGlyph(glyphToStrokes(glyph));
	        } 
	        else
	        	_this.timer.stop(); 
	        
	        /*if(_this.state.windowData.length < _this.glyphCount)
	        {
	          _this.state.windowData.push(_this.glyphData[_this.windowData.length+_this.glyphWindow]);
	          this.update();
	        }*/  
	      }
	    }

	    this.timer = d3.interval(this.timeCall, GENERATION_RATE);
	}

	componentDidUpdate()
	{
		if(this.props.fileResult != null)
		{
			if(this.props.fileType === "glyph")
			{
				this.fileGlyphs = this.generator.parseGlyphs(this.props.fileResult, this.glyphCounter);
				this.glyphCounter += this.fileGlyphs.length;
      			this.setState({glyphData: [], expandedElement: Number.MAX_SAFE_INTEGER}, () => 
      			{
      				for(var i =0;i<this.fileGlyphs.length;i++)
			        {
						if(i === this.glyphCount) //Ultimately may desire a way to visualize unlimited numbers of glyphs
						{
							this.fileGlyphs = [];
							break;
						}
						this.addGlyph(glyphToStrokes(this.fileGlyphs[i]));
			        }
      			});
			}
			else //font
			{
				this.font = this.props.fileResult;
				console.log(this.font);
				this.fileGlyphs = fontGlyphsToStrokes(this.font, this.fontIndex, this.glyphCount, this.props.color);
				this.setState({glyphData: [], expandedElement: Number.MAX_SAFE_INTEGER}, () => 
      			{
      				for(var i =0;i<this.fileGlyphs.length;i++)
			        	{this.addGlyph(this.fileGlyphs[i]);}
      			});
			}
			this.props.killResult();
		}
		if(this.glyphsFull())
		{							//Button.current.Button.current - get internal ref (don't do this often)
			var groupFull = d3.select(this.fullButton.current.button.current);
			groupFull.select("rect")	//This function will need to be expanded to accomodate inspection of fonts and RNN generated glyphs
						.transition().duration(100)
						.attr("height", BOX_SCALE/4);
		}
	}

	render()
	{	
		return(<g>
					<Panel 
		            name = {this.props.name}
		            x = {this.props.x} y = {this.props.y} 
		            glyphsX={this.glyphsX} glyphsY={this.glyphsY}
		            width = {PANEL_WIDTH} 
		            height = {PANEL_HEIGHT} 
		            glyphScale = {GLYPH_SCALE} 
		            boxScale = {BOX_SCALE} 
		            inspectScale = {INSPECT_SCALE}
		            color = {this.props.color} 
		            speed = {DRAW_SPEED}
		            glyphData = {this.state.glyphData}
		            expandedElement = {this.state.expandedElement}
		            expandElement = {this.changeExpandedElement} 
		            generator = {this.generator}
		            strokeModifier = {this.changeStrokeData}
		            removeGlyph = {this.alphabetize}
		          />
		          <DrawParameters 
		            x={this.props.x + PANEL_WIDTH+(PANEL_WIDTH/2)} y ={this.props.y}
		            width={PANEL_WIDTH/2} height={PANEL_HEIGHT}
		            color={this.props.color}
		            valueChange={this.changeGeneratorValue}
		            generateTrainingData={this.generateTrainingData}
		            uploadClick={this.props.uploadClick}
		          />
		          {this.glyphsFull() && 
		          	<Button ref={this.fullButton} 
		          			x={this.props.x+PANEL_WIDTH-BOX_SCALE} y={this.props.y-BOX_SCALE/4} 
		          			boxScale={BOX_SCALE} clickFunction={this.fullButtonClick}/>}
		          	<Panel 
	                name = "alphabet"
	                x = {this.props.x+(2*PANEL_WIDTH)+(PANEL_WIDTH/2)} y = {this.props.y} 
	                glyphsX={this.glyphsX} glyphsY={this.glyphsY}
	                width = {PANEL_WIDTH} 
	                height = {PANEL_HEIGHT} 
	                glyphScale = {GLYPH_SCALE} 
	                boxScale = {BOX_SCALE} 
	                inspectScale = {INSPECT_SCALE}
	                color = {this.props.color} 
	                speed = {DRAW_SPEED}
	                glyphData = {this.state.alphabetData}
	                expandedElement = {this.state.alphabeticElement}
	                expandElement = {this.changeAlphabeticElement} 
	                generator = {this.generator}
	                strokeModifier = {this.changeAlphabetData}
	                removeGlyph = {this.alphabetize}
	              />
	          </g>);
	}

	changeGeneratorValue = function(name, value)
	{
		this.generator[name] = value;
	}

	changeExpandedElement = function(element)
	{
		this.setState({expandedElement: element});
	}

	changeAlphabeticElement = function(element)
	{
		this.setState({alphabeticElement: element});
	}

	//This was a serious struggle. It may be faster to use immutability-helper to only update specific
	//stroke fields in the future
	changeStrokeData = function(glyph)
	{
		var index = this.state.glyphData.findIndex((gg) => {return gg.index === glyph.index});
		const newData = this.state.glyphData;
		newData[index] = glyph;
		this.setState({glyphData: newData});
	}

	changeAlphabetData = function(glyph)
	{
		var index = this.state.alphabetData.findIndex((gg) => {return gg.index === glyph.index});
		const newData = this.state.alphabetData;
		newData[index] = glyph;
		this.setState({alphabetData: newData});
	}

	fullButtonClick = function()
	{
		this.setState({glyphData: [], expandedElement: Number.MAX_SAFE_INTEGER});
		this.timer = d3.interval(this.timeCall, GENERATION_RATE);
	}

	alphabetize = function(index)
	{
		var newExpanded = this.state.expandedElement;
		var newGlyphs = [...this.state.glyphData];
		var alpha = newGlyphs.splice(index, 1)[0];
		console.log(alpha);
		if(index === this.state.expandedElement)
		{
		  newExpanded = Number.MAX_SAFE_INTEGER;
		}
		else if(index < this.state.expandedElement)
		{
		  newExpanded = this.state.expandedElement-1;
		}

		this.setState(prevState => ({glyphData: newGlyphs, 
			alphabetData: [...prevState.alphabetData, alpha], 
			expandedElement: newExpanded}));
		this.timer = d3.interval(this.timeCall, GENERATION_RATE);
	}

	generateTrainingData = function()
	{
		var train = []
		var size = this.generator.trainingDataSize;
		for(var i = 0; i < size; i++)
		{
		  var newGlyph = this.generator.trainGlyph(train);
		  train.push.apply(train, newGlyph);
		}
		var dataString = JSON.stringify(train);
		download(dataString, this.props.name + "_train.txt");
	}
}	