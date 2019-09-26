import React, { Component } from 'react';
import * as d3 from 'd3';
//import update from 'immutability-helper';

import Panel from './Panel'
import DrawParameters from './DrawParameters'
import GlyphButton from './GlyphButton'
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
			else if(this.props.fileType === "JSON")
			{
				console.log(this.props.fileResult);
				this.fileGlyphs = this.generator.parseJSON(this.props.fileResult, this.glyphCounter);
				this.setState({glyphData: [], expandedElement: Number.MAX_SAFE_INTEGER}, () => 
      			{
      				for(var i =0;i<this.fileGlyphs.length;i++)
			        	{this.addGlyph(this.fileGlyphs[i]);}
      			});
			}
			else //font
			{
				this.font = this.props.fileResult;
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
		            fetchGlyphs={this.props.fetchGlyphs}
		          />
		          {this.glyphsFull() && 
		          	<GlyphButton ref={this.fullButton} 
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

	//Creates training data in a JSON format for processing server-side.
	//Created by JSON stringify on the raw glyph generator sequence data, which is not a proper object model
	//Rather, it is a string of stroke symbols followed by 2D object coordinates when appropriate
	//We figured that a 'flat' representation would let us quickly begin training, but we will want many subsets
	//of models an an organized way to handle metadata for training combinations of symbol sets
	//Dealing with custom alphabets as font files will be a necessity for staying organized

	//We could use Google's glyph representations following Quick, Draw!
	//At the lowest level we are already using the opentype Glyph class to represent glyphs

	//We would prefer a representation like the following:
	/*	{
			alphabet:
			{
				glyphs: [ ...
				{
					name: 'glyph '+counter,
	        		unicode: counter,
	        		index: counter,
	        		advanceWidth: GLYPH_SCALE,
	        		path: [ ...
					{
						type: 'M' | 'L' | 'Q' | 'C'
						x:
						y:
						x1:
						y1:
						x2:
						y2:		
						}... ]
					glyph metadata...
				
				}... ]

				alphabet metadata...
			}
		}
		This needs to change to using our render-able Glyph representations, and generate training data as 
		unique alphabets representing areas of the parameter space. We need to store these parameters along with
		the glyphs themselves. Alphabet panels should expect to read in this representation, whereas Orthographers
		export alphabets. We need to think much more carefully about how to associate glyphs with the parameters that
		generated them. We also need to think about how parsing font files will fit into this representation framework
	*/
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
		/*fetch('http://localhost:5000/get_glyph', 
      {method: 'GET', 
      headers: {"Access-Control-Allow-Origin": "*",
  				'content-type': 'application/json'}})
    .then(results => 
    { 
      return results.json(); 
    }).then(data => 
      {
        console.log(data);
        //Unclear if this works
        //setTextResult(data);
      });*/
	}
}	