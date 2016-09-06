import React from 'react'
import request from 'superagent-bluebird-promise'

const API_URI_FB_OAUTH = 'https://www.facebook.com/dialog/oauth'
const CLIENT_ID = ''
const REDIRECT_URI = 'http://localhost:8080/fb_redirect'
const SCOPE = 'user_friends'
const URI_FB_SIGN_IN = `${API_URI_FB_OAUTH}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=${SCOPE}`

export default React.createClass({
  getInitialState() {
    return {
      users: [],
      name: null
    }
  },
  componentDidMount() {
    request.get('/get_profile')
      .then((res) => {
        console.log(res)
        const user = JSON.parse(res.text)
        this.setState({
          name: user.name
        })
        return request.get('/get_friends')
      }, (err) => {
        console.log(err)
      }).then((res) => {
        console.log(res)
        const users = JSON.parse(res.text)
        users.sort(this.compareFriends)
        this.setState({
          users
        })
      }, (err) => {
        console.log(err)
      })
  },
  compareFriends(a, b) {
    let happiness_1 = a.happiness ? a.happiness : -1
    let happiness_2 = b.happiness ? b.happiness : -1
    return happiness_2 - happiness_1
  },
  render() {
    return (
      <div className="padding-tb-md">
        {this.state.name ? 
          <div>
            <h1>Hi, {this.state.name}</h1>
            <h2>Who is your happiest friend?</h2>
            <a href='/logout'><button className="btn btn-primary">Logout</button></a>
          </div>
        :
          <div className="text-center">
            <a href={URI_FB_SIGN_IN}><button className="btn btn-primary">Sign in to Facebook!</button></a>
          </div>
        }
        <div className="container-fluid">
          {this.state.users.map((user) => {
             return ( 
              <div className="max-width-md align-center" key={user.id}>
                <img src={user.picture.data.url} />
                <div>
                  <p>Name: {user.name}</p>
                  <p>Happiness: {user.happiness}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    );
  }
});
