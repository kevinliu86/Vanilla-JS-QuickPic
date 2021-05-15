import API from "./api.js";
// A helper you may want to use when uploading new images to the server.
import { fileToDataUrl } from "./helpers.js";

/********************************************************/
// localStorage
// 1.'token'
// 2.'userID'
// 3."username"
/********************************************************/
let feedPage = 0;
let liveUpdate;

/**********************************************************/
/*               2.1.3   Error Popup                      */
/**********************************************************/
const displayErrorModal = (info) => {
  const errorModal = document.getElementById("error-modal");
  const textInErrorModal = document.getElementById("error-modal-text");
  const errorX = document.getElementById("error-modal-x");
  textInErrorModal.innerText = info;
  errorModal.style.display = "block";
  activeModalClose(errorModal, errorX);
};

const activeModalClose = (modal, x) => {
  x.addEventListener("click", () => {
    modal.style.display = "none";
  });
};

//show profile page hide dashboard
const showProfile = () => {
  document.getElementById("feed-page").style.display = "none";
  document.getElementById("profile-page").style.display = "block";
};
//hide & clear profile page refresh feed page by getFeed()
const hideProfile = () => {
  window.addEventListener("scroll", infiniteHandler);
  document.getElementById("new-post-button").style.display = "inline";
  document.getElementById("stop-liveupdate").style.display = "inline";
  getFeed();
  document.getElementById("feed-page").style.display = "flex";
  document.getElementById("profile-page").style.display = "none";
  document.getElementById("profile-items").innerText = "";
};
//show dashboard after login success
const showFeed = () => {
  window.addEventListener("scroll", infiniteHandler);
  // 2 storage user info to local storage
  getUserInfo("", 2);
  //hide login & register display feed
  document.getElementById("login-page").style.display = "none";
  document.getElementById("register-page").style.display = "none";
  getFeed();
  document.getElementById("feed-page").style.display = "flex";
  //display create New post Follow and logout buttons
  document.getElementById("buttons").style.display = "inline";
};
//hide dashboard
const hideFeed = () => {
  document.getElementById("feed-page").style.display = "none";
};

const showRegister = () => {
  document.getElementById("login-page").style.display = "none";
  document.getElementById("register-page").style.display = "flex";
};
const showLogin = () => {
  document.getElementById("register-page").style.display = "none";
  document.getElementById("login-page").style.display = "flex";
};

const showCreatePost = () => {
  document.getElementById("new-post-page").style.display = "flex";
  document.getElementById("buttons").style.display = "none";
};

/**********************************************************/
/*       create New element with key value                */
/**********************************************************/
const createNewElement = (parentElement, key, value) => {
  const detail = document.createElement("div");
  detail.innerText = key + value;
  parentElement.appendChild(detail);
};

