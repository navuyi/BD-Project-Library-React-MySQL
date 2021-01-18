import React from 'react';
import axios from 'axios';
import styles from './styles/manage.module.css';
import Returns from './Returns';
import Collection from './Collection';

class Manage extends React.Component{
  constructor(){
    super();
    this.state = {
      isReturnsVisible: true,
      isCollectionVisible: false
    };
    // Bindings
    this.showReturns = this.showReturns.bind(this);
    this.showCollection = this.showCollection.bind(this);
  }
  showReturns(){
    console.log("Showing returns");
    this.setState({isReturnsVisible: true});
    this.setState({isCollectionVisible: false});
  }
  showCollection(){
    console.log("Showing collection");
    this.setState({isCollectionVisible: true});
    this.setState({isReturnsVisible: false});
  }
  render(){
    
    return(
      <div className={styles.main}>  
        <div className={styles.menu}>
          <button className={styles.menuButton} onClick={this.showReturns}> Returns </button>
          <button className={styles.menuButton} onClick={this.showCollection} > Collection </button>
        </div>

        {this.state.isReturnsVisible ? <Returns /> : null}
        {this.state.isCollectionVisible ? <Collection /> : null}    
      
      
      </div>    
    )
  }
}

export default Manage;
