import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import * as d3 from 'd3';

import Generator from './generator'
import Panel from './Panel'
//import DrawParameters from './DrawParameters'

var GLYPH_SCALE = 1024;

var PANEL_WIDTH = 400;
var PANEL_HEIGHT = 100;
var BOX_SCALE = 50;
var colors = ["green", "red", "cyan", "magenta", "yellow"];
var INSPECT_SCALE = 4;      
var GENERATION_RATE = 20;
var DRAW_SPEED = 100;

var margin = {top: 40, right: 40, bottom: 40, left: 40},
                      mWidth = 1200, 
                      mHeight = 800;

//Strategies for integrating React and D3:
//"...use React to build the structure of the application, and to render traditional HTML elements,
//and then when it comes to the data visualization section, they pass a DOM container (<svg>) over to D3
//and use D3 to create and destroy and update elements."
//Alternatively
//"...you can use D3 to generate all the necessary drawing instructions 
//and use React to create the actual DOM elements" - this is preferable, because D3 is idiomatic 
//visualization logic, whereas React has a robust object hierarchy to provide a skeleton to move with.

class App extends Component {
  constructor(props)
  {
    super(props);
    this.state = 
    {
      /*canvas: d3.select("body").append("svg")
                .attr("class", "container")
                .attr("x", margin.left)
                .attr("y", margin.top)
                .attr("width", mWidth)
                .attr("height", mHeight),*/
      
    }
  }


  render() {
    return (<div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Orthographer</h1>
        </header>
        <p className="App-intro">
          A tool for generating false-language symbol sets from font files.
        </p>
        <svg  className="container"
              x={margin.left}
              y={margin.top}
              width={mWidth}
              height={mHeight}>
          <Panel 
            name = "Draw"
            x = {0} y = {0} 
            width = {PANEL_WIDTH} 
            height = {PANEL_HEIGHT} 
            glyphScale = {GLYPH_SCALE} 
            boxScale = {BOX_SCALE} 
            inspectScale = {INSPECT_SCALE}
            color = {colors[0]} 
            rate = {GENERATION_RATE} 
            speed = {DRAW_SPEED}
            glyphs = {new Generator()}  //Will need to use DrawParams input callbacks to populate parameters here 
          />
          <Panel 
            name = "Draw"
            x = {0} y = {500} 
            width = {PANEL_WIDTH} 
            height = {PANEL_HEIGHT} 
            glyphScale = {GLYPH_SCALE} 
            boxScale = {BOX_SCALE} 
            inspectScale = {INSPECT_SCALE}
            color = {colors[2]} 
            rate = {GENERATION_RATE} 
            speed = {DRAW_SPEED}
            glyphs = {new Generator()}  //Will need to use DrawParams input callbacks to populate parameters here 
          />
        </svg>    
      </div>);
  }
}

export default App;
