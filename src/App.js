import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import * as d3 from 'd3';

import Panel from './Panel'
import DrawParameters from './DrawParameters'

var GLYPH_SCALE = 1024;

var PANEL_WIDTH = 400;
var PANEL_HEIGHT = 100;
var BOX_SCALE = 50;
var colors = ["green", "red", "cyan", "magenta", "yellow"];
var INSPECT_SCALE = 4;      
var GENERATION_RATE = 150;
var DRAW_SPEED = 100;

var margin = {top: 40, right: 40, bottom: 40, left: 40},
                      mWidth = 1200, 
                      mHeight = 800;

class App extends Component {
  constructor(props)
  {
    super(props);
    this.state = 
    {
      canvas: d3.select("body").append("svg")
                .attr("class", "container")
                .attr("x", margin.left)
                .attr("y", margin.top)
                .attr("width", mWidth)
                .attr("height", mHeight),
      
    }
  }


  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <p className="App-intro">
          To get started, edit <code>src/App.js</code> and save to reload.
        </p>
        <Panel 
          name = "Draw"
          drawParams = {new DrawParameters(panel_x, panel_y, 
            PANEL_WIDTH, PANEL_HEIGHT, BOX_SCALE, colors[num], 
            INSPECT_SCALE, GENERATION_RATE, DRAW_SPEED)}
          glyphs = {new Generator()}
        />  
      </div>
    );
  }
}

export default App;
