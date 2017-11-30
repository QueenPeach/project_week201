'use strict';

var happyHour = {
  business: [],
  user: [],
  signedInUserName: null,

  displayBusiness: function (businessArray) {
    // First off, blow away all the current html
    var sectionElt = document.getElementById('business-section');
    sectionElt.innerHTML = '';

    for (var i = 0; i < businessArray.length; i++) {
      var b = businessArray[i];

      // make a subsection and populate it
      var busCardElt = document.createElement('section');
      sectionElt.appendChild(busCardElt);
      busCardElt.className = 'bus-card';

      var h2Elt = document.createElement('h2');
      busCardElt.appendChild(h2Elt);
      h2Elt.textContent = b.name;

      var imgElt = document.createElement('img');
      busCardElt.appendChild(imgElt);
      imgElt.src = b.imgURL;

      // Make happy hours sub-section
      make4ColumnSection(busCardElt, 'Happy Hours', [convertTimeVal(b.hhTime.start) + ' - ' + convertTimeVal(b.hhTime.end)]);

      // Make Address sub-section
      make4ColumnSection(busCardElt, 'Address', [b.address.street, b.address.city + ', ' + b.address.state + ' ' + b.address.zip]);

      // Make Proximity sub-section
      make4ColumnSection(busCardElt, 'Proximity', ['~' + b.distance + ' miles away']);

      // Make pricing sub-section
      make4ColumnSection(busCardElt, 'Pricing', ['~' + b.pricing + ' dollars']);
    }
  },

  filterOnSubmit: function (event) {
    event.preventDefault();

    // Filter all businesses based on criteria selected
    var results = happyHour.business;

    // time between happy hours (exception is when time == end happy hour time)
    if (event.target.time.value !== '') {
      console.log('Filtering for time!')
      let timeVal = convertTimeString(event.target.time.value);
      results = results.filter(function (business) {
        // Handle edge case when happy hour starts late and goes past midnight
        if (business.hhTime.start > business.hhTime.end) {
          return !(timeVal >= business.hhTime.end && timeVal < business.hhTime.start);
        } else {
          return timeVal >= business.hhTime.start && timeVal < business.hhTime.end;
        }
      });
    }

    // price less then or equal to
    if (event.target.price.value !== '') {
      console.log('Filtering for price!')
      results = results.filter(function (business) {
        return parseInt(business.pricing) <= parseInt(event.target.price.value);
      });
    }

    // proximity
    if (event.target.proximity.value !== '') {
      console.log('Filtering for proximity!')
      results = results.filter(function (business) {
        return business.distance <= parseInt(event.target.proximity.value);
      });
    }

    // zip code
    if (event.target.zip.value !== '') {
      console.log('Filtering for zip code!')
      console.log(results);
      results = results.filter(function (business) {
        console.log(event.target.zip.value, business.address.zip);
        return event.target.zip.value === business.address.zip;
      });
    }

    console.log('Businesses to display:', results);
    happyHour.displayBusiness(results);
  },

  createOnSubmit: function (event) {
    event.preventDefault();
    console.log('Entered event listener!');
    new Business(
      event.target.businessname.value,
      event.target.addrstreet.value,
      event.target.addrcity.value,
      event.target.addrstate.value,
      event.target.addrzip.value,
      event.target.starttime.value,
      event.target.endtime.value,
      event.target.pricing.value,
      event.target.imageurl.value
    );
    // new business was created, cache all data
    happyHour.cacheData(true, false, false);
  },

  cacheData: function (cacheBusiness, cacheUser, cacheSignIn) {
    console.log('cacheSignIn', cacheSignIn, 'happyHour.signedInUserName', happyHour.signedInUserName);
    if (cacheBusiness && happyHour.business.length > 0) {
      localStorage.business = JSON.stringify(happyHour.business);
    }
    if (cacheUser && happyHour.user.length > 0) {
      localStorage.user = JSON.stringify(happyHour.user);
    }

    // user signin status must be cached when signed out as well as signed in
    if (cacheSignIn) {
      console.log('Caching signin data', happyHour.signedInUserName);
      // Just cache the name for now
      if (happyHour.signedInUserName) {
        localStorage.signedInUserName = JSON.stringify(happyHour.signedInUserName);
      } else {
        localStorage.signedInUserName = null;
      }
    }
  },

  restoreData: function () {
    console.log('Restoring data!');
    // Restore business data
    if (localStorage.business) {
      happyHour.business = [];
      let objects = JSON.parse(localStorage.business);
      for (let i = 0; i < objects.length; i++) {
        let object = objects[i];
        let b = new Business(
          object.name,
          object.address.street,
          object.address.city,
          object.address.state,
          object.address.zip,
          object.hhTime.start,
          object.hhTime.end,
          object.pricing,
          object.imgURL
        );
        b.distance = object.distance;
      }
    }
    // Restore user data
    if (localStorage.user) {
      happyHour.user = [];
      let objects = JSON.parse(localStorage.user);
      for (let i = 0; i < objects.length; i++) {
        let object = objects[i];
        new User(object.userName, object.password);
      }
    }

    if (localStorage.signedInUserName) {
      // Extract the name of the user
      var name = JSON.parse(localStorage.signedInUserName);
      console.log('Found signedInUserName in localStorage:', name);
      // Find the username that was signed in, store it, and restore the session
      happyHour.signedInUserName = name;
      showHideButton('signin-btn-toggle', false);
      showHideButton('add-new-btn', true);
      showHideButton('signout-btn', true);
    } else {
      showHideButton('signin-btn-toggle', true);
      showHideButton('add-new-btn', false);
      showHideButton('signout-btn', false);
    }
  },

  userFilterEventListener: function () {
    // attach event listener to the user input filter form
    var form = document.getElementById('filter-form');
    form.addEventListener('submit', happyHour.filterOnSubmit);
  },

  prepareAddNewEventListener: function () {
    // attach event listener to the add new business form
    var form = document.getElementById('newbusiness');
    form.addEventListener('submit', happyHour.createOnSubmit);
  },

  signOut() {
    // If nobody is signed in, there is nothing to do.
    if (!happyHour.signedInUserName) {
      return;
    }
    // Set nobody as signed in (eg null)
    happyHour.signedInUserName = null;
    happyHour.cacheData(false, false, true);

    showHideButton('signin-btn-toggle', true);
    showHideButton('signout-btn', false);
    showHideButton('add-new-btn', false);
  },

  configureSignOutBtn: function () {
    var signoutbtn = document.getElementById('signout-btn');
    signoutbtn.addEventListener('click', happyHour.signOut);
  },

  configureSignInPanel: function () {
    // First set the sign-in panel to toggle on/off
    var btn = document.getElementById('signin-btn-toggle');
    btn.addEventListener('click', happyHour.toggleSignInPanel);

    // Configure sign-in to occur
    var form = document.getElementById('form-signin');
    form.addEventListener('submit', happyHour.signIn);
  },

  toggleSignInPanel: function () {
    var panel = document.getElementById('signin_panel');
    var arrow = document.getElementById('arrow');
    var height = '130px';

    if (panel.style.height === height) {
      panel.style.height = '0px';
      arrow.innerHTML = '&#9662;';
    } else {
      panel.style.height = height;
      arrow.innerHTML = '&#9652;';
    }
  },

  signIn: function (event) {
    // Handle event of a user trying to sign in
    event.preventDefault();
    var userName = event.target.username.value;
    var password = event.target.password.value;
    /* Look for user that matches provided username. If found, validate */
    for (let i = 0; i < happyHour.user.length; i++) {
      let user = happyHour.user[i];

      if (userName !== happyHour.user[i].userName) {
        continue;
      }

      if (password !== user.password) {
        console.log('Invalid password! Not logged in.');
        return;
      } else {
        console.log('Successfully logged in!');
        // toggle the sign-in drop-down away
        happyHour.toggleSignInPanel();
        // Hide/show appropriate buttons
        showHideButton('signin-btn-toggle', false);
        showHideButton('signout-btn', true);
        showHideButton('add-new-btn', true);

        // Set the signed in user
        happyHour.signedInUserName = user.userName;

        // Cache the data now that the user logged in
        happyHour.cacheData(false, false, true);

        return;
      }
    }

    console.log('Invalid Username!');
  }
};

