import React, { Component } from 'react';
import axios from 'axios';
import { BrowserRouter, Route, Switch } from 'react-router-dom'
import { Redirect } from 'react-router-dom'
import './App.css';
import apiKey from './config';


export default class App extends Component {

  constructor() {
    super();

    let queryString = window.location.search;
    queryString = queryString.replace("?search=", "");

    this.state = {
      gifs: null,
      query: queryString
    };

  }

  componentDidMount() {

    // Code belows fetches required images data from Flickr API
    let url;
    if (!this.state.query || this.state.query === "") {

      url = 'https://cors-anywhere.herokuapp.com/https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=' + apiKey + '&tags=Nature&tag_mode=all&format=json&per_page=24';

    } else {

      url = 'https://cors-anywhere.herokuapp.com/https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=' + apiKey + '&tags=' + this.state.query + '&tag_mode=all&format=json&per_page=24';

    }

    axios.get(url, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      mode: 'no-cors',
      credentials: 'include'
    })
      .then((response) => {

        let responseData = response.data;
        responseData = responseData.replace("jsonFlickrApi", "");
        responseData = responseData.substring(1, responseData.length - 1)
        responseData = JSON.parse(responseData);
        responseData = responseData.photos.photo;

        return responseData;
      })
      .then(responseData => {

        this.setState({ gifs: responseData });

      })

      .catch((err) => {
      })

  }

  // Redirect users to not found component if image results cannot be found
  renderRedirect = () => {
    if (this.state.gifs.length === 0) {
      return <Redirect to='/notFound' />
    }
  }

  render() {

    // Returns loading indicator while the images data are being fetched from the flickr api asynchronously
    if (!this.state.gifs) {
      return <div>Please Wait...We are finding your images.</div>
    }

    return (
      <BrowserRouter>

        {this.renderRedirect()}
        <div className="container">
          <form className="search-form" action='/photo'>
            <input type="search" name="search" placeholder="Search" required />
            <button type="submit" className="search-button">
              <svg fill="#fff" height="24" viewBox="0 0 23 23" width="24" xmlns="http://www.w3.org/2000/svg">
                <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
                <path d="M0 0h24v24H0z" fill="none" />
              </svg>
            </button>
          </form>

          <nav className="main-nav">
            <ul>

              <Nav key="defaultSelect1" name="Nature" path='/photo/?search=Nature' />
              <Nav key="defaultSelect2" name="Industry" path='/photo/?search=Industry' />
              <Nav key="defaultSelect3" name="Space" path='/photo/?search=Space' />

            </ul>
          </nav>

          <div className="photo-container">
            <h2>{this.state.query}</h2>
            <ul>
              <Switch>

                <Route exact path='/' render={() => <Photo ImagePath={this.state.gifs} />} />
                <Route exact path='/photo' render={() => <Photo ImagePath={this.state.gifs} />} />
                <Route exact path='/notFound' component={NotFound} />
                <Route component={InvalidURL} />


              </Switch>

            </ul>
          </div>

        </div>
      </BrowserRouter>
    );
  }
}

// Component to display images data
function Photo(props) {

  return props.ImagePath.map(function (each) {
    return (<li key={each.id}>
      <img src={"https://farm" + each.farm + ".staticflickr.com/" + each.server + "/" + each.id + "_" + each.secret + ".jpg"} alt="" />
    </li>)
  })

}

// Component to display default selections
function Nav(props) {

  return (

    <li><a href={props.path}>{props.name}</a></li>

  )
}

// Component to display message when user search result is not found
function NotFound() {

  return (

    <li className="not-found">
      <h3>Opps we can't find what you are looking for</h3>
      <p>Please try again</p>
    </li>

  )
}

// Component to display error message when user entered an invalid URL
function InvalidURL() {

  return (

    <li className="not-found">
      <h3>404 Error</h3>
      <p>Sorry! Page not found.</p>
    </li>

  )
}