/**********************************************************/
/*                 create like DIV in post                */
/**********************************************************/
const createLikeElements = (parentElement, likes, postId) => {
  //create likes main div
  const likesElement = document.createElement("div");
  //likes count
  createNewElement(likesElement, "", likes.length + " likes.");
  //show likes button
  const showLikes = document.createElement("button");
  showLikes.innerText = "Show likes";
  likesElement.appendChild(showLikes);

  //like button 2.3.3 Ability for you to like content
  const likeButton = document.createElement("button");
  likeButton.innerText = "Like this post";
  likeButton.value = postId;
  likesElement.appendChild(likeButton);

  /****************************************/
  /*2.3.3 Ability for you to like content */
  /****************************************/

  likeButton.addEventListener("click", () => {
    // console.log(likeButton.value);
    const result = fetch(
      "http://localhost:5000/post/like?id=" + likeButton.value,
      {
        method: "PUT",
        headers: {
          //fetch javascript add json body
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: "Token " + localStorage.getItem("token"),
        },
        //convert to JSON form
      }
    ).then((fetchResult) => {
      // console.log(fetchResult);
      if (fetchResult.status === 404) {
        displayErrorModal("Page Not Found");
      } else if (fetchResult.status === 403) {
        displayErrorModal("Invalid Auth Token");
      } else if (fetchResult.status === 400) {
        displayErrorModal("Malformed Request");
      } else if (fetchResult.status === 200) {
        displayErrorModal("Like success");
      }
    });
  });

  /**********************************************************/
  /*                       2.3.1 Show Likes                 */
  /**********************************************************/

  const likesNameDiv = document.createElement("div");
  likesNameDiv.setAttribute("id", "likeNameDiv");
  likesNameDiv.style.display = "none";

  likesElement.appendChild(likesNameDiv);
  //   postBox.appendChild(likesElement);
  //add button eventlistener
  showLikes.addEventListener("click", () => {
    //create name display div

    //get like names
    if (likesNameDiv.style.display === "none") {
      likesNameDiv.innerText = "";
      likes.map((likeid) => {
        fetch("http://localhost:5000/user/?id=" + likeid, {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: "Token " + localStorage.getItem("token"),
          },
        }).then((likeName) => {
          if (likeName.status === 403) {
            displayErrorModal("Invalid Auth Tokens-/user/");
          } else if (likeName.status === 400) {
            displayErrorModal("Nalformed Request-/user/");
          } else if (likeName.status === 404) {
            displayErrorModal("User Not Found-/user/");
          } else if (likeName.status === 200) {
            likeName.json().then((likeNameJson) => {
              const nameDiv = document.createElement("div");
              //show like list
              nameDiv.innerText = likeNameJson.name + " likes this post.";

              likesNameDiv.appendChild(nameDiv);

              likesNameDiv.style.display = "block";
              showLikes.innerText = "Hide likes";
            });
          }
        });
      });
    } else if (likesNameDiv.style.display === "block") {
      likesNameDiv.style.display = "none";
      showLikes.innerText = "Show likes";
    }
  });

  parentElement.appendChild(likesElement);
};

/**********************************************************/
/*        2.3.2 create comments DIV in post               */
/**********************************************************/
const createCommentsElements = (parentElement, comments, postId) => {
  //create likes main div
  const commentsElement = document.createElement("div");
  //comments count
  createNewElement(commentsElement, comments.length, " comments.");
  //show comments button
  const showComments = document.createElement("button");
  showComments.innerText = "Show comments";
  commentsElement.appendChild(showComments);
  /**********************************************************/
  /*                    2.5.3 Leaving comments              */
  /**********************************************************/
  const addNewComments = document.createElement("button");
  addNewComments.innerText = "Write comment";
  commentsElement.appendChild(addNewComments);
  //create new comments DIV
  const newCommentsDiv = document.createElement("div");
  newCommentsDiv.style.display = "none";
  const newCommentsInput = document.createElement("input");
  newCommentsInput.setAttribute("type", "text");
  const newCommentsSubmit = document.createElement("button");
  newCommentsSubmit.innerText = "Submit Comment";
  newCommentsDiv.appendChild(newCommentsInput);
  newCommentsDiv.appendChild(newCommentsSubmit);
  commentsElement.appendChild(newCommentsDiv);
  //show Input of add new comments
  addNewComments.addEventListener("click", () => {
    if (newCommentsDiv.style.display === "none") {
      newCommentsDiv.style.display = "block";
      addNewComments.innerText = "Hide write comment";
    } else {
      newCommentsDiv.style.display = "none";
      addNewComments.innerText = "Write comment";
    }
  });
  //submit new comment
  newCommentsSubmit.addEventListener("click", () => {
    const postCommentBody = {
      comment: newCommentsInput.value,
    };
    fetch("http://localhost:5000/post/comment?id=" + postId, {
      method: "PUT",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: "Token " + localStorage.getItem("token"),
      },
      body: JSON.stringify(postCommentBody),
      //convert to JSON form
    }).then((fetchResult) => {
      if (fetchResult.status === 400) {
        displayErrorModal("Malformed Request");
      } else if (fetchResult.status === 403) {
        displayErrorModal("Invalid Auth Token");
      } else if (fetchResult.status === 404) {
        displayErrorModal("Post Not Found");
      } else if (fetchResult.status === 200) {
        displayErrorModal("Comment Success!");
      }
    });
  });
  /**********************************************************/
  /*                     2.3.2 Show comments                */
  /**********************************************************/
  const showCommentsDiv = document.createElement("div");
  showCommentsDiv.setAttribute("id", "show-comments-div");
  showCommentsDiv.style.display = "none";
  commentsElement.appendChild(showCommentsDiv);

  showComments.addEventListener("click", () => {
    if (showCommentsDiv.style.display === "none") {
      showCommentsDiv.innerText = "";
      comments.map((comment) => {
        const commentDiv = document.createElement("div");
        commentDiv.className = "feedItem";

        //coment cotent
        const commentContent = document.createElement("div");
        commentContent.innerText = comment.comment;
        commentDiv.appendChild(commentContent);

        //Author
        const commentAuthor = document.createElement("div");
        commentAuthor.innerText = "Author: " + comment.author;
        commentDiv.appendChild(commentAuthor);

        //Published Time
        const commentTime = document.createElement("div");
        commentTime.innerText = "Time: " + timeConvert(comment.published);
        commentDiv.appendChild(commentTime);

        showCommentsDiv.appendChild(commentDiv);
        showCommentsDiv.style.display = "block";
        showComments.innerText = "Hide comments";
      });
    } else if (showCommentsDiv.style.display === "block") {
      showCommentsDiv.style.display = "none";
      showComments.innerText = "Show comments";
    }
  });

  parentElement.appendChild(commentsElement);
};

