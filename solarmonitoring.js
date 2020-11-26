function compareandformat(){
  
    //print today's date
    SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Basis').getRange(2,7).setValue(new Date()).setNumberFormat("d MMMM");
    
    var current = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Data');
  //  var previous = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('2020');
    var basis = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Basis');
    var notif = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Notifications');
    var monthly = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Monthly Production');
    var alltime = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('All-Time');
    var pvsysdata = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('PVSyst Data');
    
    // A. Finds the correct sheet based on the today's year
    
    var sheetList = new Array();
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets();    // A1. List out all of the sheets
    for (var i=0 ; i<sheet.length ; i++) {
      sheetList.push(sheet[i].getName())
    }
    
    var date = basis.getRange(2,7).getValue();   // A2. Extracts today's year
    var year = (date.getYear()+1900).toString();
    Logger.log(year)
    var previous = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(year); // A3. Sets the active sheet based on today's year
    
    // find the column with todays date
    var dateString = basis.getRange(2, 7).getDisplayValue();
    var lastcol = previous.getLastColumn();
    var startcol = 6;
    var datelist = previous.getRange(2, startcol, 1, lastcol-1).getDisplayValues();
    var col = datelist[0].indexOf(dateString)
    var active = col+startcol;
  
    // pull PVSyst names from today's import
    var startrow = 2;
    var lastrow = current.getLastRow();
    var length = lastrow-startrow+1;
    
    var PVSrange = current.getRange(startrow,4,length,1);
    var PVSys = PVSrange.getValues();
    
    // pull PVSyst names from previous day
    var startrow1 = 3;
    var lastrow1 = previous.getLastRow();
    var length1 = lastrow1-startrow1+1;
    
    var PVSprevrange = previous.getRange(startrow1,1,length1,1); 
    var PVSprev = PVSprevrange.getValues();
    
    // write names to Basis sheet
    var prev = basis.getRange(2,1,length1,1).setValues(PVSprev);
    var now = basis.getRange(2,2,length,1).setValues(PVSys);
    
    //find row number of differences - for multiple clients
    var PVSysT = PVSys.map(function (r) {return r[0];} );
    var PVSprevT = PVSprev.map(function (r) {return r[0];} );
    
    var res = PVSysT.reduce(function(ar, r, i) {
      if (!PVSprevT.some(function(f) {return r == f})) ar.push(i+3);
      return ar;
      },[]);
      Logger.log(res)
    // add new rows - for multiple clients
    
    for( i=0; i<res.length; i++) {
      previous.insertRows(res[i]);
      monthly.insertRows(res[i]);
      alltime.insertRows(res[i]);
      pvsysdata.insertRows(res[i]);
      alltime.getRange("D"+res[i]).setFormula("=C"+res[i]);
      }  
  
    //add values
    var Valuerange = current.getRange(2,5,length,1);
    var Value = Valuerange.getValues();
    
    var writeNames = previous.getRange(startrow1,1,length,1).setValues(PVSys);
    var writeValue = previous.getRange(startrow1,active,length,1).setValues(Value);
    
    //update Formula's in the "Year" Folder
  
    // split string to get System Name
    previous.getRange("B3").setFormula('=REGEXEXTRACT(A3,"[A-Za-z& ]+")').copyTo(previous.getRange(3,2,length));
    
    // extract last strings to get system size
    previous.getRange("C3").setFormula('=REGEXEXTRACT(A3,"[0.-9]+kWp$")').copyTo(previous.getRange(3,3,length));
    
    // remove kWp and convert this to a value
    previous.getRange("D3").setFormula('=VALUE(REGEXEXTRACT(C3,"[0.-9]+"))').copyTo(previous.getRange(3,4,length));
  
    // update monthly production formula (for new clients)
    previous.getRange("AK3").setFormula('=sum(F3:AJ3)').copyTo(previous.getRange(3,37,length)); // July
    previous.getRange("BQ3").setFormula('=sum(AL3:BP3)').copyTo(previous.getRange(3,69,length)); // August
    previous.getRange("CW3").setFormula('=sum(BR3:CV3)').copyTo(previous.getRange(3,101,length)); // September  
    previous.getRange("EC3").setFormula('=sum(CX3:EB3)').copyTo(previous.getRange(3,133,length)); // October
    previous.getRange("FI3").setFormula('=sum(ED3:FG3)').copyTo(previous.getRange(3,165,length)); // November
    previous.getRange("GO3").setFormula('=sum(FJ3:GN3)').copyTo(previous.getRange(3,197,length)); // December
    
      //fill empty cells with zeros
    previous.getRange(startrow1,startcol,length,col).setValues(
      previous.getRange(startrow1,startcol,length,col).getValues().map(function (row) {
        return row.map(function (cell) {
          return !cell ? 0 : cell; 
          }
        )
      })
    ).setNumberFormat("0.00").setHorizontalAlignment("center");  
    
    //update filter
    previous.getFilter().remove()
    previous.getRange(startrow1-1,1,length+1,lastcol).createFilter();
    
    // Updates Notifications Sheet 
  //  notif.getRange(3,1,length).setValues(PVSys)
    
    notif.getRange("A3").setFormula("='2020'!B3").copyTo(notif.getRange(3,1,length));
    notif.getRange("B3").setFormula("='2020'!D3").copyTo(notif.getRange(3,2,length));
    notif.getRange("C3").setValue("TRUE").insertCheckboxes().copyTo(notif.getRange(3,3,length));
  
    // Updates Monthly Production Sheet
    monthly.getRange("A3").setFormula("='2020'!B3").copyTo(monthly.getRange(3,1,length)); 
    monthly.getRange("B3").setFormula("='2020'!D3").copyTo(monthly.getRange(3,2,length));
    
    var nr = previous.getNamedRanges()[0];
    var newrange = nr.setRange(previous.getRange(2,2,length,lastcol-1));
    monthly.getRange("I3").setFormula("=vlookup($A3,Alldata,I$1)").copyTo(monthly.getRange(3,9,length,6));
    
    monthly.getRange("O3").setFormula("=SUM(C3:N3)").copyTo(monthly.getRange(3,15,length));
    
    // Updates All-Time Sheet
    alltime.getRange("A3").setFormula("='2020'!B3").copyTo(alltime.getRange(3,1,length)); 
    alltime.getRange("B3").setFormula("='2020'!D3").copyTo(alltime.getRange(3,2,length));
    alltime.getRange("C3").setFormula("='Monthly Production'!O3").copyTo(alltime.getRange(3,3,length));
    
    // Update PVSyst Data Sheet
    pvsysdata.getRange("A3").setFormula("='2020'!B3").copyTo(pvsysdata.getRange(3,1,length)); 
    pvsysdata.getRange("B3").setFormula("='2020'!D3").copyTo(pvsysdata.getRange(3,2,length));
    
    // Update Data Sheet
    current.deleteRows(2, length); // remove the imported data for the next import
      
    alertsystem();
    
   }
   
  function alertsystem(){
    
    // assign variables for worksheets
    var notification = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Notifications');
    var data = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("2020"); // also called previous
    var alltime = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("All-Time");
    var basis = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Basis");
    
    
    //get today's (importing) date  
    var date = basis.getRange(2, 7).getDisplayValue(); 
    
    //find today's date in monitoring system
    
    var startcol = 6;
    var lastcol = data.getLastColumn();
    var datelist = data.getRange(2, startcol, 2, lastcol-1).getDisplayValues();
    
    var col = datelist[0].indexOf(date)
    var active = col+startcol  // column number for todays date
    
    // get today's data from monitoring
    var startrow = 3;
    var lastrow = data.getLastRow();
    
    var values = data.getRange(startrow, active , lastrow-2).getValues().map(function(r) {return r[0]; });
  
    var rownum = []; // create array to return row number
    
    // Check if notifications are enabled
    var notif = notification.getRange(startrow,3,lastrow-2).getValues().map(function(r) {return r[0]*1; });
    
    // Check all-time values (so we know they are operating compared to those who have not had their meter changed)
    var total = alltime.getRange(startrow,3,lastrow-2).getValues().map(function(r) {return r[0]; });  
    
    Logger.log(notif)
   
    var thres = 1; // specify threshold for monthly totals
    for(var i = 0; i <values.length; i++){
      if(values[i]==0 && total[i]>thres && notif[i]==1){
        rownum.push(i);
        }
      }
    
    // Now that we have the row number, we can find out which system names did not have production
    
    // First we will need to get the system names
    var systemname = data.getRange(startrow,1,lastrow-1).getValues();
    
    //Obtain the list of clients
    var client =[];
    
    for(var k = 0; k<rownum.length;k++){
      client.push(systemname[rownum[k]]);
      }
  
    Logger.log(client)
    // Get the email template
    var email = HtmlService.createTemplateFromFile("monitoring");
    email.info = client;
    
    // Assign list of clients to email
    email.today = date;
    
    var message = email.evaluate().getContent();
     GmailApp.sendEmail("luvesh@sols247.org, engineer@sols247.org, zoran@solsenergy.com","PV Monitoring Alert: " + date,"",{name: 'SE Monitoring', htmlBody: message});
    
  }