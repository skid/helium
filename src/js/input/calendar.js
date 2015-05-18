/**  
 * Helium calendar input control.  
 * Documented in input.js
**/
;(function(){
  var cssClass = he.util.cssClass;
  var floor = Math.floor;
  var ceil  = Math.ceil;
  var daysList = [ 'M', 'T', 'W', 'T', 'F', 'S', 'S' ];
  var monthsList = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  var Calendar = he.controls.calendar = function Calendar(element, options){
    he.abstract.control.call(this, element, _.defaults(options, this.$defaults));
    
    this.$subscribe('mousedown');
    this.on('he:mousedown', function(e){
      var value, target = e.target;
      if(null !== (value = target.getAttribute('data-year'))){
        this.showYear(parseInt(value, 10));
      }
      else if(null !== (value = target.getAttribute('data-month'))){
        this.showMonth(parseInt(value, 10));
      }
      else if(null !== (value = target.getAttribute('data-date'))){
        this.pickDate(parseInt(value, 10));
      }
    });
    
    this.on('he:change', function(options){
      this.$shown = this.val() || new Date;
      this.$render();
      options.silent || this.trigger('change', options);
    });

    this.$value = this.$sanitize(options.value);
    this.$shown = this.$value || this.$options.showMonth || new Date;
  }

  Calendar.prototype = he.util.inherits(he.abstract.control.prototype, {
    $defaults: {
      cssClass: 'he-white'
    },

    $o: {
      cssClass: function(ctrl, prev){
        prev && cssClass(ctrl.el, null, prev);
        ctrl.$options.cssClass && cssClass(ctrl.el, ctrl.$options.cssClass);
      },
      
      showMonth: function(ctrl, prev){
        if(!(ctrl.$options.showMonth instanceof Date)){
          ctrl.$options.showMonth = null;
        }
        else {
          ctrl.$shown = ctrl.$options.showMonth;
        }
        ctrl.$options.showMonth === prev || ctrl.$render();
      },

      onRenderDate: function(ctrl, prev){
        if(!_.isFunction(ctrl.$options.onRenderDate)){
          ctrl.$options.onRenderDate = null;
        }
        ctrl.$options.onRenderDate === prev || ctrl.$render();
      }
    },
    
    $init: function(){
      var cls = this.$options.cssClass;
      this.el.appendChild(this.$elYears = document.createElement('div'));
      this.el.appendChild(this.$elMonths = document.createElement('div'));
      this.el.appendChild(this.$elCalendar = document.createElement('div'));
      cssClass(this.$elYears, 'he-years');
      cssClass(this.$elMonths, 'he-months');
      cssClass(this.$elCalendar, 'he-dates');
      cssClass(this.el, 'he-calendar' + (cls ? (" " + cls) : ""));
      this.$render();
    },
    
    // Renders a single day
    $renderDay: function(date, val, day){
      var classes = [];
      var dayix = "";
      var dayfn = this.$options.onRenderDate;

      if(day > 0) {
        dayix = " data-date='" + day + "'";
        dayfn && (classes = classes.concat(dayfn.call(this, new Date(date.getFullYear(), date.getMonth(), day))));
      }
      else {
        classes.push("he-empty");
      }

      if(val && (date.getFullYear() === val.getFullYear()) && (date.getMonth() === val.getMonth()) && (val.getDate() === day)){
        classes.push("he-active");
      }
      return "<td" + dayix + " class='" + classes.join(" ") + "'>" + (day > 0 ? day : '') + "</td>";
    },

    // Renders the calendar view for the correct month
    $renderCalendar: function(date){
      var val   = this.val();
      var days  = he.util.date.getDaysInMonth(date);
      var i     = 2 - ((new Date(date.getFullYear(), date.getMonth(), 1)).getDay() || 7);
      var extra = Array(7 - ((days - i)  % 7)).join("<td class='he-empty'></td>");
      var html  = "<table><tr><th>" + daysList.join("</th><th>") + "</th></tr><tr>";

      for(var o = 1; i <= days; ++i, ++o){
        html += this.$renderDay(date, val, i);
        o % 7 === 0 && (html += "</tr>" + i === days ? "" : "<tr>");
      }

      return html + extra + "</table>";
    },
    
    // Renders the calendar's contents
    $render: function(date){
      date || (date = this.$shown);
      
      var month = date.getMonth();
      var year  = date.getFullYear();
      var calendarHTML = this.$renderCalendar(date);      
      
      var monthsHTML = monthsList.map(function(m, index){
        var cls = month === index ? " class='he-active'" : "";
        return "<div" + cls + " data-month='" + index + "'>" + m + "</div>"; 
      }).join("");
      
      var yearsHTML = "<div data-year='" + (year - 10) + "'>" + he.util.iconHTML('chevron-up') + "</div>" +
      createYearRange(year).map(function(y){
        return "<div" + (y === year ? " class='he-active'" : "") + " data-year='" + y + "'>" + y + "</div>"; 
      }).join("") + "<div data-year='" + (year + 10) + "'>" + he.util.iconHTML('chevron-down') + "</div>";
      
      var ey = this.$elYears;
      var em = this.$elMonths;
      var ec = this.$elCalendar;

      // This *needs* to be deferred since we are DESTROYING the existing HMTL elements
      // inside the calendar. Mouse event handlers that require the target of any event
      // originating from the calendar won't have valid event targets.
      _.defer(function(){
        ey.innerHTML = yearsHTML;
        em.innerHTML = monthsHTML;
        ec.innerHTML = calendarHTML;
      });
    },
    
    $sanitize: function(val){
      return (val instanceof Date) ? val : null;
    },

    // Sets the selected year on the calendar. 
    // Does not change the selected value.
    showYear: function(year) {
      if(year === this.$shown.getFullYear()){
        return;
      }
      this.$shown.setFullYear(year);
      this.$render();
    },
    
    // Sets the selected month on the calendar. 
    // Does not change the selected value or the showMonth option.
    showMonth: function(month) {
      if(month === this.$shown.getMonth()){
        return;
      }
      this.$shown.setMonth(month);
      this.$render();
    },

    // Picks a date and changes the calendar value 
    pickDate: function(date) {
      this.set(new Date(this.$shown.getFullYear(), this.$shown.getMonth(), date));
    },
    
    get: function(){
      return this.$value;
    },
    
    set: function(val, options){
      val = this.$sanitize(val);
      
      options = (options || {});
      options.previous = this.$value;

      if(!_.isEqual(val, this.$value)){
        this.$value = val;
        this.trigger('he:change', options)
      }
    }
  });
  
  // Creates a year range from the decade the current year is in.
  function createYearRange(current){
    var i, j, result = [];
    for(i = floor(current / 10) * 10, j = floor(current / 10 + 1) * 10; i < j; ++i) {
      result.push(i);
    }
    return result;
  }
})()
