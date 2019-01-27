import React, {Component} from 'react';
import Layout from './Layout';

export default class Software extends Component {
	render() { return (
		<Layout>
			<h1>Software</h1>
			<div class = "jumbo">
				<h1>Educational Software, Visualizations and Video Games</h1>
				<h2>PLAPP</h2>
					<p>The first educational software I made used 3D generative models of plants to teach about 
					plant taxonomy and morphology in an action-exploration game.</p>
				<h2>Libraries of Life</h2>
					<p>I developed an <a href='http://libraries-of-life.org'>augmented reality application </a> 
					for mobile devices meant to visualize specimens from biodiversity collections around the country as
					part of a nationwide effort toward digitizing specimen collections.</p>
				<h2>Forest Forecasts</h2>
					<p>I am currently developing a <a href='http://forestforecasts.org'>visualization platform (change this link to updated biendata.org) </a> 
					to investigate large-scale biodiversity patterns within the <a href='http://bien.nceas.ucsb.edu/bien/'>BIEN database</a>.</p>
				<h2>Ecosphere</h2>
					<p>I spent the most recent summer developing augmented reality visualizations of ecosystem 
					processes occuring within the Biosphere 2 dome.</p> 
			<h1>See my <a href='http://github.com/achmurzy'>GitHub</a> page</h1>
			</div>
		</Layout>		
		); 
	}
}