/**********************************************************/
/*                    Create new post                     */
/**********************************************************/
const createNewPost = (
  parentElement,
  description,
  author,
  time,
  likes,
  comments,
  image,
  postId
) => {
  const postDiv = document.createElement("div");
  postDiv.className = "feedItem";
  //img
  const imageDiv = document.createElement("div");
  //   const imageItem = new Image();
  //   imageItem.src = "data:image/gif;base64," + image;
  let imageItem = document.createElement("img");
  imageItem.className = "feedImage";
  imageItem.src = "data:image/png;base64," + image;
  imageDiv.appendChild(imageItem);
  postDiv.appendChild(imageDiv);
  //description
  createNewElement(postDiv, "", description);

  //Author
  const authorElement = document.createElement("div");
  authorElement.classList.add("author");
  authorElement.innerText = "Author: " + author;
  authorElement.addEventListener("click", () => {
    getUserInfo(author, 1);
  });
  postDiv.appendChild(authorElement);

  //   likes
  createLikeElements(postDiv, likes, postId);
  //comments
  createCommentsElements(postDiv, comments, postId);
  createNewElement(postDiv, "", comments.length + " comments.");
  //Time
  createNewElement(postDiv, "Time: ", time);
  parentElement.appendChild(postDiv);
  /**********************************************************/
  /*           2.5.2  Updating & deleting  a post           */
  /**********************************************************/
  if (author === localStorage.getItem("username")) {
    //Delete
    const deletePost = document.createElement("button");
    deletePost.innerText = "DELETE";
    deletePost.addEventListener("click", () => {
      fetch("http://localhost:5000/post/?id=" + postId, {
        method: "DELETE",
        headers: {
          //fetch javascript add json body
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: "Token " + localStorage.getItem("token"),
        },
      }).then((fetchResult) => {
        if (fetchResult.status === 400) {
          displayErrorModal("Malformed Request");
        } else if (fetchResult.status === 403) {
          displayErrorModal("Invalid Auth Token");
        } else if (fetchResult.status === 404) {
          displayErrorModal("Post Not Found");
        } else if (fetchResult.status === 200) {
          displayErrorModal("Delete Success!");
        }
      });
    });
    postDiv.appendChild(deletePost);
    //Edit
    const updatePost = document.createElement("button");
    updatePost.innerText = "EDIT";
    postDiv.appendChild(updatePost);
    const updateDiv = document.createElement("div");
    updateDiv.style.display = "none";
    postDiv.appendChild(updateDiv);
    const updateInput = document.createElement("input");
    updateInput.setAttribute("type", "text");
    updateInput.setAttribute("value", description);
    updateDiv.appendChild(updateInput);

    const updateSubmit = document.createElement("button");
    updateSubmit.innerText = "Submit update";
    updateDiv.appendChild(updateSubmit);
    updateSubmit.addEventListener("click", () => {
      if (updateInput.value === description) {
        displayErrorModal("The new description is same as the old post.");
      } else {
        const updatePostBody = {
          description_text: updateInput.value,
          src: image,
        };
        fetch("http://localhost:5000/post/?id=" + postId, {
          method: "PUT",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: "Token " + localStorage.getItem("token"),
          },
          body: JSON.stringify(updatePostBody),
          //convert to JSON form
        }).then((fetchResult) => {
          if (fetchResult.status === 400) {
            displayErrorModal("Malformed Request");
          } else if (fetchResult.status === 403) {
            displayErrorModal("Invalid Auth Token/ Unauthorized to edit Post");
          } else if (fetchResult.status === 404) {
            displayErrorModal("Post Not Found");
          } else if (fetchResult.status === 200) {
            displayErrorModal("Update Success!");
          }
        });
      }
    });
    //update listener
    updatePost.addEventListener("click", () => {
      if (updateDiv.style.display === "none") {
        updateDiv.style.display = "block";
        updatePost.innerText = "Close EDIT";
      } else {
        updateDiv.style.display = "none";
        updatePost.innerText = "EDIT";
      }
    });
  }
};

