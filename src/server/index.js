import express from 'express'
import fs from 'fs'
import path from 'path'
import bodyParser from 'body-parser'
import request from 'request'
import rp from 'request-promise'

const app = express()
const portNum = process.env.PORT || 8080

const client_id = '' //TODO: paste your client id here
const redirect_uri = 'http://localhost:8080/fb_redirect'
const client_secret = '' //TODO: paste your client secret here
const OXFORD_KEY = '' //TODO: paste Oxford API Key here

const API_URI_INVITABLE_FRIENDS = 'https://graph.facebook.com/v2.7/me/invitable_friends'
const API_URI_OXFORD_EMOTION = 'https://api.projectoxford.ai/emotion/v1.0/recognize'
const API_URI_FB_ACCESS_TOKEN = 'https://graph.facebook.com/v2.3/oauth/access_token'
const API_URI_FB_ME = 'https://graph.facebook.com/me'

const PATH_USER = 'data/user.json'

const NUM_OF_FRIENDS = 1

// read user data from file
const getUser = () => {
  try {
    const text = fs.readFileSync(PATH_USER)
    return JSON.parse(text)
  } catch(err) {
    return {}
  }
}

app.set('views', `${__dirname}/../static`)
app.set('view engine', 'ejs')

app.use(bodyParser.urlencoded({ extended: false }))
app.use('/', express.static(path.join(__dirname, '../static/')));


/* === SECTION: 1 ===
app.get('/test', (req, res) => {
  res.send('TEST')
})
=== END OF SECTION 1 === */


/* === SECTION: 2 ===
app.get('/test/:id', (req, res) => {
  res.send(`TEST with id ${req.params.id}`)
})
=== END OF SECTION 2 === */




/* === SECTION: 3 ===
app.get('/app', (req, res) => {
  res.redirect('/index.html')
})
=== END OF SECTION 3 === */




/* === SECTION: 7 ===
app.get('/logout', (req, res) => {
  const user = getUser()
  const options = {
    method: 'DELETE',
    uri: 'https://graph.facebook.com/me/permissions',
    qs: {
      access_token: user.accessToken
    }
  }

  // DELETE /me/permissions
  // host: graph.facebook.com
  rp(options)
    .finally(() => {
      // Write empty object to file
      fs.writeFile(PATH_USER, '{}', (err) => {
        if (err) throw err
      })
    })

  res.redirect('/index.html')
})
=== END OF SECTION 7 === */



/* === SECTION: 5 ===
// GET /get_profile
app.get('/get_profile', (req, res) => {
  const user = getUser()
  res.setHeader('Content-Type', 'application/json')
  res.send(user)
})
=== END OF SECTION 5 === */



/* === SECTION: 6 ===
// GET /get_friends
app.get('/get_friends', (req, res) => {
  const user = getUser()
  if (!user.name) {
    res.sendStatus(401)
    return
  }

  const invitableFriendsFields = {
    limit: NUM_OF_FRIENDS,
    fields: 'picture.type(large),name',
    access_token: user.accessToken
  }
  const invitableFriendsOptions = {
    uri: API_URI_INVITABLE_FRIENDS,
    qs: invitableFriendsFields 
  }

  let rankedFriends = []

  // GET /v2.7/me/invitable_friends
  // host: graph.facebook.com
  rp(invitableFriendsOptions)
    .then((friendsStr) => {
      const friends = JSON.parse(friendsStr)
      return friends.data
    
    // for every friend, request emotions from project oxford
    }).map((friend) => {
      const oxfordBody = {
        url: friend.picture.data.url
      }
      const oxfordOptions = {
        method: 'POST',
        uri: API_URI_OXFORD_EMOTION,
        headers: {
          'Ocp-Apim-Subscription-Key': OXFORD_KEY
        },
        body: oxfordBody,
        json: true
      }

      // POST /emotion/v1.0/recognize
      // host: api.projectoxford.ai
      return rp(oxfordOptions)
        .then((ratings) => {
          friend.happiness = ratings[0] ? ratings[0].scores.happiness : -1
          friend.name = friend.name.split(' ')[0]
          rankedFriends.push(friend)
        })
    }).finally(() => {
      res.send(rankedFriends)
    })
})
=== END OF SECTION 6 === */



/* === SECTION: 4 ===
// GET /fb_redirect
app.get('/fb_redirect', (req, res) => {
  const code = req.query.code
  const accessTokenFields = {
    client_id,
    redirect_uri,
    client_secret,
    code
  }

  const accessTokenOptions = {
    uri: API_URI_FB_ACCESS_TOKEN,
    qs: accessTokenFields
  }

  // GET /v2.3/oauth/access_token
  // host: graph.facebook.com
  rp(accessTokenOptions)
    .then((accessTokenJson) => {
      const accessToken = JSON.parse(accessTokenJson)
      const accessTokenStr = accessToken.access_token
      const meFields = {
        access_token: accessTokenStr
      }
      const meOptions = {
        uri: API_URI_FB_ME,
        qs: meFields
      }

      return [rp(meOptions), accessTokenStr]
    }).spread((userJson, accessToken) => {
      const user = JSON.parse(userJson)
      const name = user.name
      const userID = user.id
      const userObj = {
        name,
        userID,
        accessToken
      }

      fs.writeFile(PATH_USER, JSON.stringify(userObj), (err) => {
        if (err) throw err
      })
    }).finally(() => {
      res.redirect('/index.html')
    })
})
=== END OF SECTION 4 === */

app.listen(portNum, () => {
  if (!process.env.PORT) {
    console.log(`Serving port number ${portNum}`)
  }
})
