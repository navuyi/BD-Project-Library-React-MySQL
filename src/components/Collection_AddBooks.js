import React from 'react';
import axios from 'axios';
import styles from './styles/collectionAddBooks.module.css';

class Collection_AddBooks extends React.Component{
  constructor(){
    super();
    this.state =  {
      title: "",
      fname: "",
      lname: "",
      category: "",
      publisher: "",
      year: "",
      amount: null,
      submitInfo: ""
    };
    // Bindings
    this.onChange = this.onChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.submit = this.submit.bind(this);
  }

  onChange(e){
    this.setState({
      [e.target.name]: e.target.value,
      submitInfo: ""
    });
  }
  handleSubmit(e){
    e.preventDefault();
    console.log(this.state);
    this.submit();
  }
  submit(){
    const token = localStorage.getItem("token");
    const header ={headers: {'Authorization': `Bearer ${token}`}};
    const url = "https://g20.labagh.pl/api/add_books";
    const data = {
      fname: this.state.fname,
      lname: this.state.lname,
      publisher: this.state.publisher,
      category: this.state.category,
      title: this.state.title,
      year: this.state.year,
      amount: this.state.amount,
      user_id: localStorage.getItem("id")
    }
    axios.post(url, data, header)
     .then(function(response){
       console.log(response);
       this.setState({
        submitInfo: "Done",
        title: "",
        fname: "",
        lname: "",
        category: "",
        publisher: "",
        year: "",
        amount: "",
       });
     }.bind(this))
     .catch(function(err){
       console.log(err);
       // Refresh expired token
       if(err.response.status===422 || err.response.status===401){
         this.props.refreshToken();
         this.submit();
       }
       else if(err.response.status===500){
        console.log(err.response.data);
        if(err.response.data === "noAuthor"){
          this.setState({
            submitInfo: "No such author in database",
            fname: "", lname: ""
          });
        }
        else if(err.response.data === "noCategory"){
          this.setState({
            submitInfo: "No such category in database",
            category: ""
        });
        }
        else if(err.response.data === "noPublisher"){
          this.setState({
            submitInfo: "No such publisher in database",
            publisher: ""
        })
        }
       }
     }.bind(this))
  }


  render(){
    return(
      <div>
        <div className={styles.main}>
          <div className={styles.title}> Add Books </div>

          <form onSubmit={this.handleSubmit}>
          <div className={styles.container}>
            <div className={styles.wrapper}>
              <div className={styles.label}> Title </div> 
              <input 
                className={styles.input} placeholder="Title"
                name="title" onChange={this.onChange} required
                value={this.state.title}
              />
            </div>

            <div className={styles.wrapper}>
              <div className={styles.label}> Author </div> 
              <input 
                className={styles.authorInput} placeholder="First name"
                name="fname" onChange={this.onChange} required
                value={this.state.fname}
              />
              <input 
                className={styles.authorInput} placeholder="Last name"
                name="lname" onChange={this.onChange} required
                value={this.state.lname}
              />
            </div>

            <div className={styles.wrapper}>
              <div className={styles.label}> Category </div> 
              <input 
                className={styles.input} placeholder="Category"
                name="category" onChange={this.onChange} required
                value={this.state.category}
              />
            </div>

            <div className={styles.wrapper}>
              <div className={styles.label}> Publisher </div> 
              <input 
                className={styles.input} placeholder="Publisher"
                name="publisher" onChange={this.onChange} required
                value={this.state.publisher}
              />
            </div>

            <div className={styles.wrapper}>
              <div className={styles.label}> Year </div> 
              <input 
                className={styles.input} placeholder="Year"
                name="year" onChange={this.onChange} required
                value={this.state.year}
              />
            </div>

            <div className={styles.wrapper}>
              <div className={styles.label}> Amount </div> 
              <input 
                className={styles.input} placeholder="Amount"
                name="amount" onChange={this.onChange} required
                value={this.state.amount}
              /> 
            </div>
          </div>
          <div className={styles.submitPane}> 
            <button type="submit" className={styles.button}> Submit </button>
            <div className={styles.submitInfo}> {this.state.submitInfo} </div>
          </div> 
          </form>
            
          
        </div>
      </div>
    )
  }
}

export default Collection_AddBooks;
