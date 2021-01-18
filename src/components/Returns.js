import React from 'react';
import axios from 'axios';
import styles from './styles/returns.module.css';

class Returns extends React.Component{
  constructor(){
    super();
    this.state = {
     booksList: [],
     fname: "",
     lname: "",
     id: null,
     isTableVisible: false,
     tableInfo: "Check user's orders",
     bookToReturn: null
    };
    // Bindings
    this.refreshToken = this.refreshToken.bind(this);
    this.fetchDataFromAPI = this.fetchDataFromAPI.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.returnBook = this.returnBook.bind(this);
    this.handleBookReturn = this.handleBookReturn.bind(this);
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
      user_id: this.state.id
    }
    const header ={headers: {'Authorization': `Bearer ${token}`}}

    axios.post("https://g20.labagh.pl/api/get_user_data", data, header)
    .then(function(response){
      console.log(response.data);
      if(response.data.length===0){
        this.setState({
          isTableVisible: false,
          tableInfo: "User does not exist",
          fname: "",
          lname: ""
        });
        return 0;
      }
      // Handle user data
      var user_data = response.data[0]; // Always first array in response data ???
      var tmpUserData = {
        fname: user_data[0],
        lname: user_data[1],
        email: user_data[2],
        read_books: user_data[3]
      }

      this.setState({
        fname: tmpUserData.fname,
        lname: tmpUserData.lname
      })
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
      this.setState({
        booksList: tmpBooksList,
        isTableVisible: true
      });
      console.log(this.state.booksList);
      if(this.state.booksList.length === 0){
        this.setState({
          isTableVisible: false,
          tableInfo: "Register is empty"
        })
      }
    }.bind(this))
    .catch(function(err){
      console.log(err);
      if(err.response.status===401 || err.response.status===422){
        this.refreshToken();
        this.fetchDataFromAPI();
      }
    }.bind(this))
  }

  handleChange(e){
    this.setState({
      [e.target.name]: e.target.value,
      tableInfo: "Check user's orders",
    });
    console.log(this.state);
  }
  handleSubmit(e){
    e.preventDefault();
    this.fetchDataFromAPI();
  }

  handleBookReturn(e){
    this.setState({
      bookToReturn: e.target.getAttribute('name')
    }, () => {
      this.returnBook();
    })
  }
  
  returnBook(){
    // Return book for real 
    const token = localStorage.getItem("token");
    const header ={headers: {'Authorization': `Bearer ${token}`}}
    const data = {
      order_id: this.state.bookToReturn,
      user_id: localStorage.getItem("id")
    }
    console.log(data);
    axios.post("https://g20.labagh.pl/api/return_book", data ,header)
    .then(function(response){
      console.log(response);
      this.fetchDataFromAPI();
    }.bind(this))
    .catch(function(err){
      console.log(err);
      // Refresh expired token
      if(err.response.status===422){
        this.refreshToken();
        this.returnBook();
      }
    }.bind(this))
  }
  
  render(){
    var index = 0;
    var table =  <table className={styles.table}>
                  <tbody>
                    <tr className={styles.tableTitleBar}>
                      <th> Title </th>
                      <th> Author </th>
                      <th > Days left </th>
                      <th > Return </th>
                    </tr>
                    {
                    this.state.booksList.map((book) => {
                    const style = index%2===0 ? {backgroundColor: "rgb(255, 222, 130, 0.5)"} : {backgroundColor: "rgb(219, 191, 112, 0.5)"}
                    index += 1;
                    return  <tr style={style}> 
                              <td > {book.title} </td>
                              <td > {book.author} </td>
                              <td > {book.daysLeft} </td>
                              <td> <button name={book.order_id} onClick={this.handleBookReturn} className={styles.returnButton}> Return </button></td>
                            </tr>
                    })}
                  </tbody>
                </table>
    return(
      <div>
        <div className={styles.userData}>
          <form onSubmit={this.handleSubmit}>
            <div className={styles.inputLabel}> User ID</div>
              <input 
                className={styles.input} 
                type="text"
                required
                onChange={this.handleChange}
                name="id"
                value={this.state.id}
              />
            
            <button className={styles.submitButton}> Check </button>

            <div className={styles.outputLabel}> User first name</div>
            <input 
              className={styles.output} 
              type="text" 
              onChange={this.handleChange}
              name="fname"
              disabled
              value={this.state.fname}
            />
            
            <div className={styles.outputLabel}> User last name</div>
            <input className={styles.output} 
              type="text"
              disabled
              onChange={this.handleChange}
              name="lname"
              value={this.state.lname}
            />
            
          </form>
        </div>

        <div className={styles.userBooks}>
         {this.state.isTableVisible ? table : <div className={styles.tableInfo}> {this.state.tableInfo} </div>}
        </div>

      </div> 
     
    )
  }
}

export default Returns;
