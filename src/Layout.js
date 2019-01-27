import React, {Component} from 'react';
import Header from './Header';
import Footer from './Footer';

export default class Layout extends Component
{
	render() {
    return(
       <div className = "Layout">
          <Header />
             { this.props.children }
             {/* anything else you want to appear on every page that uses this layout */}
          <Footer />
       </div>
    );
}
}