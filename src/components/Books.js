import axios from 'axios';
import React from 'react';
import styles from './styles/books.module.css';
import More from './More';
import Select from 'react-select';

import NumericInput from 'react-numeric-input';

class Books extends React.Component{
  constructor(){
    super();
    this.state = {
      isLoading: true,
      loadingInfo: "Loading...",
      authors: [],
      categories: [],
      publishers: [],
      books: [],
      numberOfPages: null,
      isMoreVisible: false,
      selectedBook: [],
      // Filters
      titleFilter: "",
      categoryFilter: "",
      authorFilter: "",
      publisherFilter: "",
      pageFilter: 1,

      titleFilterSet: "",
      categoryFilterSet: "",
      authorFilterSet: "",
      publisherFilterSet: "",
      pageFilterSet: 1
    }
    // Bindings
    this.refreshToken = this.refreshToken.bind(this);
    this.handleFilter = this.handleFilter.bind(this);
    this.filter = this.filter.bind(this);
    this.fetchInitialData = this.fetchInitialData.bind(this);
    this.handleSelectChange = this.handleSelectChange.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleMore = this.handleMore.bind(this);
    this.closeMore = this.closeMore.bind(this);
    this.changePage = this.changePage.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.pageFormat = this.pageFormat.bind(this);
    this.eraseFilter = this.eraseFilter.bind(this);
  }

  refreshToken(){
    var refresh_token = localStorage.getItem("refresh_token");
    axios.get("https://g20.labagh.pl/api/refresh", {
      headers: {
        'Authorization': `Bearer ${refresh_token}`
      }
    }).then(function(response){
      localStorage.setItem("token", response.data.access_token);
    }.bind(this)).catch((err) =>{
      console.log(err);
    })
  }
  componentDidMount(){
    this.fetchInitialData();
  }
  fetchInitialData(){
    const token = localStorage.getItem("token");
    const header = {headers: {'Authorization': `Bearer ${token}`}};
    const url = "https://g20.labagh.pl/api/get_ACP";
    
    // Get ACP data (authors, categories, publishers)
    axios.get(url, header)
     .then(function(response){
      //Get ACP data to filter selectors
      var tmp_authors = [];
      var tmp_categories = [];
      var tmp_publishers = [];

      response.data.authors.map((author) =>{
        tmp_authors.push({"value": author[0], "label": author[1] + " " + author[2]})
      });
      response.data.categories.map((category) =>{
        tmp_categories.push({"value": category[0], "label": category[1]})
      });
      response.data.publishers.map((publisher) =>{
        tmp_publishers.push({"value": publisher[0], "label": publisher[1]})
      });
      tmp_authors.push({"value": "", "label": "Any"})
      tmp_categories.push({"value": "", "label": "Any"})
      tmp_publishers.push({"value": "", "label": "Any"})

      
      this.setState({
        authors: tmp_authors,
        categories: tmp_categories,
        publishers: tmp_publishers
      })
     }.bind(this))
     .catch(function(err){
       if(err.response.status === 422 || err.response.status === 401){
         this.refreshToken();
         this.fetchInitialData();
       }
     }.bind(this))


     // Get books data
     const url_books = "https://g20.labagh.pl/api/get_books";
     axios.get(url_books, header)
     .then(function(response){
      console.log(response.data);
      var tmp_books = [];
      response.data.slice(1).map((book) =>{
        tmp_books.push({
          id: book[0],
          amount: book[1],
          title: book[2],
          year: book[3],
          author: book[4]+" "+book[5],
          publisher: book[6],
          category: book[7]
        })
      })
      this.setState({
        books: tmp_books,
        numberOfPages: response.data[0][0],
        isLoading: false
      });
     }.bind(this))
     .catch(function(err){
      
     }.bind(this))
  }

  handleInputChange(e){
    this.setState({
      [e.target.name]: e.target.value
    })
  }
  handleSelectChange(selectedOption, {name}){
    console.log(selectedOption.value);
    console.log(name);
    this.setState({
      [name]: selectedOption
    });
  }

  handleFilter(e){
    e.preventDefault();
    this.setState({
      pageFilter: 1,
      isLoading: true,
      loadingInfo: "Loading...",

      titleFilterSet: this.state.titleFilter,
      categoryFilterSet: this.state.categoryFilter.value,
      authorFilterSet: this.state.authorFilter.value,
      publisherFilterSet: this.state.publisherFilter.value,
      pageFilterSet: this.state.pageFilter.value
    }, () =>{
      this.filter();
    })
  }
  filter(){
    const token = localStorage.getItem("token");
    const header = {headers: {'Authorization': `Bearer ${token}`}};
    const url = "https://g20.labagh.pl/api/get_books_filter";
    const data = {
      title: this.state.titleFilterSet,
      author_id: this.state.authorFilterSet,
      category_id: this.state.categoryFilterSet,
      publisher_id: this.state.publisherFilterSet,
      page: this.state.pageFilter
    }
    axios.post(url, data, header)
    .then(function(response){
      console.log(response.data);
      // Check if response.data is empty
      if(response.data.pages===0){
        const epmty_books = []
        this.setState({
          books: epmty_books,
          isLoading: true,
          loadingInfo: "No matches"
        });
        return 0;
      }
      var tmp_books = [];
      response.data.filtered_books.map((book) =>{
        tmp_books.push({
          id: book[0],
          amount: book[1],
          title: book[2],
          year: book[3],
          author: book[4]+" "+book[5],
          publisher: book[6],
          category: book[7]
        })
      })
      this.setState({
        books: tmp_books,
        isLoading: false,
        numberOfPages: response.data.pages
      });
    }.bind(this))
    .catch(function(err){
      console.log(err);
      if(err.response.status === 422 || err.response.status === 401){
        this.refreshToken();
        this.filter();
      }
    }.bind(this));
  }
  handleMore(e){
    console.log("Showing more ");
    this.setState({isMoreVisible: true});
    // Define selected book to display in "More" component
    this.state.books.map((book)=>{
      // "==" below is the proper way despite the fact that compiler expects "==="
      if(book.id == e.target.getAttribute('name')){
        console.log("Found");
        this.setState({selectedBook: book});
      }
    })
  }
  // Function below will be executed inside More component to close itself
  closeMore(){
    console.log("Closing more");
    this.setState({isMoreVisible: false});
  }