/*************************************************************************************/
/*           2.4.1      Show user profile                                            */
/* Input :userInfo Obj return from http://localhost:5000/user/?username="+username,  */
/* Output: All profile page (details + all posts by this person)                     */
/*************************************************************************************/

const showUserProfile = (userInfo) => {
  window.removeEventListener("scroll", infiniteHandler);
  //
  document.getElementById("new-post-button").style.display = "none";
  document.getElementById("stop-liveupdate").style.display = "none";
  const profileItems = document.getElementById("profile-items");
  /**********************************************************/
  /*              2.5.4 Updating the profile                */
  /**********************************************************/
  if (userInfo.username === localStorage.username) {
    const updateProfile = document.getElementById("update-profile");
    updateProfile.style.display = "block";
    updateProfile.addEventListener("click", () => {
      document.getElementById("updating-profile-page").style.display = "flex";
      document.getElementById("profile-page").style.display = "none";
      document
        .getElementById("update-email")
        .setAttribute("placeholder", userInfo.email);
      document
        .getElementById("update-password")
        .setAttribute("placeholder", "New password");
      document
        .getElementById("update-name")
        .setAttribute("placeholder", userInfo.name);
    });
    document.getElementById("back-profile").addEventListener("click", () => {
      document.getElementById("updating-profile-page").style.display = "none";
      document.getElementById("profile-page").style.display = "block";
    });
  }
  createNewElement(profileItems, "username: ", userInfo.username);
  createNewElement(profileItems, "name: ", userInfo.name);
  createNewElement(profileItems, "email: ", userInfo.email);
  createNewElement(
    profileItems,
    "",
    userInfo.followed_num + " follow " + userInfo.username + "."
  );

  //show following  login user == profile user show following and unfollow button
  if (userInfo.username === localStorage.username) {
    const followingDiv = document.createElement("div");
    followingDiv.classList.add("following");
    profileItems.appendChild(followingDiv);
    userInfo.following.map((followingId) => {
      fetch("http://localhost:5000/user/?id=" + followingId, {
        method: "GET",
        headers: {
          //fetch javascript add json body
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: "Token " + localStorage.getItem("token"),
        },
      }).then((fetchResult) => {
        if (fetchResult.status === 403) {
          displayErrorModal("Invalid Auth Tokens-/user/");
        } else if (fetchResult.status === 400) {
          displayErrorModal("Nalformed Request-/user/");
        } else if (fetchResult.status === 404) {
          displayErrorModal("User Not Found-/user/");
        } else if (fetchResult.status === 200) {
          fetchResult.json().then((name) => {
            //createNewElement(followingDiv,userInfo.username +" following ",name.username);
            const followingItem = document.createElement("div");
            followingItem.innerText =
              userInfo.username + " following " + name.username;
            followingDiv.appendChild(followingItem);

            const unfollowButton = document.createElement("button");
            unfollowButton.innerText = "Unfollow";
            followingItem.appendChild(unfollowButton);
            unfollowButton.addEventListener("click", () => {
              fetch(
                "http://localhost:5000/user/unfollow?username=" + name.username,
                {
                  method: "PUT",
                  headers: {
                    //fetch javascript add json body
                    Accept: "application/json",
                    "Content-Type": "application/json",
                    Authorization: "Token " + localStorage.getItem("token"),
                  },
                  //convert to JSON form
                }
              ).then((fetchResult) => {
                if (fetchResult.status === 400) {
                  displayErrorModal("Malformed Request");
                } else if (fetchResult.status === 403) {
                  displayErrorModal("Invalid Auth Token");
                } else if (fetchResult.status === 200) {
                  // console.log("unfollow success");
                  displayErrorModal("Unfollow success");
                }
              });
            });
          });
        }
      });
    });
  }

  //show All posts made by this person
  const postsDiv = document.createElement("div");
  profileItems.appendChild(postsDiv);

  userInfo.posts.map((postid) => {
    const result = fetch("http://localhost:5000/post/?id=" + postid, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: "Token " + localStorage.getItem("token"),
      },
    }).then((fetchResult) => {
      if (fetchResult.status === 400) {
        displayErrorModal("Malformed Request");
      } else if (fetchResult.status === 403) {
        displayErrorModal("Invalid Auth Token");
      } else if (fetchResult.status === 404) {
        displayErrorModal("Post Not Found");
      } else if (fetchResult.status === 200) {
        fetchResult.json().then((post) => {
          //   console.log(post);
          createNewPost(
            postsDiv,
            post.meta.description_text,
            post.meta.author,
            timeConvert(post.meta.published),
            post.meta.likes,
            post.comments,
            post.src,
            post.id
          );
        });
      }
    });
  });

  showProfile();
  document
    .getElementById("back-to-feed")
    .addEventListener("click", hideProfile);
};

