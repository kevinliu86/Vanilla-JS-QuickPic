# Vanilla JS: QuickPic

1. Background & Motivation
2. The Task (Frontend)
3. The Support (Backend)
4. Constraints & Assumptions
5. Marking Criteria
6. Originality of Work
7. Submission
8. Late Submission Policy

## 1. Background & Motivation

Web-based applications are becoming the most common way to build a digital capability accessible to a mass audience. While there are modern tools that help us build these rapidly, it's important to understand the fundamental Javascript-based technology and architectures that exist, both to gain a deeper understanding for when these skills may be needed, but also to simply understand the mechanics of fundamental JS. Even when working with a high level framework like React, understanding (in-concept) the code that is transpiled-to will ensure you're a more well rounded web-based engineer.

This assignment consists of building a **front-end** website in Vanilla JS (no React or other frameworks). This front-end will interact with a RESTFUL API HTTP back-end that is built in Python/Flask and provided to you.

Information about how to talk to this API can be found the "promises & fetch" lecture.

The page you build is required to be a single page app (SPA). Single page apps give websites an "app-like feeling", and are characterised by their use of a single full load of an initial HTML page, and then using AJAX/fetch to dynamically manipulate the DOM without ever required a full page reload. In this way, SPAs are generated, rendered, and updated using Javascript. Because SPAs don’t require a user to navigate away from a page to do anything, they retain a degree of user and application state. In short, this means you will only ever have `index.html` as your HTML page, and that any sense of "moving between pages" will just be modifications of the DOM.

## 2. The Task (Frontend)

Stub code has been provided to help you get started in:
 * `frontend/index.html`
 * `frontend/styles/provided.js`
 * `frontend/src/api.js`
 * `frontend/src/helpers.js`
 * `frontend/src/main.js`

You can modify or delete this stub code of you choose. It's simply here to potentially provide some help.

To work with your frontend code locally with the web server, you will have to run another web server to serve the frontend. To do this, in you rproject folder you can run:

`$ python3 -m http.server`

This will start up a second HTTP server where if you navigate to `http://localhost:8000` (or whatever URL it provides) it will run your `index.html`

### 2.1. Milestone 1 - Registration & Login

This focuses on the basic user interface to register and log in to the site.

#### 2.1.1. Login
 * When the user isn't logged in, the site shall present a login form that contains:
   * a username field (text)
   * a password field (password)
   * a password confirm field (password)
   * submit button to login
 * When the submit button is pressed, if the two passwords don't match the user should receive an error popup. If they do match, the form data should be sent to `POST /auth/login` to verify the credentials. If there is an error during login an appropriate error should appear on the screen.
 * Once the user is logged in, they should be able to see the feed which says "Not yet implemented"

#### 2.1.2. Registration
 * When the user isn't logged in, the login form shall provide a link/button that opens the register form. The register form will contain: 
   * a username field (text)
   * a password field (password)
   * a confirm password field (password) - not passed to backend, but error thrown on submit if doesn't match other password
   * an email address (text)
   * a name (text)
   * submit button to register
 * When the submit button is pressed, the form data should be sent to `POST /auth/signup` to verify the credentials. If there is an error during login an appropriate error should appear on the screen.
 * Once the user is logged in, they should be able to see the feed which says "Not yet implemented"

#### 2.1.3. Error Popup
 * Whenever the frontend or backend produces an error, there shall be an error popup on the screen with a message (either a message derived from the backend error rresponse, or one meaningfully created on the frontend).
 * This popup can be closed/removed/deleted by pressing an "x" or "close" button.

### 2.2. Milestone 2 - Basic Feed

Milestone 2 focuses on fetching feed data from the API.

#### 2.2.1. Basic Feed

The application should present a "feed" of user content on the home page derived `GET /user/feed`.

The posts should be displayed in reverse chronological order (most recent posts first). 

Each post should display:
1. Who the post was made by
2. When it was posted
3. The image itself
4. How many likes it has (or none)
5. The post description text
6. How many comments the post has

Although this is not a graphic design exercise you should produce pages with a common and somewhat distinctive look-and-feel. You may find CSS useful for this.

## 2.3. Milestone 3 - Advanced Feed
 
Milestone 3 focuses on a richer UX and will require some backend interaction.

### 2.3.1. Show Likes
* Allow a user to see a list of all users who have liked a post. You can just display all of them at once by default, or you can optionally (not required) toggle whether it's visible or not with a simple button.

### 2.3.2. Show Comments
* Allow a user to see all the comments on a post. You can just display all of them at once by default, or you can optionally (not required) toggle whether it's visible or not with a simple button.