  changePage(e){
    if(e.target.getAttribute("name") === "prev" && this.state.pageFilter>1){
      this.setState({
        pageFilter: this.state.pageFilter - 1
      }, ()=>{this.filter()});
    }
    else if(e.target.getAttribute("name") === "next" && this.state.pageFilter<this.state.numberOfPages){
      this.setState({
        pageFilter: this.state.pageFilter + 1
      }, ()=>{this.filter()});
    }
  }
  handleChange(selectedValue){
    if(selectedValue<1){
      this.setState({
        pageFilter: this.state.pageFilter
      })
    }
    else if(selectedValue>this.state.numberOfPages){
      this.setState({
        pageFilterSet: this.state.pageFilter
      });
    }
    else{
      this.setState({
        pageFilter: selectedValue
      }, () =>{
        this.filter();
      });
    }
  }
  pageFormat(page){
    return page+"/"+this.state.numberOfPages
  }

  eraseFilter(e){
    console.log(this.state.titleFilter);
    console.log(this.state.categoryFilter);
    this.setState({
      [e.target.getAttribute("name")]: ""
    });
    
  }

  render(){ 
    var colorIndex = 0;
    return(
      <div>
        <div className={styles.optionsPane}> 
          <div className={styles.optionsTitle}> Options </div>
          <form onSubmit={this.handleFilter}>
          <div className={styles.filtersContainer}>
              <div>
                <div className={styles.label}> Filter by title </div>
                <div className={styles.inputWrapper}>
                  <input
                    className={styles.input}
                    value={this.state.titleFilter}
                    onChange={this.handleInputChange}
                    name="titleFilter"
                    value={this.state.titleFilter}
                  />
                  <div className={styles.eraseFilter} onClick={this.eraseFilter} name="titleFilter"></div>
                </div>
              </div>
              
              <div>
                <div className={styles.label}> Filter by author </div>
                <div className={styles.inputWrapper}>
                  <Select
                  className={styles.select}
                  options={this.state.authors}
                  maxMenuHeight={150}
                  onChange={this.handleSelectChange}
                  name="authorFilter"
                  value={this.state.authorFilter}
                  />
                  <div className={styles.eraseFilter} onClick={this.eraseFilter} name="authorFilter"></div>
                </div>
              </div>

              <div>
                <div className={styles.label} > Filter by category </div>
                <div className={styles.inputWrapper}>
                  <Select 
                    className={styles.select}
                    options={this.state.categories}
                    maxMenuHeight={150}
                    onChange={this.handleSelectChange}
                    name="categoryFilter"
                    value={this.state.categoryFilter}
                  />
                  <div className={styles.eraseFilter} onClick={this.eraseFilter} name="categoryFilter"></div>
                </div>
              </div>

              <div>
                <div className={styles.label} > Filter by Publisher </div>
                <div className={styles.inputWrapper}>
                  <Select 
                    className={styles.select}
                    options={this.state.publishers}
                    maxMenuHeight={150}
                    onChange={this.handleSelectChange} 
                    name="publisherFilter"
                    value={this.state.publisherFilter}
                  />
                  <div className={styles.eraseFilter} onClick={this.eraseFilter} name="publisherFilter"></div>
                </div>
              </div>
              <button className={styles.filterButton}> Filter </button>
          </div>
          </form>
        </div>
        
        {!this.state.isLoading ? 
        <div className={styles.wrapper}>
        <div className={styles.displayPane}>
          <table className={styles.table}>
          <tbody>
              <tr className={styles.tableTitleBar}>
                <th> Title </th>
                <th> Author </th>
                <th > Category </th>
                <th > Avaiable </th>
                <th > More </th>
              </tr>
              {this.state.books.map((book) => {
              const style = colorIndex%2===0 ? {backgroundColor: "rgb(120, 121, 122)"} : {backgroundColor: "rgb(144, 145, 145)"}
              colorIndex += 1;
              return  <tr style={style}> 
                        <td > {book.title} </td>
                        <td > {book.author} </td>
                        <td > {book.category} </td>
                        <td > {book.amount} </td>
                        <td ><button className={styles.moreButton} onClick={this.handleMore} name={book.id}> More </button></td>
                      </tr>
              })}
          </tbody>
          </table>
          
        </div>
        <div className={styles.paginator}>
          <div className={styles.pageNavbar}>
            <div className={styles.prev} name="prev" onClick={this.changePage}></div>
            <NumericInput 
              min={1}
              max={this.state.numberOfPages}
              value={this.state.pageFilter}
              style={false}
              className={styles.pageInput}
              onChange={this.handleChange}
              format={this.pageFormat}
            />
            <div className={styles.next} name="next" onClick={this.changePage}></div>
          </div>
        </div>
        </div> : <div className={styles.loading}> {this.state.loadingInfo} </div>}
        {this.state.isMoreVisible ? <More {... this.state} closeMore={this.closeMore} fetchDataFromAPI={this.filter} refreshToken={this.refreshToken}/> : null}
      </div>
    )
  }
}

export default Books;