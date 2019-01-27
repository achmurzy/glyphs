//Importing {React} using braces causes failure
import React, {Component} from 'react';

import { Route, Switch } from "react-router-dom";
import Home from "./Home";
import Research from "./Research";
import Software from "./Software";

export default class Routes extends Component
{
	render(){
	return(<Switch>
    			<Route path="/" exact component={Home} />
    			<Route path="/research/" exact component={Research} />
    			<Route path="/software/" exact component={Software} />
  		   </Switch>);
	}
}