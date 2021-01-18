import React from 'react';
import styles from './styles/signin.module.css';
import axios from 'axios';


class Signin extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      email: "",
      password: "",
      showErrorInfo: false,
    }

    // Bindings
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }
  handleInputChange(e){
    this.setState({
      [e.target.name]: e.target.value,
      showErrorInfo: false
    });
  }
  handleSubmit(e){
    console.log("Handling submit");
    var data = {
      email: this.state.email,
      password: this.state.password,
    };
    axios.post('https://g20.labagh.pl/api/signin', data, {withCredentials: true}, {crossDomain: true}).then(function(response){
      console.log(response);
      // Handle successful response
      localStorage.setItem("token", response.data.access_token);
      localStorage.setItem("email", response.data.email);
      localStorage.setItem("refresh_token", response.data.refresh_token);
      localStorage.setItem("id", response.data.id);
      this.props.isLoggedIn();
      this.props.hideAll();
      
      // Check for admin user
      if(response.data.is_admin===1){
        this.props.enableAdmin();
      }
      
    }.bind(this))
            .catch(function(err){
                console.log(err);
                this.setState({showErrorInfo: true});
        }.bind(this));
    e.preventDefault();
  }
  
  

  render(){
    let errorInfo = this.state.showErrorInfo ? <div className={styles.errorInfo}> Operation Failed </div> : null;
    return(
      <div>
        <div className={styles.pane}>
          <div className={styles.title}> Sign in </div>
            <form onSubmit={this.handleSubmit} method="POST" className={styles.form}>
              <div className={styles.inputLabel}> Email address </div>
              <input 
                  className={styles.input}
                  type="text" 
                  value={this.state.email} 
                  name="email" 
                  placeholder="Email address" 
                  required
                  onChange={this.handleInputChange}
              />
              <div className={styles.inputLabel}> Password </div>
              <input 
                  className={styles.input}
                  type="password" 
                  value={this.state.password} 
                  name="password" 
                  placeholder="Password" 
                  required 
                  onChange={this.handleInputChange}
              />
              <button type="submit"  className={styles.button}> Sign in </button> 
            </form>
            {errorInfo}
        </div>
      </div>
    )
  }
}


export default Signin;