### 2.3.3. Ability for you to like content
* A logged in user can like a post on their feed and trigger a api request (`PUT /post/like`)
* For now it's ok if the like doesn't show up until the page is refreshed.

### 2.3.4. Feed Pagination
* Users can page between sets of results in the feed using the position token with (`GET user/feed`).
* Note users can ignore this if they properly implement Infinite Scroll in a later milestone.

## 2.4. Milestone 4 - Other users & profiles

### 2.4.1. Profile View / Profile View
* Let a user click on a user's name from a post and see a page with the users name, and any other info the backend provides.
* The user should also see on this page all posts made by that person.
* The user should be able to see their own page as well.

### 2.4.2. Follow
* Let a user follow/unfollow another user too add/remove their posts to their feed via (`PUT user/follow`)
* Add a list of everyone a user follows in their profile page.
* Add just the count of followers / follows to everyones public user page

## 2.5. Milestone 5 - Adding & updating content

Milestone 5 focuses on more advanced features that will take time to implement and will involve a more rigourously designed app to execute.

### 2.5.1. Adding a post
* Users can upload and post new content from a modal or seperate page via (`POST /post`)

### 2.5.2. Updating & deleting  a post
* Let a user update a post they made or delete it via (`DELETE /post`) or (`PUT /post`). You are not required to allow the user to be able to update the image of a post.

### 2.5.3. Leaving comments
* Users can write comments on "posts" via (`POST post/comment`)

### 2.5.4. Updating the profile
* Users can update their personal profile via (`PUT /user`) E.g:
  * Update email address
  * Update password
  * Update name

## 2.6. Milestone 6 - Challenge Components (`advanced`)

### 2.6.1. Infinite Scroll
* Instead of pagination, users an infinitely scroll through results. For infinite scroll to be properly implemented you need to progressively load posts as you scroll. 

### 2.6.1. Live Update
* If a user likes a post or comments on a post, the posts likes and comments should update without requiring a page reload/refresh.

### 2.6.1. Push Notifications
* Users can receive push notifications when a user they follow posts an image. To know whether someone or not has made a post, you must "poll" the server (i.e. intermittent requests, maybe every second, that check the state). 

*Polling is very inefficient for browsers, but can often be used as it simplifies the technical needs on the server.*

## 2.7. Milestone 7 - Very Challenge Components (`advanced *= 2`)

### 2.7.1. Static feed offline access
* Users can access the most recent feed they've loaded even without an internet connection.
* Cache information from the latest feed in local storage in case of outages.
* When the user tries to interact with the website at all in offline mode (e.g. comment, like) they should receive errors

_No course assistance will be provided for this component, you should do your own research as to how to implement this._

### 2.7.2 Fragment based URL routing
Users can access different pages using URL fragments:
```
/#profile=me
/#feed
/#profile=janecitizen
```

_No course assistance will be provided for this component, you should do your own research as to how to implement this._

## 3. The Support (Backend) - no work required

The backend server is not part of your repository (due to it's size). However, we have put it on a publically accessible repo (so only one copy, rather than separate repos deployed to every student).

<a href="https://gitlab.cse.unsw.edu.au/COMP6080/21T1/ass2-backend">You can access the backend repository here</a>. Clone this repository onto your working machine. 

`git clone gitlab@gitlab.cse.unsw.edu.au:COMP6080/21T1/ass2-backend backend`

Once cloned, you can view the `README.md` in new repository to see how to get the server running.

The backend server will be where you'll be getting your data. Don't touch the code in the backend; although we've provided the source, it's meant to be a black box. Final testing will be done with our own backend. Use the instructions provided in the backend/README.md to get it started.

For the full docs on the API, start the backend server and navigate to the root URL in a web browser (very likely to be `localhost:5000`). You'll see all the endpoints, descriptions and expected responses.

Your backend server must be running for your frontend to interact with it. Your frontend must call the backend server on the correct port.

**Please `git pull` on the backend server at least every couple of days. We will no doubt be pushing fixes and clarifications as they arise over the first week. `git pull` before you work will give you the latest changes.**

### 3.1. Exploring the DB

If you're comfortable with basic SQL, in the `ass2-backend` folder, you can upload the `db/test.sqlite3` file to an online explorer such as (sqliteonline.com)[sqliteonline.com].

To get started, though, here are some usernames that you can have test accounts "follow":
* Andrew
* Ava
* Sarah
* Matthew
* Jack
* Harper
* Zoe
* Amelia

For example, after registering a user, you can call `PUT /user/follow` to follow one of these users. After that, if you call `GET /user/feed` you will be able to see updates on the feed.
