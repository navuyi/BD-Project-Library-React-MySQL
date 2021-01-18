import React from 'react';
import styles from './styles/passwordChange.module.css';
import axios from 'axios';

class PasswordChange extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      currentPassword: "",
      newPassword: "",
      newPasswordRepeat: "",
      positiveInfo: "",
      isPositiveInfoVisible: false,
      negativeInfo: "",
      isNegativeInfoVisible: true
    }
    // Bindings
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.changePassword = this.changePassword.bind(this);
  }

  // THERE IS SOME ERROR ON SERVER SIDE 
  // ALSO PROVIDE PASSWORD AND PASSWORD REPEAT CHECK ON CLIENT SIDE
  changePassword(){
    // Check is password and password repeat are the same
    if(this.state.newPassword !== this.state.newPasswordRepeat){
      this.setState({
        isNegativeInfoVisible: true,
        negativeInfo: "New passwords must be the same",
        currentPassword: "",
        newPassword: "",
        newPasswordRepeat: ""
      });
      return 0;
    }
    const token = localStorage.getItem("token");
    const header ={headers: {'Authorization': `Bearer ${token}`}}
    const data = {
      user_id: localStorage.getItem("id"),
      current_password: this.state.currentPassword,
      new_password: this.state.newPassword
    }
    axios.post("https://g20.labagh.pl/api/change_password", data ,header)
    .then(function(response){
      // Password was changed 
      console.log(response);
      this.setState({
        isPositiveInfoVisible: true,
        positiveInfo: "Password changed"
      });
    }.bind(this))
    .catch(function(err){
      console.log(err);
      console.log(err.response.status)
      // Refresh token
      if(err.response.status === 422){
        this.props.refreshToken();
        this.changePassword();
      }
      // Wrong current password
      if(err.response.status === 401){
        this.setState({
          isNegativeInfoVisible: true,
          negativeInfo: "Current password is wrong. Retry.",
          currentPassword: "",
          newPassword: "",
          newPasswordRepeat: ""
        })
      }
    }.bind(this))
  }
  handleSubmit(e){
    e.preventDefault();
    this.changePassword();
  }
  handleChange(e){
    console.log(e.target.name);
    this.setState({
      [e.target.name]: e.target.value,
      isNegativeInfoVisible: false
    });
  }
  render(){
    var passwordsPane = <form>
    <div className={styles.passwordsPane}> 
        <div className={styles.wrapper}>
          <div className={styles.label}> Current password </div>
          <input 
            type="password" 
            required 
            className={styles.input}
            value={this.state.currentPassword}
            onChange={this.handleChange}
            name="currentPassword"
          /> 
        </div>
        <div className={styles.wrapper}>
          <div className={styles.label}> New password </div>
          <input 
            type="password" 
            required 
            className={styles.input}
            value={this.state.newPassword}
            onChange={this.handleChange}
            name="newPassword"
          /> 
        </div>
        <div className={styles.wrapper}>
          <div className={styles.label}> Repeat password </div>
          <input 
            type="password" 
            required 
            className={styles.input}
            value={this.state.newPasswordRepeat}
            onChange={this.handleChange}
            name="newPasswordRepeat"
          /> 
        </div>
        <button type="submit" onClick={this.handleSubmit} className={styles.button}> Change </button>
    </div>
  </form>
    return(
      <div className={styles.background}>
        <div className={styles.main}>
          <div className={styles.header}> 
            <div className={styles.exit} onClick={this.props.closePasswordChange}></div>
          </div>
          {this.state.isPositiveInfoVisible ? <div className={styles.positiveInfo}> {this.state.positiveInfo} </div> : passwordsPane}
          {this.state.isNegativeInfoVisible ? <div className={styles.negativeInfo}> {this.state.negativeInfo} </div> : null }
        </div>
      </div> 
    )
  }
}
export default PasswordChange;