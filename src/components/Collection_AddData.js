import React from 'react';
import axios from 'axios';
import styles from './styles/collectionAddData.module.css';


class Collection_AddData extends React.Component{
  constructor(){
    super();
    this.state = {
      newCategory: "",
      newAuthorFname: "",
      newAuthorLname: "",
      newCategory: "",
      newPublisher: "",
      acpInfo: "",
      url: "",
      data: []
    };
    // Bindings
     // Bindings
     this.handleChange = this.handleChange.bind(this);
     this.handleSubmit = this.handleSubmit.bind(this);
     this.submit = this.submit.bind(this);
  }
  
  handleChange(e){
    this.setState({
      [e.target.name]: e.target.value,
      acpInfo: ""
    })
    console.log(this.state.newAuthor);
    console.log(this.state.newCategory);
    console.log(this.state.newPublisher);
  }
  
  submit(){
     // Return book for real 
     const token = localStorage.getItem("token");
     const header ={headers: {'Authorization': `Bearer ${token}`}}
     const data = this.state.data;
     const url = this.state.url;
     axios.post(url, data ,header)
     .then(function(response){
       console.log(response);
       this.setState({
         acpInfo: "Done",
         newAuthorFname: "",
         newAuthorLname: "",
         newCategory: "",
         newPublisher: ""
       })
     }.bind(this))
     .catch(function(err){
       console.log(err);
       // Refresh expired token
       if(err.response.status===422){
         this.props.refreshToken();
         this.submit();
       }
       else if(err.response.status===500){
         this.setState({
          acpInfo: "Provided value already exists",
          newAuthorFname: "",
          newAuthorLname: "",
          newCategory: "",
          newPublisher: ""
         })
       }
     }.bind(this))
  }
  // This function set appriote states
  handleSubmit(item){
    return e => {
      e.preventDefault();
      if(item === "newAuthor"){
        this.setState({
          data: {
            user_id: localStorage.getItem("id"),
            fname: this.state.newAuthorFname,
            lname: this.state.newAuthorLname
          },
          url: "https://g20.labagh.pl/api/add_author"
        }, () =>{ this.submit();});
      }else if(item === "newCategory"){
        this.setState({
          data: {
            user_id: localStorage.getItem("id"),
            name: this.state.newCategory
          },
          url: "https://g20.labagh.pl/api/add_category"
        }, () => {this.submit();})
      }else if(item === "newPublisher"){
        this.setState({
          data: {
            user_id: localStorage.getItem("id"),
            name: this.state.newPublisher
          },
          url: "https://g20.labagh.pl/api/add_publisher"
        }, () => {this.submit();})
      }
    }
  }
  render(){
    return(
      <div>
        <div className={styles.leftPane}>
          <div className={styles.title}> Book Informations </div>
          <form onSubmit={this.handleSubmit('newAuthor')}>
            <div className={styles.acpWrapper}>
            <div className={styles.inputLabel}> Add author </div>
            <input 
              className={styles.input} 
              type="text" 
              onChange={this.handleChange}
              name="newAuthorFname"
              required
              value={this.state.newAuthorFname}
              placeholder="First name"
            />
            <div></div>
            <input 
            className={styles.input} 
            type="text" 
            onChange={this.handleChange}
            name="newAuthorLname"
            required
            value={this.state.newAuthorLname}
            placeholder="Last name"
            />
            <button className={styles.button} type="submit"> Add </button>
            
            </div>
          </form>

          <form onSubmit={this.handleSubmit('newCategory')}>
          <div className={styles.acpWrapper}>
            <div className={styles.inputLabel}> Add category </div>
            <input 
              className={styles.input} 
              type="text" 
              onChange={this.handleChange}
              name="newCategory"
              required
              value={this.state.newCategory}
            />
            <button className={styles.button} type="submit"> Add </button>
            
            </div>
          </form>

          <form onSubmit={this.handleSubmit('newPublisher')}>
          <div className={styles.acpWrapper}>
            <div className={styles.inputLabel}> Add publisher </div>
            <input 
              className={styles.input} 
              type="text" 
              onChange={this.handleChange}
              name="newPublisher"
              required
              value={this.state.newPublisher}
            />
            <button className={styles.button} type="submit"> Add </button>
            
            </div>
          </form>
          <div className={styles.acpInfo}> {this.state.acpInfo} </div>
        </div>

        <div className={styles.rightPane}>
          
        </div>  
      </div>
    )
  }
}

export default Collection_AddData;
