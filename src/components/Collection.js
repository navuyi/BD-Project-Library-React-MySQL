import React from 'react';
import axios from 'axios';

import Collection_AddData from './Collection_AddData';
import Collection_AddBooks from './Collection_AddBooks';
class Collection extends React.Component{
  constructor(){
    super();
    this.state =  {
   
    };
    // Bindings
    this.refreshToken = this.refreshToken.bind(this);
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
  render(){
    return(
      <div>
        <Collection_AddData refreshToken={this.refreshToken}/>
        <Collection_AddBooks refreshToken={this.refreshToken} />
      </div>
    )
  }
}

export default Collection;
