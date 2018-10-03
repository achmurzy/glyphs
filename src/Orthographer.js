import React, { Component } from 'react';
import * as d3 from 'd3';
//import update from 'immutability-helper';

import Panel from './Panel'
import DrawParameters from './DrawParameters'
import Button from './Button'
import Generator from './generator'
import {glyphToStrokes, alphabetize } from './glyph-helper'
import {loadFont, download, fontGlyphToStrokes} from './font-helper'

export const GLYPH_SCALE = 1024;

var PANEL_WIDTH = 400;
var PANEL_HEIGHT = 150;
var BOX_SCALE = 50;
var colors = ["green", "red", "cyan", "magenta", "yellow"];
var INSPECT_SCALE = 4;      
var GENERATION_RATE = 50;
var DRAW_SPEED = 500;

export default class Orthographer extends React.Component
{
	constructor(props)
	{
		super(props);
		this.state =
		{
			glyphData: [],
		}
		this.glyphCounter = 0;

		this.generator = new Generator();
		this.changeGeneratorValue = this.changeGeneratorValue.bind(this);
		this.changeExpandedElement = this.changeExpandedElement.bind(this);
		this.generateTrainingData = this.generateTrainingData.bind(this);
		this.alphabetize = this.alphabetize.bind(this);
		this.fullButtonClick = this.fullButtonClick.bind(this);

		this.glyphsX = PANEL_WIDTH / BOX_SCALE;
    	this.glyphsY = PANEL_HEIGHT / BOX_SCALE;
    
    	this.glyphCount = this.glyphsX*this.glyphsY;
    	const MAX_GLYPHS = this.glyphCount;

	    this.lastTime = 0;
	    this.totalTime = 0.1;
	    this.stopTime = 0;

	    this.addGlyph = function(glyph)  //Does this re-render every glyph?
	    {
	        this.setState(prevState => ({glyphData: [...prevState.glyphData, glyphToStrokes(glyph)]}));
	        this.glyphCounter++;   
	    };

	    this.glyphsFull = function() 
    	{ return MAX_GLYPHS === this.state.glyphData.length; };
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
	            _this.addGlyph(glyph);
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

	    this.changeStrokeData = this.changeStrokeData.bind(this);
	}

	componentDidUpdate()
	{
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
		            color = {colors[0]} 
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
		            color={colors[0]}
		            valueChange={this.changeGeneratorValue}
		            generateTrainingData={this.generateTrainingData}
		          />
		          {this.glyphsFull() && 
		          	<Button ref={this.fullButton} x={this.props.x+PANEL_WIDTH} y={this.props.y+PANEL_HEIGHT} boxScale={BOX_SCALE} 
		          			clickFunction={this.fullButtonClick}/>}
	          </g>);
	}

	changeGeneratorValue = function(name, value)
	{
		this.generator[name] = value;
		console.log(name);
		console.log(value);
	}

	changeExpandedElement = function(element)
	{
		this.setState({expandedElement: element});
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

	fullButtonClick = function()
	{
		this.setState({glyphData: [], expandedElement: Number.MAX_SAFE_INTEGER});
		this.timer = d3.interval(this.timeCall, GENERATION_RATE);
	}

	alphabetize = function(index)
	{
		var newExpanded = this.state.expandedElement;
		var newGlyphs = [...this.state.glyphData];
		newGlyphs.splice(index, 1);
		if(index === this.state.expandedElement)
		{
		  newExpanded = Number.MAX_SAFE_INTEGER;
		}
		else if(index < this.state.expandedElement)
		{
		  newExpanded = this.state.expandedElement-1;
		}
		this.setState({glyphData: newGlyphs, expandedElement: newExpanded});
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

	showFont = function(font)
	{
		this.glyphData = [];
		for(var i = 0; i < font.glyphs.length; i++)
		{
		if(this.glyphData.length > this.MAX_GLYPHS*2)
		break;
		var glyph = fontGlyphToStrokes(font.glyphs.glyphs[i], this.drawParams.boxColor);

		if(glyph.strokes.length > 0)
		{
		this.glyphData.push(glyph);
		}  
		var height = this.windowData.length / this.drawParams.props.glyphsX * this.drawParams.boxScale
		d3.select("body").select("svg").attr("height", 800+height);
		}
	}
}	