function showHideButton(btnId, visible) {
  var btn = document.getElementById(btnId);

  if (visible) {
    btn.style.visibility = 'visible';
  } else {
    btn.style.visibility = 'hidden';
  }
}

function make4ColumnSection(parentEl, h3, pList) {
  var section = document.createElement('section');
  section.className = 'business-card-4-column';
  parentEl.appendChild(section);

  var h3El = document.createElement('h3');
  section.appendChild(h3El);
  h3El.textContent = h3;

  for (let i = 0; i < pList.length; i++) {
    var pEl = document.createElement('p');
    section.appendChild(pEl);
    pEl.textContent = pList[i];
  }
}

// Convert a time string into a value (eg '18:00' ==> 1800)
function convertTimeString(timeString) {
  var timeArr = timeString.split(':');
  return parseInt(timeArr[0]) * 100 + parseInt(timeArr[1]);
}

// Convert a time value (eg 1800 ==> 6pm) to a time string (eg 6:00 PM)
function convertTimeVal(timeVal) {
  let ampm = ' AM';

  let hours = Math.floor(timeVal / 100);
  if (hours > 12) {
    ampm = ' PM'
    hours -= 12;
  }

  let mins = timeVal % 100;
  if (mins === 0) {
    mins = '00';
  }

  return hours + ':' + mins + ampm;
}


