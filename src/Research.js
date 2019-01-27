import React, {Component} from 'react';
import Layout from './Layout';
import CV from './resources/documents/CV.pdf';

export default class About extends Component {
	render() { return (
	<Layout>
		<div>	
			<h1>Research</h1>
			<div class="jumbo">
				<div class="right tomster"></div>
				<div class = "jumbo">
					<h2>LiDAR-based forest ecology</h2>
						<p>Here I talk about all my great plans for scanning forests globally</p>
					<h2>SDMs, trait biogeography and ecological forecasting</h2>
						<p>Here I talk about all the interesting ecoinformatics work I'm pursuing.</p>
					<h2>Other Interests</h2>
					<p>I can also mention that I'm (becoming) passionate about educational technology,
						that I frequently develop <a href='/software/'>software</a> for visualizing scientific data with an
						emphasis on interaction.
					</p>
				</div>
				<a href={CV}>CV</a>
			</div>
		</div>
	</Layout>
	); }
}