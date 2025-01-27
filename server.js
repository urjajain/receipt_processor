const express = require('express');
const bodyParser = require('body-parser');
const uuid=require('uuid');
const app = express();
const PORT = 3000;
app.use(bodyParser.json());
const receipts_id_total=new Map();

function generateRandomID()
{
    const id=uuid.v4();
    return id;
}
function alphaNumeric(name)
{
//    console.log(name);
    let count=0;
    for(let i=0; i<name.length; i++)
    {
        if((name.at(i)>='0' && name.at(i)<='9') || (name.at(i)>='a' && name.at(i)<='z') || (name.at(i)>='A' && name.at(i)<='Z'))
        {
            count++;
        }
    }
    return count;
}
function roundDollarPoints(total)
{
    if(total.at(total.length-1)=='0' && total.at(total.length-2)=='0')
    {
        return true;
    }
    return false;
}
function itemsLengthPoints(items)
{
    let count=0;
    items.forEach(item=>
    {
        if(item.shortDescription.trim().length%3===0)
        {
            count=count+Math.ceil(parseFloat(item.price)*0.2);
        }
    });
    return count;
}
function calculatePoints(retailer, purchaseDate, purchaseTime, items, total)
{
    let points=0;
//    console.log(retailer);
//One point for every alphanumeric character in the retailer name.
    points=points+alphaNumeric(retailer);
    console.log("Name points=",points);
    //50 points if the total is a round dollar amount with no cents.
    if(roundDollarPoints(total))
    {
        points=points+50;
    }
    console.log(" round dollar amount with no cents=",points);
    //25 points if the total is a multiple of 0.25.
    if(parseFloat(total)%0.25 === 0)
    {
        points=points+25;
    }
    console.log(" total is a multiple of 0.25=",points);
    //5 points for every two items on the receipt.
    points=points+((Math.floor((items.length)/2))*5)
    console.log("5 points for every two items on the receipt=", points);
    //If the trimmed length of the item description is a multiple of 3,
    //multiply the price by 0.2 and round up to the nearest integer.
    //The result is the number of points earned.
    points=points+itemsLengthPoints(items);
    console.log("trimmed length of the item description=", points);
    const dayOfPurchase=new Date(purchaseDate).getDay();
    //6 points if the day in the purchase date is odd.
    if (dayOfPurchase % 2 === 1) {
        points=points+6;
      }
    console.log("purchase date is odd=", points);
    //10 points if the time of purchase is after 2:00pm and before 4:00pm.
    const time=parseInt(purchaseTime.at(0))*10+parseInt(purchaseTime.at(1));
    console.log("hour=",time);
    if(time>=14 && time<16)
    {
    points=points+10;
    }
    console.log("purchase is after 2:00pm and before 4:00pm=", points);
    return points;
}

app.post('/receipts/process', (req, res)=>
{


  const { retailer, purchaseDate, purchaseTime, items, total}=req.body;
  // case when there is error in response
  if(!retailer || !purchaseDate || !purchaseTime || !items || items.length === 0 || !Array.isArray(items) )
  {
    res.status(404).json({ error: 'Please verify input.' });
  }
  const receipt_id=generateRandomID();
  if(receipts_id_total.has(receipt_id))
  {
    receipt_id=generateRandomID();
  }
    let points=0;

    points=calculatePoints( retailer, purchaseDate, purchaseTime, items, total);
    receipts_id_total.set(receipt_id, points);
    res.status(200).json({receipt_id});
});

app.get('/receipts/:receipt_id/points', (req, res)=>
{
    const {receipt_id}= req.params;
//    console.log(receipt_id);
    if(!receipts_id_total.has(receipt_id))
    {
     res.status(404).json({error: 'No receipt found for that ID: '+receipt_id})
    }
    const value=receipts_id_total.get(receipt_id);
    res.status(200).json({value});
});
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
