import React from 'react';

import Navbar from './components/Navbar';
import Signin from './components/Signin';
import Signup from './components/Signup';
import Books from './components/Books';
import Account from './components/Account';
import Manage from './components/Manage';
class App extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      isLoggedIn: false,
      isSignInVisible: false,
      isSignUpVisible: false,
      isAccountVisible: false,
      isBooksVisible: false,
      isManageVisible: false,
      isAdmin: false
    };
    
    // Bindings
    this.isLoggedIn = this.isLoggedIn.bind(this);
    this.showSignIn = this.showSignIn.bind(this);
    this.showSignUp = this.showSignUp.bind(this);
    this.showBooks = this.showBooks.bind(this);
    this.showAccount = this.showAccount.bind(this);
    this.signOut = this.signOut.bind(this);
    this.hideAll = this.hideAll.bind(this);
    this.showManage = this.showManage.bind(this);
    this.enableAdmin = this.enableAdmin.bind(this);
    //this.refreshToken = this.refreshToken(this);
    
  }
  
  // Check after page refresh if user is still logged in
  componentDidMount(){
    this.isLoggedIn();
  }

  // Universal method for checking if browser stores access_token and email data received from server
  isLoggedIn(){
    if(localStorage.getItem("token") !== null && localStorage.getItem("token") !== undefined){
      this.setState({isLoggedIn: true});
    }else{
      this.setState({isLoggedIn: false});
    }
  }

  // Executed when navbar's signin button is clicked
  showSignIn(){
    console.log("Showing log in");
    this.setState({isSignInVisible: true});
    this.setState({isSignUpVisible: false});
    this.setState({isManageVisible: false});
  }
  // Executed when navbar's signup button is clicked
  showSignUp(){
    console.log("Showing register");
    this.setState({isSignInVisible: false});
    this.setState({isSignUpVisible: true});
    this.setState({isManageVisible: false});
  }
  showBooks(){
    console.log("Showing books");
    this.setState({isBooksVisible: true});
    this.setState({isAccountVisible: false});
    this.setState({isManageVisible: false});
  }
  showAccount(){
    console.log("Showing user's account");
    this.setState({isBooksVisible: false});
    this.setState({isAccountVisible: true});
    this.setState({isManageVisible: false});
  }
  showManage(){
    console.log("Showing manage");
    this.setState({isManageVisible: true});
    this.setState({isBooksVisible: false});
    this.setState({isAccountVisible: false});
  }
  hideAll(){
    this.setState({isSignInVisible: false});
    this.setState({isSignUpVisible: false});
    this.setState({isBooksVisible: false});
    this.setState({isAccountVisible: false});
    this.setState({isManageVisible: false});
  }
  signOut(){
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("id");
    this.setState({
      isAdmin: 0
    })
    this.isLoggedIn();
    this.hideAll();
  }
  enableAdmin(){
    console.log("Enabling admin ! ! !");
    this.setState({
      isAdmin: true
    })
  }

  render(){
    let signInPane = this.state.isSignInVisible ? <Signin isLoggedIn={this.isLoggedIn} hideAll={this.hideAll} enableAdmin={this.enableAdmin}/> : null;
    let signUpPane = this.state.isSignUpVisible ? <Signup showSignIn={this.showSignIn}/> : null;

    let booksPane = this.state.isBooksVisible && this.state.isLoggedIn ? <Books isLoggedIn={this.isLoggedIn} /> : null;
    let accountPane = this.state.isAccountVisible && this.state.isLoggedIn ? <Account /> : null;
    return(
        <div>
          {booksPane}
          {accountPane}
          <Navbar
            showSignIn={this.showSignIn}
            showSignUp={this.showSignUp}
            showBooks={this.showBooks}
            showAccount={this.showAccount}
            showManage={this.showManage}
            signOut={this.signOut}
            {... this.state}
          />          
          {signInPane}
          {signUpPane}        
          {this.state.isManageVisible ? <Manage /> : null}
      </div>     
    )
  }
}

export default App;
