import React from 'react';
import styles from './styles/account.module.css';
import axios from 'axios';
import PasswordChange from './PasswordChange';

class Account extends React.Component{
  constructor(){
    super();
    this.state = {
      booksList: [],
      userData: [],
      isPasswordChangeVisible: false,
      bookToExtend: null
    }
    // Bindings
    this.fetchDataFromAPI = this.fetchDataFromAPI.bind(this);
    this.refreshToken = this.refreshToken.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.closePasswordChange = this.closePasswordChange.bind(this);
    this.handleBookExtend = this.handleBookExtend.bind(this);
    this.extendBook = this.extendBook.bind(this);
  }

  refreshToken(){
    var refresh_token = localStorage.getItem("refresh_token");
    axios.get("https://g20.labagh.pl/api/refresh", {
      headers: {
        'Authorization': `Bearer ${refresh_token}`
      }
    }).then(function(response){
      console.log("Adding fresh access token to localstorage");
      localStorage.setItem("token", response.data.access_token);
    }.bind(this)).catch((err) =>{
      console.log(err);
    })
  }

  fetchDataFromAPI(){
    const token = localStorage.getItem("token");
    const data = {
      user_id: localStorage.getItem("id")
    }
    const header ={headers: {'Authorization': `Bearer ${token}`}}

    axios.post("https://g20.labagh.pl/api/get_user_data", data, header)
    .then(function(response){
      console.log(response.data);
  

      // Handle user data 
      var user_data = response.data[0]; // Always first array in response data ???
      var tmpUserData = {
        fname: user_data[0],
        lname: user_data[1],
        email: user_data[2],
        read_books: user_data[3]
      }
      this.setState({userData: tmpUserData});
      //Handle books data
      var tmpBooksList = [];
      response.data.slice(1).map((book)=>{
        // Determine if book return date is extendable API returns 0 if book has NOT been extended yet
        var extendable;
        if(book[4]===0){
          extendable = true;
        }else{
          extendable = false;
        }
        tmpBooksList.push({
          title: book[2],
          author: book[0]+" "+book[1],
          daysLeft: book[3],
          isExtendable: extendable,
          order_id: book[5]
        })
      })
      this.setState({booksList: tmpBooksList});
    }.bind(this))
    .catch(function(err){
      console.log(err);
      this.refreshToken();
      this.fetchDataFromAPI();
    }.bind(this))
  }

  componentDidMount(){
    this.fetchDataFromAPI();
  }

  handleClick(){
    console.log("Showing password change");
    this.setState({isPasswordChangeVisible: true});
  }
  closePasswordChange(){
    this.setState({isPasswordChangeVisible: false});
  }
  


  extendBook(){
    const token = localStorage.getItem("token");
    const header ={headers: {'Authorization': `Bearer ${token}`}}
    const data = {
      order_id: this.state.bookToExtend
    }
    console.log(data);
    axios.post("https://g20.labagh.pl/api/prolong", data ,header)
    .then(function(response){
      console.log(response);
      this.fetchDataFromAPI();
    }.bind(this))
    .catch(function(err){
      console.log(err);
      // Refresh expired token
      if(err.response.status===422){
        this.refreshToken();
        this.extendBook();
      }
    }.bind(this))
  }
  // This way the setState is done first and then the extendBook function
  handleBookExtend(e){
    this.setState({
      bookToExtend: e.target.getAttribute('name')
    }, () => {
      this.extendBook();
    })
  }

  render(){
    var index=0;
    return(
      <div className={styles.mainPane}>
        <div className={styles.profilePane}> 
          <div className={styles.title}> Profile </div>
          <div className={styles.profileDataPane}>
            
            <div className={styles.data}> First Name: {this.state.userData.fname} </div>
            
           
            <div className={styles.data}> Last Name: {this.state.userData.lname} </div>
        
            <div className={styles.data}> Email: {this.state.userData.email} </div>

            <div className={styles.data}> Rented books in total: {this.state.userData.read_books} </div>

            <button className={styles.pwdButton} onClick={this.handleClick}> Change password </button>
          </div>
        </div>

             <div className={styles.separator}></div>

        <div className={styles.booksPane}> 
          <div className={styles.title}> Your books</div>
          <div className={styles.books}>
            <table className={styles.table}>
              <tbody>
              <tr className={styles.tableTitleBar}>
                <th> Title </th>
                <th> Author </th>
                <th > Days left </th>
                <th > Extension </th>
              </tr>
              {
              this.state.booksList.map((book) => {
              const style = index%2===0 ? {backgroundColor: "rgb(255, 222, 130, 0.5)"} : {backgroundColor: "rgb(219, 191, 112, 0.5)"}
              index += 1;
              return  <tr style={style}> 
                        <td > {book.title} </td>
                        <td > {book.author} </td>
                        <td > {book.daysLeft} </td>
                        <td > {book.isExtendable ? <button className={styles.extendButton} onClick={this.handleBookExtend} name={book.order_id}> Extend </button> : null} </td>
                      </tr>
              })}
              </tbody>
            </table>
          </div>
        </div>
        {this.state.isPasswordChangeVisible ? <PasswordChange closePasswordChange={this.closePasswordChange} refreshToken={this.refreshToken} /> : null}
      </div>
    )
  }
}
export default Account;