// Business constructor
function Business(businessName, street, city, state, zip, hhTimeStart, hhTimeEnd, pricing, imgURL) {
  this.name = businessName;
  this.address = {};
  this.address.street = street;
  this.address.city = city;
  this.address.state = state;
  this.address.zip = zip;
  this.hhTime = {};
  this.hhTime.start = convertTimeString(hhTimeStart);
  this.hhTime.end = convertTimeString(hhTimeEnd);
  this.imgURL = imgURL;
  this.pricing = parseInt(pricing);
  // all businesses will be 0..15 miles away
  this.distance = Math.floor(Math.random() * 15);
  happyHour.business.push(this);
  console.log('Business object created:', this);
}

// User constructor
function User(userName, password) {
  this.userName = userName;
  this.password = password;
  happyHour.user.push(this);
  // Cache user data
  happyHour.cacheData(false, true, false);
  console.log('User object constructor created:', this);
}

// console.log('Business object constructor created: ', Business);
new Business('Some Random Bar', '2604 1st Ave', 'Seattle', 'WA', '98121', '18:00', '20:00', '14', 'https://s3-media1.fl.yelpcdn.com/bphoto/m4hfcLhvJbEGdbgI3DhvqA/o.jpg');
new Business('Mr Darcy\'s', '2222 2nd Ave', 'Seattle', 'WA', '98121', '17:00', '19:00', '9', 'https://s3-media4.fl.yelpcdn.com/bphoto/Mzk-V11ozhmnYxCIppIVJg/o.jpg');
new Business('Jupiter Bar', '2126 2nd Ave', 'Seattle', 'WA', '98121', '14:00', '17:30', '11', 'https://s3-media1.fl.yelpcdn.com/bphoto/_hE7rHaEOUpDm9IRaaWqzA/o.jpg');
new Business('Rabbit Hole', '2222 2nd Ave', 'Seattle', 'WA', '98121', '16:00', '18:00', '5', 'https://s3-media2.fl.yelpcdn.com/bphoto/2mbQQeJuOAkMHT2gXAks8g/o.jpg');
new Business('Hotel Andra', '2000 4th Ave', 'Seattle', 'WA', '98121', '16:00', '19:00', '20', 'https://s3-media1.fl.yelpcdn.com/bphoto/Njh7iweDZAPXlHhpe8CatQ/o.jpg');
new Business('Ashley\'s Salmon Cookie Pub', '8764 1st Ave', 'Seattle', 'WA', '98121', '13:00', '19:00', '5', 'https://media4.s-nbcnews.com/j/streams/2013/March/130328/1C6676403-gsbeer.today-inline-large.jpg');
new Business('Ive Had Better', '6969 0th St', 'Seattle', 'WA', '98121', '14:00', '18:30', '3', 'http://d-hangout.com/site/assets/files/1089/pbr.jpg');

