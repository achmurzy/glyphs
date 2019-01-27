import React from 'react';
import ReactDOM from 'react-dom';
import {BrowserRouter as Router, Route, Link} from 'react-router-dom';

//This .css file should hold everything, but could import other files
//if things really get disorganized
import './index.css';
import Bootstrap from 'bootstrap/dist/css/bootstrap.min.css';

import App from './App';
import Routes from './Routes'
import registerServiceWorker from './registerServiceWorker';

//This index file is a convention used by webpack that 
//centralizes module import. It acts as an entrypoint to the application
//As always, we are rendering html, so the true entrypoint is in 'public/index.html'

ReactDOM.render(
	<Router>
		<Routes/>
	</Router>, 
	document.getElementById('root'));
registerServiceWorker();
