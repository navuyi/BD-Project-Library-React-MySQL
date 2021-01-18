import React from 'react';
import styles from './styles/navbar.module.css';
import instyles from './styles/signInUpBar.module.css';
import outstyles from './styles/signOutBar.module.css';
import navstyles from './styles/navButtons.module.css';

class Navbar extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      
    }

    // Bindings
  }
  
  render(){
    // Visible buttons depend on whether user is logged in or not
    var signInUpBar = <div className={instyles.main}>
                        <div className={instyles.signInButton} onClick={this.props.showSignIn}>
                            <div className={instyles.signInText} > Sign in</div>
                            <div className={instyles.signInImage}></div>
                        </div>

                        <div className={instyles.signUpButton} onClick={this.props.showSignUp}>
                            <div className={instyles.signUpText}> Sign up </div> 
                            <div className={instyles.signUpImage}></div>
                        </div>
                      </div>
    var signOutBar = <div className={outstyles.main}> 
                        <div className={outstyles.email}> {localStorage.getItem("email")} </div>
                        <div className={outstyles.signOutButton} onClick={this.props.signOut}> Log out</div>
                   </div>
    let signButtons;
    signButtons = this.props.isLoggedIn ? signOutBar : signInUpBar

    // Navigation buttons - books(displaying and making orders), account(managing ordered books etc)
    var navButtons = this.props.isLoggedIn ?
    <div className={navstyles.main}> 
      <div className={navstyles.booksButton} onClick={this.props.showBooks}> Books </div>
      <div className={navstyles.accountButton} onClick={this.props.showAccount}> Account </div>
    </div> : null;
    
    return(
      <div className={styles.navbarMain}>
        <div className={styles.navbarTitle}> E-Library </div>
        {signButtons}
        {navButtons}
        {this.props.isAdmin && this.props.isLoggedIn ? <div className={styles.manageButton} onClick={this.props.showManage}> Manage </div> : null}
      </div>
    )
  }
}


export default Navbar;