/**********************************************************/
/*               2.1.1      Login Page                    */
/**********************************************************/
document.getElementById("login-submit").addEventListener("click", () => {
  if (
    document.getElementById("password-login").value !==
    document.getElementById("password-confirm-login").value
  ) {
    displayErrorModal("Two passwords don't match!");
    // console.log("Two passwords don't match!");
  } else {
    const loginBody = {
      username: document.getElementById("username-login").value,
      password: document.getElementById("password-login").value,
    };
    // const loginBody = {
    //   "username": "Sophia",
    //   "password": "cluttered",
    // };

    // const loginBody = {
    //   "username": "Jackson",
    //   "password": "fertile",
    // };
    //login API
    fetch("http://localhost:5000/auth/login", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(loginBody),
      //convert to JSON form
    })
      .then((data) => {
        if (data.status === 403) {
          displayErrorModal("Invalid Username/Password");
        } else if (data.status === 400) {
          displayErrorModal("Missing Username/Password");
          //login success
        } else if (data.status === 200) {
          localStorage.clear();
          data.json().then((result) => {
            // console.log(result);
            localStorage.setItem("token", result.token);
            showFeed();
          });
        }
      })
      .catch((error) => {
        console.log("Error:  ", error);
      });
  }
});

/***********************************/
/*      link to Register/login     */
/***********************************/
document
  .getElementById("link-to-register")
  .addEventListener("click", showRegister);
document.getElementById("link-to-login").addEventListener("click", showLogin);

/**********************************************************/
/*               2.1.2   Register Page                    */
/**********************************************************/
document.getElementById("register-submit").addEventListener("click", () => {
  localStorage.clear();
  if (
    document.getElementById("password-register").value !==
    document.getElementById("password-confirm-register").value
  ) {
    displayErrorModal("Two passwords don't match!");
  } else {
    const registerBody = {
      username: document.getElementById("username-register").value,
      password: document.getElementById("password-register").value,
      email: document.getElementById("email-register").value,
      name: document.getElementById("name-register").value,
    };
    fetch("http://localhost:5000/auth/signup", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      //convert to JSON form
      body: JSON.stringify(registerBody),
    })
      .then((data) => {
        if (data.status === 409) {
          displayErrorModal("Username Takes");
        } else if (data.status === 400) {
          displayErrorModal("Missing Username/Password");
        } else if (data.status === 200) {
          data.json().then((result) => {
            localStorage.setItem("token", result.token);
            showFeed();
          });
        }
      })
      .catch((error) => {
        console.log("Error:  ", error);
      });
  }
});

/********************************************************************************************/
//             getTime
//        from stackoverflow
//https://stackoverflow.com/questions/847185/convert-a-unix-timestamp-to-time-in-javascript
/********************************************************************************************/
const timeConvert = (timestamp) => {
  timestamp = timestamp.substring(0, 10);
  const a = new Date(timestamp * 1000);
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const year = a.getFullYear();
  const month = months[a.getMonth()];
  const date = a.getDate();
  const hour = a.getHours();
  const min = a.getMinutes();
  const sec = a.getSeconds();
  const time =
    date + " " + month + " " + year + " " + hour + ":" + min + ":" + sec;
  return time;
};

