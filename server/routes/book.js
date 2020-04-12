const User = require('../models/user');
const express = require('express');
const router = express.Router();
function isIsoDate(str) {
  console.log(str,"-----input")
  if (!/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/.test(str)) return false;
  var d = new Date(str); 
  console.log(str,"-----input")
  console.log(d.toISOString(),"-----output")
  
  return d.toISOString()===str;
}
router.post('/makeSlotAvailable', async (req, res) => {
  try {
    var condition = '';
    var bool = false;
    var errorNum = 200;
    var doc;
    const { startTime, status, email } = req.body;
    var date=isIsoDate(req.body.startTime);
    if(!date){
      condition = "Wrong date format";
      errorNum = 403;
    }else{
      const slot = await User.findOne({ email: req.body.email })
      .then((docs) => {
        if (docs) {
          doc = docs
          bool = true;
          //      console.log(docs.slotValue);
          //      var jsonForm= {slotValue:docs.slotValue};
          //      var obj=JSON.parse(jsonForm)
          //      var lenToUse = Object.keys(obj).length;
          //      console.log("docs======",lenToUse)
          //  for(var i=0;i<=lenToUse;i++){
          //      item[i]=JSON.stringify(docs.slotValue[i].slot)
          //      JSON.parse(item[i]);

          //      console.log("Item------",item[i])
          //  }
          //   
        } else {
          bool = false;
          res.status(401)
            .json({
              title: 'Data not found',
              error: 'bool value false'
            });
          console.log({ "success": false, data: "no such user exist" });
        }
      })
    var slotPos = -1;
    if (bool) {
      var Value = req.body.startTime;
      var stat = req.body.status
      for (i in doc.slotValue) {
        if (doc.slotValue[i].slot === Value) {
          slotPos = i;
          break;
        }
      }
      if (slotPos == -1) {

        // var set={ slotValue:[{slot:Value,status:stat,book:false}]};
        // var set = {$addToSet:{slotValue: [{slot:Value,status:stat,book:false}]}};
        // console.log("set------------",set)
        // const first =  await User.findOneAndUpdate({email:req.body.email ,slotValue:set});
        var update = { $addToSet: { slotValue: [{ slot: Value, status: stat, book: false }] } };
        var filter = { email: req.body.email };

        const first = await User.findOneAndUpdate(filter, update);
        condition = "Changed Successfully";
      } else {

        condition = "Slot already exists";
      }      
    }
  }
  } catch (error) {

    res.status(401)
      .json({
        title: 'Not logged in or authenticated',
        error: error.message
      });

  }
  res.status(errorNum).json({
    title: condition,
    slotValue: req.body.startTime,
    status: req.body.status
  });
});
router.post('/bookSlot', async (req, res) => {
  var doc;
  var condition = '';
  var bool = false;
  try {
    const { startTime, status, book, email } = req.body;
    const slot = await User.findOne({ email: req.body.email, 'slotValue.slot': req.body.startTime, 'slotValue.status': req.body.status })
      //       const slot = await User.findOne({email:req.body.email,slotValue:[{slot:req.body.startTime + "-" + req.body.endTime,status:req.body.status}]})
      //const slot = await User.findOne({email:req.body.email})
      .then((docs) => {
        if (docs) {
          doc = docs
          console.log({ "success": true, data: docs });
          bool = true;

        } else {
          console.log({ "success": false, data: "no such user exist" });
          bool = false;
          res.status(404)
            .json({
              title: 'Data not found',
              error: 'bool value false'
            });
          //console.log({email:req.body.email,slotValue: [{slot:req.body.startTime + "-" + req.body.endTime,status:req.body.status}]},"SLot value")
        }

      })
    var slotPos = -1;
    if (bool) {
      var Value = req.body.startTime;
      // var stat=req.body.book            
      for (i in doc.slotValue) {
        if (doc.slotValue[i].slot === Value) {
          slotPos = i;
          condition = "Slot value not free";
          break;
        }
      }
      if (slotPos != -1) {
        if (doc.slotValue[slotPos].book == true) {
          condition = "Slot already booked";
        } else {
          var newslot = { $set: { "slotValue.$.book": req.body.book } }
          console.log(JSON.stringify(newslot), "book")
          const second = await User.findOneAndUpdate({ email: req.body.email, 'slotValue.slot': req.body.startTime }, newslot);
          condition = "Booked";

        }
      } else {

        condition = "Slot not available";
      }


    }

  } catch (error) {

    res.status(401)
      .json({
        title: 'Not logged in or authenticated',
        error: error.message
      });
  }
  res.status(200).json({
    title: condition,
    slotValue: req.body.startTime,
    book: req.body.book
  });
});
module.exports = router;