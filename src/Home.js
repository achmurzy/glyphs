import React, {Component} from 'react';
import App from './App';
import Layout from './Layout'

export default class Home extends Component {
	
  render() {
    return (
        <Layout>
          <App/>
        </Layout>
    );
  }
}
/*
              <UncontrolledDropdown nav inNavbar>
                <DropdownToggle nav caret>
                  Options
                </DropdownToggle>
                <DropdownMenu right>
                  <DropdownItem>
                    Option 1
                  </DropdownItem>
                  <DropdownItem>
                    Option 2
                  </DropdownItem>
                  <DropdownItem divider />
                  <DropdownItem>
                    Reset
                  </DropdownItem>
                </DropdownMenu>
              </UncontrolledDropdown>
*/