/*******************************************************************************/
/*                      Get User infromation by username                       */
/*            then pass into showUserProfile to show profile page              */
/*******************************************************************************/
const getUserInfo = (username, mode) => {
  fetch("http://localhost:5000/user/?username=" + username, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: "Token " + localStorage.getItem("token"),
    },
  }).then((fetchResult) => {
    if (fetchResult.status === 400) {
      displayErrorModal("Malformed Request");
    } else if (fetchResult.status === 403) {
      displayErrorModal("Invalid Auth Token");
    } else if (fetchResult.status === 404) {
      displayErrorModal("User Not Found");
    } else if (fetchResult.status === 200) {
      if (mode === 1) {
        fetchResult.json().then((userInfo) => {
          showUserProfile(userInfo);
        });
        //store user info to localstorage
      } else if (mode === 2) {
        fetchResult.json().then((userInfo) => {
          // console.log(userInfo);
          localStorage.setItem("userId", userInfo.id);
          localStorage.setItem("username", userInfo.username);
          document.getElementById("username").innerText = userInfo.name;
        });
      }
    }
  });
};

/**********************************************************/
/*              2.4.1 Show User Own Profile               */
/**********************************************************/
document.getElementById("username").addEventListener("click", () => {
  getUserInfo("", 1);
});

/**********************************************************/
/*              2.2.1     GetFeed                         */
/**********************************************************/
const getFeed = () => {
  feedPage = 0;
  //2.6.2 live update clear ====> feed()
  document.getElementById("posts").innerText = "";
  fetch("http://localhost:5000/user/feed", {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: "Token " + localStorage.getItem("token"),
    },
  }).then((data) => {
    if (data.status === 403) {
      displayErrorModal("Invalid Auth Tokens-/user/feed");
    } else if (data.status === 200) {
      data.json().then((result) => {
        /***********************************/
        /*       2.2get feed details       */
        /***********************************/
        const posts = result.posts;
        posts.map((post) => {
          createNewPost(
            document.getElementById("posts"),
            post.meta.description_text,
            post.meta.author,
            timeConvert(post.meta.published),
            post.meta.likes,
            post.comments,
            post.src,
            post.id
          );
        });
      });
    }
  });
};
/**********************************************************/
/*              2.6.1     GetFeed with p                  */
/**********************************************************/
const getFeedPage = () => {
  //2.6.2 live update clear ====> feed()
  feedPage += 10;
  // console.log(feedPage);
  fetch("http://localhost:5000/user/feed?p=" + feedPage, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: "Token " + localStorage.getItem("token"),
    },
  }).then((data) => {
    if (data.status === 403) {
      displayErrorModal("Invalid Auth Tokens-/user/feed");
    } else if (data.status === 200) {
      data.json().then((result) => {
        /***********************************/
        /*       get feed details          */
        /***********************************/
        const posts = result.posts;
        posts.map((post) => {
          createNewPost(
            document.getElementById("posts"),
            post.meta.description_text,
            post.meta.author,
            timeConvert(post.meta.published),
            post.meta.likes,
            post.comments,
            post.src,
            post.id
          );
        });
      });
    }
  });
};

/**********************************************************/
/*                      2.4.2 Follow                      */
/**********************************************************/
document.getElementById("follow-button").addEventListener("click", () => {
  const followName = document.getElementById("follow-username").value;
  fetch("http://localhost:5000/user/follow?username=" + followName, {
    method: "PUT",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: "Token " + localStorage.getItem("token"),
    },
    //convert to JSON form
  }).then((fetchResult) => {
    if (fetchResult.status === 404) {
      displayErrorModal("User Not Found");
    } else if (fetchResult.status === 403) {
      displayErrorModal("Invalid Auth Token");
    } else if (fetchResult.status === 400) {
      displayErrorModal("Malformed Request");
    } else if (fetchResult.status === 200) {
      displayErrorModal("Follow success!");
    }
  });
});

