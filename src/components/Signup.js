import React from 'react';
import styles from './styles/signup.module.css';
import axios from 'axios';

class Signup extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      fname: "",
      lname: "",
      email: "",
      password: "",
      password_repeat: "",

      showErrorInfo: false
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
    console.log(e.target.value);
  }
  handleSubmit(e){
    e.preventDefault();
    console.log("Handling sign up");
    var data = {
      fname: this.state.fname,
      lname: this.state.lname,
      email: this.state.email,
      password: this.state.password,
      password_repeat: this.state.password_repeat
    }
    axios.post('https://g20.labagh.pl/api/signup', 
      data, 
      {withCredentials: true}, 
      {crossDomain: true}
    )
    .then(function(response){
        if(response.status === 200){
          console.log("Succesfull registration");
          console.log(response);
          this.props.showSignIn(); 
        }
    }.bind(this))
            .catch(function(err){
                console.log(err);
                console.log(err.response);
                console.log(err.request);
                console.log(err.message);
                this.setState({showErrorInfo: true});
        }.bind(this));

    
  }
  

  render(){
    let errorInfo = this.state.showErrorInfo ? <div className={styles.errorInfo}> User exists or passwords are not the same </div> : null;
    return(
      <div>
        <div className={styles.pane}>
          <div className={styles.title}> Sign Up </div>
            <form onSubmit={this.handleSubmit} className={styles.form}>
              <div className={styles.inputLabel}> First name </div>
              <input 
                  className={styles.input}
                  type="text" 
                  vlaue={this.state.fname} 
                  name="fname"
                  id="fname"
                  placeholder="First Name" 
                  required
                  onChange={this.handleInputChange}
              />
              <div className={styles.inputLabel}> Last name </div>
              <input 
                  className={styles.input}
                  type="text" 
                  value={this.state.lname} 
                  name="lname"
                  id="lname" 
                  placeholder="Last name" 
                  required 
                  onChange={this.handleInputChange}
              />
              <div className={styles.inputLabel}> Email address </div>
              <input 
                  className={styles.input}
                  type="email" 
                  value={this.state.email} 
                  name="email"
                  id="email"
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
                  id="password"
                  placeholder="Password" 
                  required 
                  onChange={this.handleInputChange}
              />
              <div className={styles.inputLabel}> Repeat password </div>
              <input 
                  className={styles.input}
                  type="password" 
                  value={this.state.password_repeat} 
                  name="password_repeat" 
                  id="password_repeat"
                  placeholder="Repeat password" 
                  required 
                  onChange={this.handleInputChange}
              />
              <button type="submit"  className={styles.button}> Sign up </button> 
            </form>
            {errorInfo}
        </div>
      </div>
    )
  }
}


export default Signup;
