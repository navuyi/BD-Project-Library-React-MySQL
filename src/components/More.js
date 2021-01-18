import React from 'react';
import styles from './styles/more.module.css';
import axios from 'axios';

class More extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      date: null,
      dayOfWeek: "null",
      submitInfo: "",
      isSubmitVisible: true
    }
    // Bindings
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.rentBook = this.rentBook.bind(this);
  }

  rentBook(){
    var token = localStorage.getItem("token");
    var data = {
      book_id: this.props.selectedBook.id,
      pickup_date: this.state.date,
      user_id: localStorage.getItem("id")
    };
    console.log(data);
    axios.post(
        'https://g20.labagh.pl/api/rent_book', 
        data, 
        {headers: {
          'Authorization': `Bearer ${token}`
        }} ,
        {withCredentials: false}, 
        {crossDomain: true})
      .then(function(response){
        // Handle successful response
        if(response.status===204){
          console.log(response);
          let submitInfo = `Rented "${this.props.selectedBook.title}"`;
          this.setState({submitInfo: submitInfo});
          this.setState({isSubmitVisible: false});
          this.props.fetchDataFromAPI();
        }
      }.bind(this))
      .catch(function(err){
        console.log(err);
        if(err.response.status === 422){
          this.props.refreshToken();
          this.rentBook();
        }
      }.bind(this));
  }
  handleSubmit(e){
    this.rentBook();
    e.preventDefault();
  }
  handleChange(e){
    var weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    var day_number = new Date(e.target.value);
    var day = (weekdays[day_number.getDay()]);
    var todayDate = new Date();

    var rent_date = day_number.getTime()
    var today = todayDate.getTime();
    
    const msInDay = 86400000; // how many miliseconds in a day
    const dayDiff = Math.ceil((rent_date-today)/msInDay);

    // Check if picked day is between monday and friday
    if(day === "Sunday" || day === "Saturday"){
      this.setState({submitInfo: "Library is closed at weekends"})
      e.target.value = null;
    }
    else if(rent_date<today){
      this.setState({submitInfo: "Look into the future :)"});
      e.target.value = null;
    }
    else if(dayDiff>7){
      this.setState({submitInfo: "Pick date within 7 days from today"});
      e.target.value = null;
    }
    else{
      this.setState({date: e.target.value});
    }

  }

  render(){
    return(
      <div className={styles.background}>
        <div className={styles.main}>
          <div className={styles.header}> 
            <div className={styles.exit} onClick={this.props.closeMore}> </div>
          </div>  
          <div className={styles.infoPane}>
            <div>
              <div className={styles.label}> Title: </div>
              <div className={styles.bookInfo}> {this.props.selectedBook.title} </div>
            </div>
            <div>
              <div className={styles.label}> Author: </div>
              <div className={styles.bookInfo}> {this.props.selectedBook.author} </div>
            </div>
            <div>
              <div className={styles.label}> Category: </div>
              <div className={styles.bookInfo}> {this.props.selectedBook.category} </div>
            </div>
            <div>
              <div className={styles.label}> Year: </div>
              <div className={styles.bookInfo}> {this.props.selectedBook.year} </div>
            </div>
            <div>
              <div className={styles.label}> Publisher: </div>
              <div className={styles.bookInfo}> {this.props.selectedBook.publisher} </div>
            </div>
            <div>
              <div className={styles.label}> Books available: </div>
              <div className={styles.bookInfo}> {this.props.selectedBook.amount} </div>
            </div>
            <form onSubmit={this.handleSubmit} >
              <div className={styles.label}> Pickup date </div>
              <input 
                type="date" 
                name="date" 
                className={styles.bookInfo} 
                id={styles.dateInput} 
                onChange={this.handleChange}
                onClick={()=>{this.setState({submitInfo: ""});}}
                required 
              />
              {this.state.isSubmitVisible ? <button className={styles.button} type="submit" > Rent </button> : null}
            </form>
            <div className={styles.submitInfo}> {this.state.submitInfo} </div>
          </div>
        </div>

      </div>
    )
  }
}
export default More;