//create new post =====> feed
document.getElementById("newpost-back-feed").addEventListener("click", () => {
  document.getElementById("new-post-page").style.display = "none";
  document.getElementById("buttons").style.display = "inline";
  window.addEventListener("scroll", infiniteHandler);
  getFeed();
  document.getElementById("feed-page").style.display = "flex";
});
/**********************************************************/
/*                2.5.1 Adding a post                     */
/**********************************************************/
document.getElementById("new-post-button").addEventListener("click", () => {
  hideFeed();
  window.removeEventListener("scroll", infiniteHandler);
  showCreatePost();
});
//Submit new post
document.getElementById("new-post-submit").addEventListener("click", () => {
  const description = document.getElementById("newpost-description").value;
  const pngImage = document.getElementById("upload-img");

  if (description.value == "" || pngImage.value == "") {
    displayErrorModal("Please check description and picture");
  } else {
    var reader = new FileReader();
    reader.readAsDataURL(pngImage.files[0]);
    //await
    reader.onload = function () {
      const src = reader.result.split(",")[1];

      const postBody = {
        description_text: description,
        src: src,
      };
      fetch("http://localhost:5000/post/", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: "Token " + localStorage.getItem("token"),
        },
        body: JSON.stringify(postBody),
      }).then((fetchResult) => {
        if (fetchResult.status === 400) {
          displayErrorModal("Malformed Request / Image could not be processed");
        } else if (fetchResult.status === 403) {
          displayErrorModal("Invalid Auth Token");
        } else if (fetchResult.status === 200) {
          fetchResult.json().then((data) => {
            displayErrorModal("Post Success!");
            // console.log(data);
          });
        }
      });
    };
    reader.onerror = function (error) {
      console.log("Error: ", error);
    };
  }
});

/**********************************************************/
/*              2.5.4 Updating the profile                */
/**********************************************************/
document
  .getElementById("profile-update-submit")
  .addEventListener("click", () => {
    const newEmail = document.getElementById("update-email");
    const newPassword = document.getElementById("update-password");
    const newPasswordConfirm = document.getElementById(
      "update-password-confirm"
    );
    const newName = document.getElementById("update-name");
    if (newPassword.value !== newPasswordConfirm.value) {
      displayErrorModal("Two passwords don't match!");
    } else if (!newEmail.value && !newPassword.value && !newName.value) {
      displayErrorModal("There is nothing to update!");
    } else {
      // console.log(localStorage.getItem("token"));
      let updateProfileBody = {};
      if (newEmail.value) {
        updateProfileBody.email = newEmail.value;
      }
      if (newName.value) {
        updateProfileBody.name = newName.value;
      }
      if (newPassword.value) {
        updateProfileBody.password = newPassword.value;
      }
      fetch("http://localhost:5000/user/", {
        method: "PUT",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: "Token " + localStorage.getItem("token"),
        },
        body: JSON.stringify(updateProfileBody),
      }).then((fetchResult) => {
        if (fetchResult.status === 400) {
          displayErrorModal("Malformed user object");
        } else if (fetchResult.status === 403) {
          displayErrorModal("Invalid Authorization Token");
        } else if (fetchResult.status === 200) {
          displayErrorModal("Update Success!");
        }
      });
    }
  });
/**********************************************************/
/*              2.6.1 infinite scroll                      */
/**********************************************************/
const infiniteHandler = () => {
  const { scrollHeight, scrollTop, clientHeight } = document.documentElement;
  if (scrollTop + clientHeight > scrollHeight - 5) {
    getFeedPage();
  }
};
/**********************************************************/
/*                 2.6.2 live update                      */
/**********************************************************/
document.getElementById("stop-liveupdate").addEventListener("click", () => {
  if (
    document.getElementById("stop-liveupdate").innerText === "Stop LiveUpdate"
  ) {
    clearInterval(liveUpdate);
    document.getElementById("stop-liveupdate").innerText = "Start LiveUpdate";
  } else {
    document.getElementById("stop-liveupdate").innerText = "Stop LiveUpdate";
    liveUpdate = setInterval(function () {
      getFeed();
      // console.log("2.6.2");
    }, 10000);
  }
});

// //logout
// document.get
// document.getElementById('login-page').style.display = 'none'; block;
// // This url may need to change depending on what port your backend is running
// // on.
// const api = new API('http://localhost:5000');

// // Example usage of makeAPIRequest method.
// api.makeAPIRequest('dummy/user')
//     .then(r => console.log(r));

// const loginBody = {
//     "username" : "Sophia",
//     "password" : "cluttered"
// };
