function choosemonth(e){

    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('2020');
    
    var month = sheet.getRange(1,4).getDisplayValue();
    Logger.log(month)
    
    var lastcol = sheet.getLastColumn();
    var startcol = 6;
    
    var daterange = sheet.getRange(2,startcol,1,lastcol);
    var datelist = daterange.getDisplayValues();
  
    var starthide = datelist[0].indexOf(month)+startcol;
    Logger.log(starthide)
    
     if(e.range.getA1Notation()=="D1"){ 
      sheet.showColumns(startcol,lastcol-startcol+1)
      if (starthide-startcol>0){
        sheet.hideColumns(startcol,starthide-startcol);
        sheet.hideColumns(starthide+32,lastcol-starthide-31);
        
        }
      else {
        sheet.hideColumns(starthide+33,lastcol-starthide-32);
        }
        
      }
  }
  
  
  function showAllData(){
  
    var misc = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('2020');
    
    var lastcol = misc.getLastColumn();
    var startcol = 6  
    
    misc.showColumns(startcol,lastcol-startcol+1)
  
  }