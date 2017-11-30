'use strict';

var happyHour = {
  business: [],
  user: [],
  selectedArray: [],

  displayBusiness: function (selectedBusArray) {
    console.log('HEREE...!!!', selectedBusArray);
    for (var i = 0; i < selectedBusArray.length; i++) {
      var sectionElt = document.getElementById('business-div');
      var busCardElt = document.createElement('div');
      sectionElt.appendChild(busCardElt);

      var h3Elt = document.createElement('h3');
      busCardElt.appendChild(h3Elt);
      h3Elt.textContent = selectedBusArray[i].name;

      var imgElt = document.createElement('img');
      imgElt.src = selectedBusArray[i].imgURL;
      busCardElt.appendChild(imgElt);

      var hhSectionElt = document.createElement('section');
      hhSectionElt.textContent = 'Start: ' + convertToTime(selectedBusArray[i].hhTime.start) + ', End: ' + convertToTime(selectedBusArray[i].hhTime.end);
      busCardElt.appendChild(hhSectionElt);

      var addrSectionElt = document.createElement('section');
      addrSectionElt.textContent = 'Address:';
      busCardElt.appendChild(addrSectionElt);

      var pTag1Elt = document.createElement('p');
      pTag1Elt.textContent = selectedBusArray[i].address.street;
      addrSectionElt.appendChild(pTag1Elt);

      var pTag2Elt = document.createElement('p');
      pTag2Elt.textContent = selectedBusArray[i].address.state;
      addrSectionElt.appendChild(pTag2Elt);

      var pTag3Elt = document.createElement('p');
      pTag3Elt.textContent = selectedBusArray[i].address.zip;
      addrSectionElt.appendChild(pTag3Elt);
    }
  },

  filterBy: function (time, distance, price /*foodType*/) {
    for (var i = 0; i < happyHour.business.length; i++) {
      console.log('time: ', time);
      console.log('happyHour.business[i].hhTime.start: ', happyHour.business[i].hhTime.start);
      console.log('happyHour.business[i].hhTime.end: ', happyHour.business[i].hhTime.end);
      if(((time >= happyHour.business[i].hhTime.start) && (time <= (happyHour.business[i].hhTime.end - 1))) && (distance <= happyHour.business[i].distance) && (price <= happyHour.business[i].pricing)) /* && (foodType === businessArray[i].foodType))*/ {
        this.selectedArray.push(happyHour.business[i]);
      }
    }
    //  console.log('businessArray ', happyHour.business);
    console.log ('filter choice', this.selectedArray);
    happyHour.displayBusiness(this.selectedArray);
    //return this.selectedArray;
  },

  filterOnSubmit: function (event) {
    // a(time), b(distance), c(price), d(foodType)
    // if user selects any a,b,c pass the value to filterBy function, else pass 1 for particular letter.
    event.preventDefault();
    var filterTime = convertTime(event.target[0].value);
    var filterPrice = event.target[1].value;
    var filterDistance = event.target[2].value;

    if (event.target[0].value === '') {
      event.target[0].value = 1;
    }
    if (event.target[1].value === '') {
      event.target[1].value = 1;
    }
    if (event.target[2].value === '') {
      event.target[2].value = 1;
    }

    console.log(filterTime, filterPrice, filterDistance);

    happyHour.filterBy(filterTime, filterPrice, filterDistance);

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
    happyHour.cacheData(true, false);
  },

  cacheData: function (cacheBusiness, cacheUser) {
    if (cacheBusiness && happyHour.business.length > 0) {
      localStorage.business = JSON.stringify(happyHour.business);
    }
    if (cacheUser && happyHour.user.length > 0) {
      localStorage.user = JSON.stringify(happyHour.user);
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
  },

  userFilterEventListener: function () {
    // attach event listener to the user input filter form
    var form = document.getElementById('userFilter');
    form.addEventListener('submit', happyHour.filterOnSubmit);
  },


  prepareAddNewEventListener: function () {
    // attach event listener to the add new business form
    var form = document.getElementById('newbusiness');
    form.addEventListener('submit', happyHour.createOnSubmit);
  },

  prepareSignInEventListener: function () {
    // attach event listener to the sign in form
    var form = document.getElementById('form-signin');
    form.addEventListener('submit', happyHour.signIn);
  },

  signIn: function (event) {
    // Handle event of a user trying to sign in
    event.preventDefault();
    var userName = event.target.username.value;
    var password = event.target.password.value;
    /* Look for user that matches provided username. If found, validate */
    for (let i = 0; i < happyHour.user.length; i++) {
      let user = happyHour.user[i];

      if (userName !== user.userName) {
        continue;
      }

      if (password !== user.password) {
        console.log('Invalid password! Not logged in.');
        return;
      } else {
        console.log('Successfully logged in!');
        return;
      }
    }

    console.log('Invalid Username!');
  }
};

function convertTime(timeString) {
  var timeArray = timeString.split(':');

  return parseInt(timeArray[0]) * 100 + parseInt(timeArray[1]);
}

function convertToTime(numb) {
  var ampm = 'AM';
  if (numb > 1159){
    ampm = 'PM';
  }
  var hours = Math.floor(numb / 100);
  var minutes = numb % 100;

  return hours + ':' + minutes + ':' + ampm;
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
  this.hhTime.start = convertTime(hhTimeStart);
  this.hhTime.end = convertTime(hhTimeEnd);
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
  happyHour.cacheData(false, true);
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

new Business('Pike Place Chowder', '1530 Post Aly', 'Ste 11', 'Seattle', 'WA', '98121', '16:00', '18:00','5', 'https://s3-media3.fl.yelpcdn.com/bphoto/ijju-wYoRAxWjHPTCxyQGQ/348s.jpg');
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
