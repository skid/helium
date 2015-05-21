/**
 * (He) development scripts. This is loaded in the inputs.html file.
**/
// Textarea input
(function(){
  var getEl = _.bind(document.getElementById, document);
  var INPUT_RESULTS = document.getElementById('input-results');
  var vget = function(item){ return item.value; };
  var tget = function(item){ return item.label; };
  
  // Putsome data in the lists
  $.getJSON("/data/colors").success(function(colors){
  $.getJSON('/data/countries').success(function(countries){
  $.getJSON('/data/cities').success(function(cities){
  $.getJSON("/data/grid").success(function(items){
  
  button1 = he('button', getEl('button-1'));
  button2 = he('button', getEl('button-2'));
  button3 = he('button', getEl('button-3'));
  button4 = he('button', getEl('button-4'), { icon: "cloud-download" });
  button5 = he('button', getEl('button-5'), { disabled: true });
  button6 = he('button', getEl('button-6'), { icon: "access-time" });
  button7 = he('button', getEl('button-7'), { icon: "check" });
  button8 = he('button', getEl('button-8'));
  button9 = he('button', getEl('button-9'), { icon: "access-alarms" });
  button10 = he('button', getEl('button-10'), { disabled: "he-loading" });
  button11 = he('button', getEl('button-11'), { disabled: true });
  button12 = he('button', getEl('button-12'), { disabled: true });
  button13 = he('button', getEl('button-13'), { disabled: true });
  button14 = he('button', getEl('button-14'), { icon: "access-alarms" });
  
  checkbox1 = he('checkbox', getEl('checkbox-1'));
  checkbox2 = he('checkbox', getEl('checkbox-2'));
  checkbox3 = he('checkbox', getEl('checkbox-3'), { disabled: true });
  checkbox3 = he('checkbox', getEl('checkbox-4'), { disabled: true });
  
  radio1 = he('radio', getEl('radio-1'));
  radio2 = he('radio', getEl('radio-2'), { disabled: true });
  radio3 = he('radio', getEl('radio-3'));
  
  
  input1 = he('input', getEl('input-1'), { label: getEl('input-1-label') });
  input2 = he('input', getEl('input-2'), { label: getEl('input-2-label'), disabled: true });
  
  input3 = he('input', getEl('input-3'), { label: getEl('input-3-label'), value: "This value is set programatically", error: "This is an error message" });
  
  input4 = he('input', getEl('input-4'), { tooltip: { content: "This is a tooltip", position: "above" }});
  input4.el.addEventListener('mouseover', function(){ input4.tooltipShow(); });
  input4.el.addEventListener('mouseout', function(){ input4.tooltipHide(); });
  
  input5 = he('number', getEl('input-5'), { format: 2, value: -3.14, negative: true });
  input6 = he('date', getEl('input-6'), { format: 'ISO', value: new Date(2012, 11, 12), datepicker: { vauto: "opposite", onRenderDate: function(date){
    return date.getDay() % 6 ? "" : "weekend";
  }}});
  
  input7 = he('input', getEl('input-7'), { value: "Click It!", icon: "check", click: true });
  input7.on('click', function(){ alert("You clicked the input") });

  input8 = he('input', getEl('input-8'), { value: "iconpos: after", icon: "check", iconpos: "after" });
  
  list1 = he('buttonList', getEl('list-1'), { items: [{ v: "op1", t: "Op 1" }, { v: "op2", t: "Op 2" }] });
  list2 = he('buttonList', getEl('list-2'), { type: "radio", items: [{ v: 1, t: "Radio" }, { v: 2, t: "List" }] });
  
  list3 = he('dropdownList', getEl('list-3'), { placeholder: "Placeholder Text", items: countries, vget: vget, tget: tget });
  list4 = he('scrollList', getEl('list-4'), { items: countries, vget: vget, tget: tget, multiple: true });
    
  list5 = he('autocompleteList', getEl('list-5'), { placeholder: "Placeholder Text", items: countries, vget: vget, tget: tget, nullable: true });
  list6 = he('dropdownList', getEl('list-6'), { value: "#f00", nullable: true, placeholder: "Placeholder Text", items: colors, vget: vget, tget: tget });

  var div1 = getEl('list-7-1');
  var div2 = getEl('list-7-2');
  list7 = he('buttonList', div1, { items: colors, vget: vget, tget: tget });
  list7.render = function(){
    _.each(this.buttons, function(button){
      he.unregister(button);
      button.el.parentElement && button.el.parentElement.removeChild(button.el);
    });
    var button; 
    var f1 = document.createDocumentFragment();
    var f2 = document.createDocumentFragment();
    var i = 0;
    while(button = this.nextButton()){
      (++i % 2 ? f1 : f2).appendChild(button.el);
    }
    div1.innerHTML = div2.innerHTML = "";
    div1.appendChild(f1);
    div2.appendChild(f2);
  }
  list7.render();
  
  var xhr = null;
  list8 = he('autocompleteList', getEl('list-8'), {
    ajax: function(str, callback){
      xhr && xhr.abort();
      xhr = $.getJSON('/data/countries-filter', {data: { text: str }}).success(callback);
    },
    minchars: 2,
    maxresults: 100,
    placeholder: "Hello",
    vget: vget,
    tget: tget,
    nullable: true
  });
  list8.on('change', function(){console.log(this.val())})
    
  // Modal
  modal1 = he('modal', getEl('modal-1'), {  });
  modal2 = he('modal', getEl('modal-2'), { closeAnywhere: false, closeIcon: true });
  
  he('button', getEl('button-modal-1'), {}).on('click', function(){ modal1.open(); })
  he('button', getEl('button-modal-2'), {}).on('click', function(){ modal2.open(); })
  he('button', getEl('modal-1-close'), {}).on('click', function(){ modal1.close(); })
  he('button', getEl('modal-2-close'), {}).on('click', function(){ modal2.close(); })
  
  he('autocompleteList', getEl('modal-autocomplete'), { items: colors, vget:vget, tget:tget });
  he('date', getEl('modal-datepicker'), { datepicker: true });
  he('dropdownList', getEl('modal-dropdown'), { items: countries, vget:vget, tget:tget });
  
  
  // Controls for custom editing of the "colors" column
  modal3 = he('modal', getEl('modal-3'), { closeAnywhere: false, closeIcon: true });
  gridlist1 = he('scrollList', getEl('grid-list-1'), { items: [], nullable: true, multiple: false });
  gridlist2 = he('scrollList', getEl('grid-list-2'), { items: [], nullable: true, multiple: true });
  gridOk = he('button', getEl('grid-ok'));
  
  gridlist1.on('change', function(){
    var item = gridlist1.getItem(gridlist1.getIndex());
    var available = _.without(gridlist1.$items, item);
    var selected = gridlist2.$items.concat(item);    
    _.defer(function(){
      gridlist1.val(null, { silent: true });
      gridlist1.reset(available);
      gridlist2.reset(selected);
    });
  });
  gridlist2.on('change', function(){
    var item = gridlist2.getItem(gridlist2.getIndex());
    var available = gridlist1.$items.concat(item);
    var selected = _.without(gridlist2.$items, item);
    _.defer(function(){
      gridlist2.val(null, { silent: true });
      gridlist2.reset(selected);
      gridlist1.reset(available);
    });
  });
  gridlist2.on('reset', function(){
    this.$items.length ? gridOk.enable() : gridOk.disable();
  });
  gridOk.on('click', function(){
    modal3.close(true);
  });
  
  // GRID SECTION
  var config = {
    // Control global parameters here
    global: {
      rowSelector: "start", // Show row selector checkboxes as the first column. Can also be "end".
      rowNumbers: true,     // Show row numbers column as the first column (or second, if rowSelector is "start").
      headerColumns: 1,     // How many columns at the beginning should be headers.
      footer: function(){}, // Returns a list of functions/strings to render as footer
      autoHeight: false,    // If true, the grid element will automatically grow to accomodate all rows
      onEdit: null,         // If a function, will be invoked when a field is edited
      onSort: null,         // If a function, will be invoked when a column requests sorting
      pagination: {
        element: getEl('grid-1-pagination'),
        size: 50,
        links: 7
      }
    },

    // Control individual row parameters here
    rows: {
      colspan: function(item){
        return { 0: 2, 1: 0 };
      },
      multiline: function(item){ /* returns true if row can be multiline */ },
      attrs: function(item, rowIndex){
        return { style: { "background": (rowIndex % 3) ? "#fff" : "#eef" } };
      },
    },

    // Control column-wide and individual cell parameters here
    columns: [{
      width: 150,
      name:  "name",
      title: "Tall Header",
      resizable: true,
      typeInfo: "text",
      editable: function(item, index){
        return index % 2;
      },
      sortable: true,
      filterable: true,
      filterOptions: { type: "text" },
      editOptions: { type: "text" },
      hideable: true,
    },{
      name: "date",
      title: "Date",
      typeInfo:  "date",
      resizable: true,
      width: 120,
      editable: true,
      sortable: true,
      filterable: true,
      editOptions: { type: "date" },
      filterOptions: { type: "date" },
      attrs: { style: { "text-align": "center" } }
    },{
      width: 200,
      name: "cost",
      title: "Cost",
      typeInfo:  { type: "number", format: 2 },
      resizable: true,
      editable: true,
      sortable: true,
      filterable: true,
      filterOptions: { type: "number", format: 5 },
      attrs: { style: { "text-align": "right" } }
    },{
      width: 330,
      name: "color",
      title: "Colors",
      typeInfo: { 
        type: "enum", 
        items: colors,
        tget: function(i){ return i.label },  
        vget: function(i){ return i.value }
      },
      editable: true,
      editOptions: { 
        type: "custom",
        onEdit: function(options, cbOk, cbCancel){
          gridlist1.option(options);
          gridlist2.option(options);
          
          var selected = _.filter(options.items, function(item){
            return options.value.indexOf(item.value) > -1;
          });
          var available = _.filter(options.items, function(item){
            return options.value.indexOf(item.value) === -1;
          });
          
          gridlist1.reset(available);
          gridlist2.reset(selected);
          
          modal3.once('close', function(withOK){
            withOK ? cbOk(_.pluck(gridlist2.$items, 'value')) : cbCancel();
          });
          modal3.open();
        }
      },
      template: function(item, index, value){
        var v = _.isArray(item['color']) ? item['color'] : [item['color']];
        var items = this.typeInfo.items;
        return _.map(v, function(val){ 
          var item = _.findWhere(items, { value: val });
          return item ? item.label : "";
        }).join(", ");
      },
      resizable: true
    },{
      width: 70,
      name: "isEpic",
      title: "Is Epic?",
      attrs: { style: { "text-align": "center" } },
      editable: function(item, index){
        return index % 2;
      },
      filterable: true,
      resizable: true,
      typeInfo: "boolean"
    },{
      name: "city",
      title: "City",
      editable: true,
      filterable: true,
      resizable: true,
      typeInfo: { 
        type: "enum", 
        items: cities,
        tget: function(i){ return i.label },  
        vget: function(i){ return i.value }
      },
      template: function(item, index, value){
        return value || "N/A";
      }
    },{
      name: "country",
      title: "Country",
      editable: true,
      filterable: true,
      resizable: true,
      editOptions: { type: "autocomplete" },
      typeInfo: { 
        type: "enum",
        items: countries,
        tget: tget,  
        vget: vget
      }
    },{
      width: 50,
      name: "actions",
      attrs: { style: { "text-align": "center" } },
      actions: [{
        icon: "check-circle",
        event: "click"
      }],
      hideable: false
    }/**/]
  }

  // Parse Dates
  _.each(items, function(item){ 
    item.date = he.util.date.parse(item.date,'ISO'); 
  });
  
  // Make more data
  items = items.concat(items);
  items = items.concat(items);
  items = items.concat(items);
  items = items.concat(items);

  var PAGE_SIZE = 50;
  var DATA = items;
  var PAGE = DATA.slice(0, PAGE_SIZE);
  
  console.log("Items:", PAGE.length, " Columns:", config.columns.length);

  config.global.onEdit = function(index, item, name, value, callback){
    item[name] = value;
    callback();
  }
  
  config.global.dataSize = function(){
    return DATA.length;
  }
  
  config.global.reset = function(params, callback){
    var filters  = params.filters;
    var sorting  = params.sorting;
    var pageSize = params.pagination.size;
    var page     = params.pagination.page;
    
    // Apply filtering
    DATA = _.filter(items, function(item){
      for(var name in filters){
        if(name in item){
          var filter = filters[name];
          for(var cmp in filter){
            // Deliberate usage of double equals
            if(filter[cmp] == null){
              continue;
            }
            if(cmp === "~" && item[name].toLowerCase().indexOf(filter[cmp].toLowerCase()) === -1){
              return false;
            }
            if(cmp === ">" && item[name] <= filter[cmp]){
              return false;
            }
            if(cmp === "<" && item[name] >= filter[cmp]){
              return false;
            }
            if(cmp === "in" && filter[cmp].length > 0 && filter[cmp].indexOf(item[name]) === -1){
              return false;
            }
          }
        }
      }
      return true;
    })
    .sort(function(a, b){
      for(var i=0, ii=sorting.length; i<ii; ++i){
        var crit = sorting[i];
        var dir = crit.direction;
        var name = crit.name;

        if((dir === "asc" && a[name] < b[name]) || (dir === "desc" && a[name] > b[name])){
          return -1;
        }
        else if((dir === "asc" && a[name] > b[name]) || (dir === "desc" && a[name] < b[name])){
          return 1;
        }
      }
      return 0;
    });
    
    // Pages are 1-indexed
    callback(PAGE = DATA.slice((page-1)*pageSize, page*pageSize));
  }

  console.time("Render Time");
  grid1 = he('grid', getEl('grid-1'), { data: PAGE, config: config });
  grid1.on('action:click', function(index){
    alert("Clicked on row index " + index);
  });
  console.timeEnd("Render Time");
 
  });
  });
  });
  });
})();