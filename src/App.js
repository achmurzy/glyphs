import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
//import * as d3 from 'd3';

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
      </div>
    );
  }
}

export default App;