new Business('Pike Place Chowder', '1530 Post Aly, Ste 11', 'Seattle', 'WA', '98121', '16:00', '18:00', '5', 'https://s3-media3.fl.yelpcdn.com/bphoto/ijju-wYoRAxWjHPTCxyQGQ/348s.jpg');
new Business('Tacos Chukis', '219 Broadway E', 'Seattle', 'WA', '98102', '14:00', '19:00', '4', 'https://s3-media4.fl.yelpcdn.com/bphoto/cCRwyQyspK-xaWM732zKnw/o.jpg');
new Business('Altura', '617 Broadway E', 'Seattle', 'WA', '98102', '15:00', '18:00', '18', 'http://www.seattlemag.com/sites/default/files/field/image/1112altura.jpg');
new Business('Witness', '410 Broadway E', 'Seattle', 'WA','98102', '22:00', '01:00', '5', 'https://s3-media4.fl.yelpcdn.com/bphoto/nWgv_ROWRuoen0oyAxVh6A/o.jpg');
new Business('Serafina', '2043 Eastlake Ave E', 'Seattle', 'WA', '98102', '15:00', '18:00', '5', 'https://s3-media1.fl.yelpcdn.com/bphoto/apkvllYgsu5X-os9j66zEQ/348s.jpg');
new Business('Steve\'s Pizza Mart', '1234 Sesame St', 'Seattle', 'WA', '98102', '16:00', '18:00', '5', 'https://itsgoingdown.org/wp-content/uploads/2017/08/zzzz.jpeg');

new Business('The Pink Door', '1919 Post Aly', 'Seattle', 'WA', '98101', '21:00', '02:00', '20', 'https://s3-media4.fl.yelpcdn.com/bphoto/4MmMuSGEQCXpqEoCOhL7tw/o.jpg');
new Business('Japonessa', '1400 1st Ave', 'Seattle', 'WA', '98101', '15:00', '17:30', '15', 'https://s3-media4.fl.yelpcdn.com/bphoto/vucCrknnlu1RRvRaKWwovQ/348s.jpg');
new Business('Jay\'s Watering Hole', '6969 4th Ave', 'Seattle', 'WA', '98101', '10:00', '02:00', '1', 'https://i.pinimg.com/736x/2b/3f/8c/2b3f8ca832696337a551dd1d382a7241--restaurant-bar-stools-restaurant-bar-design.jpg');
new Business('Purple Cafe and Wine bar', '1225 4th Ave', 'Seattle', 'WA', '98101', '16:00', '18:00', '22', 'https://s3-media3.fl.yelpcdn.com/bphoto/mKmgyZbM-Dg0GMd8izvnUA/o.jpg');
new Business('Sweet Iron', '1200 3rd Ave', 'Seattle', 'WA', '98101', '14:00', '19:00', '5', 'https://s3-media1.fl.yelpcdn.com/bphoto/_BwGQVTPqGOLUyB9CStMCA/o.jpg');
new Business('Liberty\'s Broiler', '9876 13th Ave', 'Seattle', 'WA', '98101', '15:00', '18:00', '25', 'http://buyourbottles.com/blog/wp-content/uploads/2013/09/750mlCelebration_WO_Badge_0297f_RGB_FNL.jpg');
new Business('Super Happy Fun Time', '8142 3rd St', 'Seattle', 'WA', '98101', '21:00', '02:00', '8', 'https://www.diggersservicesclub.com.au/wp/wp-content/uploads/2016/02/group-of-people-at-bar.jpg');

new User('user', 'password');
